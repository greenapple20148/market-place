
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Upload, Save, X, Loader2, Sparkles, 
  Image as ImageIcon, DollarSign, Tag, Layers, 
  CheckCircle2, Info, FileImage, AlertCircle, RefreshCw,
  Plus, Trash2, ChevronRight, LayoutGrid, Star, Crop as CropIcon, ZoomIn, Scissors,
  ShieldCheck, Shield, AlertTriangle, Search
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import { productsService } from '../services/products';
import { storageService } from '../services/storage';
import { analyzeProductForModeration, scanImageForIntegrity } from '../services/gemini';
import { Category, Product, User, ModerationLog } from '../types';
import getCroppedImg from '../utils/imageProcess';

interface ProductFormProps {
  user: User;
}

interface CropQueueItem {
  file: File;
  url: string;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const ProductForm: React.FC<ProductFormProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [cropQueue, setCropQueue] = useState<CropQueueItem[]>([]);
  const [currentCropItem, setCurrentCropItem] = useState<CropQueueItem | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Tracks logs generated during this session's scans
  const [sessionLogs, setSessionLogs] = useState<ModerationLog[]>([]);
  const [wasFlagged, setWasFlagged] = useState(false);

  const [formData, setFormData] = useState<Partial<Product>>({
    title: '',
    description: '',
    price: 0,
    category: Category.Craft,
    images: [],
    tags: [],
    declared_handmade: true
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      productsService.getProductById(id).then(product => {
        if (product) {
          setFormData(product);
        } else {
          navigate('/seller');
        }
        setIsLoading(false);
      });
    }
  }, [id, isEdit, navigate]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files) as File[];
    const newQueueItems = fileList.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));

    setCropQueue(prev => [...prev, ...newQueueItems]);
    if (!currentCropItem) {
      setCurrentCropItem(newQueueItems[0]);
    }
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApplyCrop = async () => {
    if (!currentCropItem || !croppedAreaPixels) return;
    setUploadError(null);

    try {
      const croppedBlob = await getCroppedImg(currentCropItem.url, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Cropping failed");

      // AI Image Integrity Scan
      setIsScanning(true);
      const base64ForScan = await blobToBase64(croppedBlob);
      const scanResult = await scanImageForIntegrity(base64ForScan, 'image/jpeg');
      setIsScanning(false);

      const log: ModerationLog = {
        timestamp: new Date().toISOString(),
        type: 'ai_scan',
        status: scanResult.safe ? (scanResult.flagged ? 'flagged' : 'passed') : 'rejected',
        reason: scanResult.reason
      };
      setSessionLogs(prev => [...prev, log]);

      if (!scanResult.safe) {
        setUploadError(`AI Integrity Rejection: ${scanResult.reason || 'Image violates safety standards.'}`);
        cancelCrop();
        return;
      }

      if (scanResult.flagged) {
        setWasFlagged(true);
      }

      setIsUploading(true);
      const croppedFile = new File([croppedBlob], `cropped-${currentCropItem.file.name}`, { type: 'image/jpeg' });
      const url = await storageService.uploadProductImage(croppedFile, (p) => setUploadProgress(p));
      
      setFormData(prev => ({ 
        ...prev, 
        images: [...(prev.images || []), url] 
      }));

      URL.revokeObjectURL(currentCropItem.url);
      const nextQueue = cropQueue.slice(1);
      setCropQueue(nextQueue);
      if (nextQueue.length > 0) {
        setCurrentCropItem(nextQueue[0]);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      } else {
        setCurrentCropItem(null);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Processing failed.');
    } finally {
      setIsUploading(false);
      setIsScanning(false);
      setUploadProgress(0);
    }
  };

  const cancelCrop = () => {
    if (currentCropItem) URL.revokeObjectURL(currentCropItem.url);
    const nextQueue = cropQueue.slice(1);
    setCropQueue(nextQueue);
    if (nextQueue.length > 0) {
      setCurrentCropItem(nextQueue[0]);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } else {
      setCurrentCropItem(null);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, idx) => idx !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.images || formData.images.length === 0) {
      setUploadError("Image required.");
      return;
    }

    setIsSaving(true);
    try {
      const modResult = await analyzeProductForModeration(formData.title || '', formData.description || '');
      
      const combinedLogs = [...(formData.moderation_logs || []), ...sessionLogs];
      if (modResult.isLikelyMassProduced) {
        combinedLogs.push({
          timestamp: new Date().toISOString(),
          type: 'ai_scan',
          status: 'flagged',
          reason: modResult.reason,
          confidence: modResult.confidenceScore
        });
      }

      const isManualRequired = modResult.isLikelyMassProduced || wasFlagged;

      const payload = {
        ...formData,
        seller_name: user.name,
        seller_id: user.id,
        moderation_status: isManualRequired ? 'pending_review' : 'approved',
        moderation_reason: isManualRequired ? (modResult.isLikelyMassProduced ? modResult.reason : "Image flagged for suspicious quality.") : null,
        moderation_logs: combinedLogs
      } as Product;

      if (isEdit && id) {
        await productsService.updateProduct(id, payload);
      } else {
        await productsService.createProduct(payload);
      }

      setShowSuccess(true);
      setTimeout(() => navigate('/seller'), 1500);
    } catch (err) {
      console.error(err);
      alert("Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand-600" /></div>;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-32 transition-colors">
      {/* Crop Modal */}
      {currentCropItem && (
        <div className="fixed inset-0 z-[100] bg-stone-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="max-w-4xl w-full bg-white dark:bg-stone-900 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col h-[80vh]">
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <h3 className="text-xl font-black serif italic dark:text-stone-50">Refine Composition</h3>
              <button onClick={cancelCrop} className="p-2 dark:text-stone-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 relative bg-stone-100 dark:bg-stone-950">
              <Cropper image={currentCropItem.url} crop={crop} zoom={zoom} aspect={4 / 5} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
            </div>
            <div className="p-8 space-y-8 bg-white dark:bg-stone-900">
              <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-1.5 accent-brand-600" />
              <div className="flex gap-4">
                <button onClick={cancelCrop} className="flex-1 py-4 border-2 border-stone-100 dark:border-stone-800 rounded-2xl text-[10px] font-black uppercase text-stone-400">Skip</button>
                <button onClick={handleApplyCrop} disabled={isUploading || isScanning} className="flex-[2] bg-brand-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl flex items-center justify-center gap-3">
                  {isScanning ? <Shield className="w-4 h-4 animate-pulse" /> : isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isScanning ? "Scanning..." : isUploading ? `Syncing ${uploadProgress}%` : "Apply & Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to="/seller" className="text-stone-400"><ArrowLeft className="w-6 h-6" /></Link>
            <h1 className="text-xl font-black serif italic dark:text-stone-50">{isEdit ? 'Refine Listing' : 'Manifest New Work'}</h1>
          </div>
          <button onClick={handleSubmit} disabled={isSaving || isUploading || isScanning || cropQueue.length > 0} className="bg-stone-900 dark:bg-brand-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase shadow-xl flex items-center gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Publish
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-stone-900 p-8 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-xl space-y-6">
              <input type="text" className="w-full bg-stone-50 dark:bg-stone-800 rounded-2xl p-4 text-xl font-black outline-none dark:text-stone-50" placeholder="Product Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <textarea className="w-full bg-stone-50 dark:bg-stone-800 rounded-2xl p-4 h-48 outline-none dark:text-stone-50" placeholder="Narrative Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              <input type="number" className="w-full bg-stone-50 dark:bg-stone-800 rounded-2xl p-4 font-black text-xl outline-none dark:text-stone-50" placeholder="Price" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} />
            </section>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <section className="bg-white dark:bg-stone-900 p-8 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-xl">
              <h3 className="font-black serif italic dark:text-stone-50 mb-4">Gallery</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {formData.images?.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden shadow-md">
                    <img src={img} className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => fileInputRef.current?.click()} className="aspect-square bg-stone-50 dark:bg-stone-800 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl flex flex-col items-center justify-center text-stone-300">
                  <Plus className="w-6 h-6" />
                </button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
              {uploadError && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs">{uploadError}</div>}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductForm;
