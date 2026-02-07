
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, Store, CreditCard, ShieldCheck, 
  ArrowRight, Loader2, Info, Building, Lock, 
  Camera, Upload, Sparkles, AlertCircle, ChevronLeft,
  FileText, PenTool, HandMetal, Shield, AlertTriangle
} from 'lucide-react';
import { User } from '../types';
import { profilesService } from '../services/profiles';

interface SellerOnboardingProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const SellerOnboarding: React.FC<SellerOnboardingProps> = ({ user, onUpdateUser }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const navigate = useNavigate();

  const [onboardingData, setOnboardingData] = useState({
    shop_name: user.shop_name || '',
    routing_number: '',
    account_number: '',
    id_image: ''
  });

  const steps = [
    { id: 1, label: 'Shop Identity', icon: Store },
    { id: 2, label: 'Identity Check', icon: ShieldCheck },
    { id: 3, label: 'Payout Details', icon: CreditCard },
    { id: 4, label: 'Artisan Pledge', icon: PenTool }
  ];

  const handleNext = async () => {
    if (step < 4) {
      setIsLoading(true);
      setTimeout(() => {
        setStep(step + 1);
        setIsLoading(false);
        window.scrollTo(0, 0);
      }, 800);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!hasAgreed) return;
    setIsLoading(true);
    try {
      const lastFour = onboardingData.account_number.slice(-4);
      const updates = {
        onboarding_completed: true,
        verification_status: 'pending' as const,
        bank_last_four: lastFour,
        shop_name: onboardingData.shop_name,
        seller_declaration_signed: true
      };

      await profilesService.updateProfile(user.id, updates);
      onUpdateUser({ ...user, ...updates });
      
      navigate('/seller');
    } catch (err) {
      alert("Failed to finalize onboarding. Please check your data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-6 py-20 transition-colors duration-500">
      
      <div className="max-w-3xl w-full space-y-12">
        {/* Progress Timeline */}
        <div className="flex items-center justify-between relative px-4">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-200 dark:bg-stone-800 -translate-y-1/2 z-0" />
          {steps.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${
                  step >= s.id 
                  ? 'bg-brand-600 border-brand-100 dark:border-stone-800 text-white shadow-xl shadow-brand-500/20' 
                  : 'bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 text-stone-300'
                }`}
              >
                {step > s.id ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${step >= s.id ? 'text-brand-600' : 'text-stone-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-white dark:bg-stone-900 rounded-[3rem] shadow-2xl border border-stone-100 dark:border-stone-800 p-8 md:p-14 space-y-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles className="w-32 h-32 text-brand-500" />
          </div>

          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="space-y-3">
                <h2 className="text-4xl font-black serif italic dark:text-stone-50">Artisan Studio Identity</h2>
                <p className="text-stone-500 dark:text-stone-400 font-medium">Your shop name is your digital storefront. Make it memorable.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">Proposed Shop Name</label>
                <div className="relative group">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 group-focus-within:text-brand-600 transition-colors" />
                  <input 
                    type="text" 
                    className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-transparent focus:border-brand-500 rounded-2xl py-4 pl-12 pr-4 outline-none dark:text-stone-50 font-black text-xl transition-all" 
                    placeholder="e.g. Lumina Ceramics"
                    value={onboardingData.shop_name}
                    onChange={(e) => setOnboardingData({...onboardingData, shop_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="p-6 bg-brand-50/50 dark:bg-brand-900/10 rounded-2xl border border-brand-100 dark:border-brand-900/30 flex items-start gap-4">
                <Info className="w-5 h-5 text-brand-600 mt-0.5" />
                <p className="text-xs text-brand-700 dark:text-brand-400 font-medium leading-relaxed italic">
                  "Artisans with clear, unique shop names see 35% higher repeat customer rates."
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="space-y-3">
                <h2 className="text-4xl font-black serif italic dark:text-stone-50">Identity Verification</h2>
                <p className="text-stone-500 dark:text-stone-400 font-medium">We verify every seller to maintain the integrity of our handmade community.</p>
              </div>

              <div className="space-y-6">
                <div className="aspect-video bg-stone-50 dark:bg-stone-800 rounded-[2.5rem] border-4 border-dashed border-stone-200 dark:border-stone-800 flex flex-col items-center justify-center gap-6 group hover:border-brand-500 transition-all cursor-pointer">
                  <div className="p-5 bg-white dark:bg-stone-900 rounded-3xl shadow-lg group-hover:scale-110 transition-transform">
                    <Camera className="w-10 h-10 text-brand-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 group-hover:text-stone-600">Scan Government ID</p>
                    <p className="text-[9px] text-stone-300 mt-1 uppercase">Passport, Driver's License, or National ID</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-stone-400">
                  <div className="h-px flex-1 bg-stone-100 dark:bg-stone-800" />
                  Or upload file
                  <div className="h-px flex-1 bg-stone-100 dark:bg-stone-800" />
                </div>

                <button className="w-full py-4 border-2 border-stone-100 dark:border-stone-800 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all">
                  <Upload className="w-4 h-4" /> Select PDF or Image
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="space-y-3">
                <h2 className="text-4xl font-black serif italic dark:text-stone-50">Payout Portal</h2>
                <p className="text-stone-500 dark:text-stone-400 font-medium">Configure where your earnings will be deposited. Securely handled via our banking partner.</p>
              </div>

              <div className="bg-stone-50 dark:bg-stone-800/50 p-8 rounded-[2.5rem] space-y-6 border border-stone-100 dark:border-stone-800">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">Bank Routing Number</label>
                  <div className="relative group">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 group-focus-within:text-brand-600 transition-colors" />
                    <input 
                      type="text" 
                      className="w-full bg-white dark:bg-stone-900 border-2 border-stone-100 dark:border-stone-800 focus:border-brand-500 rounded-2xl py-4 pl-12 pr-4 outline-none dark:text-stone-50 font-black text-lg transition-all" 
                      placeholder="9-digit number"
                      maxLength={9}
                      value={onboardingData.routing_number}
                      onChange={(e) => setOnboardingData({...onboardingData, routing_number: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">Account Number</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 group-focus-within:text-brand-600 transition-colors" />
                    <input 
                      type="password" 
                      className="w-full bg-white dark:bg-stone-900 border-2 border-stone-100 dark:border-stone-800 focus:border-brand-500 rounded-2xl py-4 pl-12 pr-4 outline-none dark:text-stone-50 font-black text-lg transition-all" 
                      placeholder="Secure Account ID"
                      value={onboardingData.account_number}
                      onChange={(e) => setOnboardingData({...onboardingData, account_number: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-2xl border border-green-100 dark:border-green-900/30 flex items-center gap-3">
                <Lock className="w-5 h-5 text-green-600" />
                <span className="text-[10px] font-black text-green-700 dark:text-green-500 uppercase tracking-widest">End-to-End Encrypted Transfer</span>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="space-y-3">
                <h2 className="text-4xl font-black serif italic dark:text-stone-50">Artisan Integrity Pledge</h2>
                <p className="text-stone-500 dark:text-stone-400 font-medium">By joining this marketplace, you commit to our community standards of authenticity and craftsmanship.</p>
              </div>

              <div className="bg-stone-50 dark:bg-stone-800/50 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 overflow-hidden">
                <div className="p-8 space-y-6">
                  <div className="flex gap-4">
                    <div className="p-2 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-lg h-fit">
                      <HandMetal className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm dark:text-stone-50">Maker's Certificate</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed italic font-serif">
                        "I certify that all products I list are made by me or my small team, and not mass-produced."
                      </p>
                      <p className="text-[9px] font-black text-brand-600 uppercase tracking-widest mt-2">Required: 70%+ Handmade production</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="p-2 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-lg h-fit">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm dark:text-stone-50">Enforcement Agreement</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                        I acknowledge that misrepresentation of mass-produced items results in <strong>suspension</strong>, <strong>permanent bans</strong>, or <strong>loss of payout</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="p-2 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-lg h-fit">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm dark:text-stone-50">Verified Commitment</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                        I have read and agree to the <Link to="/terms" target="_blank" className="text-brand-600 underline">Marketplace Integrity Terms</Link>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-50 dark:bg-brand-900/10 p-8 border-t border-stone-100 dark:border-stone-800">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="peer hidden" 
                        checked={hasAgreed}
                        onChange={(e) => setHasAgreed(e.target.checked)}
                      />
                      <div className="w-6 h-6 border-2 border-stone-300 dark:border-stone-700 rounded-lg flex items-center justify-center peer-checked:bg-brand-600 peer-checked:border-brand-600 transition-all">
                        <CheckCircle2 className={`w-4 h-4 text-white transition-opacity ${hasAgreed ? 'opacity-100' : 'opacity-0'}`} />
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-900 dark:text-stone-50 group-hover:text-brand-600 transition-colors">I certify my products are handmade and I accept all penalties for misrepresentation</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest leading-relaxed">This self-certification is displayed on your public profile to build buyer trust.</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 pt-10">
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="px-8 border-2 border-stone-100 dark:border-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-stone-50 rounded-2xl transition-all font-black uppercase text-xs tracking-widest flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={handleNext}
              disabled={isLoading || (step === 1 && !onboardingData.shop_name) || (step === 3 && !onboardingData.account_number) || (step === 4 && !hasAgreed)}
              className="flex-1 bg-stone-900 dark:bg-brand-600 text-white font-black py-5 rounded-3xl hover:bg-brand-500 transition-all shadow-2xl flex items-center justify-center gap-4 uppercase text-xs tracking-[0.25em] active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : step === 4 ? 'Confirm & Finalize' : 'Continue Journey'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-brand-600 transition-colors mx-auto block"
        >
          Cancel and return to marketplace
        </button>
      </div>
    </div>
  );
};

export default SellerOnboarding;
