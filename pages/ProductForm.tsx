
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Upload, Save, X, Loader2, Sparkles, 
  Image as ImageIcon, DollarSign, Tag, Layers, 
  CheckCircle2, Info, FileImage, AlertCircle
} from 'lucide-react';
import { productsService } from '../services/products';
import { storageService } from '../services/storage';
import { Category, Product, User } from '../types';

interface ProductFormProps {
  user: User;
}

const ProductForm: React.FC<ProductFormProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState<Partial<Product>>({
    title: '',
    description: '',
    price: 0,
    category: Category.Craft,
    image: '',
    tags: []
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
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, WEBP, AVIF).');
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const url = await storageService.uploadProductImage(file, (p) => setUploadProgress(p));
      setFormData(prev => ({ ...prev, image: url }));
    } catch (err) {
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...(formData.tags || []), tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tagToRemove) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert("Please upload an image for your listing.");
      return;
    }
    
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        seller: user.name,
        rating: formData.rating || 5,
        reviews: formData.reviews || 0,
        image: formData.image
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
      alert("Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-32">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 sticky top-0 z-40 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-6">
              <Link 
                to="/seller" 
                className="p-2.5 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-2xl transition-colors text-stone-400 hover:text-stone-900 dark:hover:text-stone-50"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-xl font-black serif italic dark:text-stone-50">
                  {isEdit ? 'Refine Listing' : 'Manifest New Work'}
                </h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                  {isEdit ? 'Updating your marketplace presence' : 'Creating a new unique treasure'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/seller')}
                className="px-6 py-2.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-50 font-black text-[10px] uppercase tracking-widest transition-colors"
              >
                Discard
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSaving || isUploading}
                className="bg-stone-900 dark:bg-brand-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-brand-600 dark:hover:bg-brand-500 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isEdit ? 'Save Changes' : 'Publish Piece'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showSuccess && (
          <div className="mb-8 p-6 bg-green-50 dark:bg-green-950/20 border-2 border-green-100 dark:border-green-900/30 rounded-[2rem] flex items-center gap-4 text-green-700 dark:text-green-500 animate-in zoom-in-95 duration-500">
            <CheckCircle2 className="w-8 h-8" />
            <div>
              <p className="font-black text-lg">Listing Successfully {isEdit ? 'Updated' : 'Created'}!</p>
              <p className="text-sm font-medium opacity-80">Returning you to your studio hub...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form Side */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-stone-900 p-8 md:p-12 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-xl space-y-10">
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">Masterpiece Title</label>
                  <input 
                    type="text" 
                    className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-transparent focus:border-brand-500 rounded-2xl p-4 outline-none dark:text-stone-50 text-xl font-black placeholder:text-stone-300 dark:placeholder:text-stone-700 transition-all" 
                    placeholder="Enter the name of your creation"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">The Story Behind the Piece</label>
                  <textarea 
                    className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-transparent focus:border-brand-500 rounded-2xl p-4 outline-none dark:text-stone-50 font-medium h-48 resize-none placeholder:text-stone-300 transition-all" 
                    placeholder="Describe the materials, inspiration, and process..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">Listing Price (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input 
                        type="number" 
                        step="0.01"
                        className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-transparent focus:border-brand-500 rounded-2xl py-4 pl-10 pr-4 outline-none dark:text-stone-50 font-black transition-all" 
                        placeholder="0.00"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">Curated Category</label>
                    <div className="relative">
                      <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <select 
                        className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-transparent focus:border-brand-500 rounded-2xl py-4 pl-10 pr-4 outline-none dark:text-stone-50 font-black transition-all appearance-none"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                      >
                        {Object.values(Category).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-stone-50 dark:border-stone-800">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">Search Tags</label>
                  <div className="flex flex-wrap gap-2 p-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border-2 border-transparent focus-within:border-brand-500 transition-all">
                    {formData.tags?.map(tag => (
                      <span key={tag} className="flex items-center gap-2 bg-white dark:bg-stone-900 text-[10px] font-black px-3 py-1.5 rounded-xl border border-stone-100 dark:border-stone-700 text-stone-600 dark:text-stone-400">
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="text-stone-300 hover:text-red-500"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      className="bg-transparent outline-none text-xs font-bold p-1 min-w-[120px] dark:text-stone-50" 
                      placeholder="Add tag and press Enter..."
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Media & Upload Side */}
          <div className="space-y-8">
            <section className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-xl space-y-6">
              <h3 className="text-lg font-black dark:text-stone-50 serif">Visual Manifestation</h3>
              
              <div 
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`relative aspect-square rounded-[2rem] overflow-hidden bg-stone-50 dark:bg-stone-800 border-2 border-dashed transition-all flex flex-col items-center justify-center group cursor-pointer ${
                  formData.image ? 'border-transparent' : 'border-stone-200 dark:border-stone-700 hover:border-brand-500'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg,image/png,image/webp,image/avif" 
                  onChange={handleFileSelect}
                />

                {isUploading ? (
                  <div className="absolute inset-0 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8 space-y-4">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-4 border-stone-100 dark:border-stone-800 rounded-full" />
                      <div 
                        className="absolute inset-0 border-4 border-brand-500 rounded-full transition-all duration-300" 
                        style={{ clipPath: `inset(${100 - uploadProgress}% 0 0 0)` }}
                      />
                      <Loader2 className="absolute inset-0 m-auto w-8 h-8 animate-spin text-brand-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900 dark:text-stone-50">Uploading to Storage</p>
                      <p className="text-xl font-black text-brand-600">{uploadProgress}%</p>
                    </div>
                  </div>
                ) : formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover animate-in fade-in duration-700" />
                ) : (
                  <div className="text-center p-8 space-y-4">
                    <div className="p-4 bg-white dark:bg-stone-900 rounded-full shadow-lg inline-block text-stone-300 group-hover:text-brand-500 transition-colors">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-stone-900 dark:text-stone-50 uppercase tracking-widest">Upload Primary Image</p>
                      <p className="text-[10px] text-stone-400 font-medium mt-1 uppercase tracking-wider">Drag & Drop or Click to browse</p>
                    </div>
                  </div>
                )}
                
                {formData.image && !isUploading && (
                  <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                     <button className="bg-white text-stone-900 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl">
                       <RefreshCw className="w-4 h-4" /> Change Image
                     </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-100 dark:border-stone-800">
                <AlertCircle className="w-5 h-5 text-stone-400" />
                <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
                  Supported: JPG, PNG, WEBP, AVIF. <br/>Max size: 5MB. For best results, use a 1:1 aspect ratio.
                </p>
              </div>

              <div className="p-4 bg-brand-50/50 dark:bg-brand-900/10 rounded-2xl border border-brand-100 dark:border-brand-900/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-brand-600 mt-1" />
                <p className="text-[10px] text-brand-900 dark:text-brand-400 font-medium leading-relaxed italic">
                  "High-quality photography with natural light increases conversion by up to 80%. Consider using a minimalist background."
                </p>
              </div>
            </section>

            <section className="bg-stone-900 p-8 rounded-[2.5rem] text-white space-y-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Tag className="w-20 h-20 rotate-12" /></div>
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-brand-500" />
                <h4 className="font-black text-sm uppercase tracking-widest">Market Advice</h4>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed font-medium">
                Sellers who include at least 5 tags see significantly more traffic from AI-driven search curation.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

// Update local icon imports
const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

export default ProductForm;
