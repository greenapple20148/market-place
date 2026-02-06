
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, Sparkles, CheckCircle2, ChevronLeft, AlertCircle, Clock } from 'lucide-react';
import { authService } from '../services/auth';
import { User } from '../types';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  // Google SSO Initialization
  useEffect(() => {
    /* global google */
    const google = (window as any).google;
    if (google && mode !== 'forgot') {
      google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // Replace with a real Client ID
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      const buttonDiv = document.getElementById("googleSignInButton");
      if (buttonDiv) {
        google.accounts.id.renderButton(
          buttonDiv,
          { 
            theme: "outline", 
            size: "large", 
            width: "100%",
            shape: "pill",
            logo_alignment: "left",
            text: mode === 'login' ? "signin_with" : "signup_with"
          }
        );
      }
    }
  }, [mode]);

  const handleGoogleResponse = async (response: any) => {
    setIsLoading(true);
    try {
      const user = await authService.loginWithGoogle(response.credential);
      onLogin(user);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Google Sign-In failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setIsRateLimited(false);
    setSuccessMessage('');

    try {
      if (mode === 'login') {
        const user = await authService.login(formData.email, formData.password);
        onLogin(user);
        navigate(from, { replace: true });
      } else if (mode === 'signup') {
        const user = await authService.signup(formData.name, formData.email, formData.password);
        onLogin(user);
        navigate(from, { replace: true });
      } else if (mode === 'forgot') {
        await authService.resetPassword(formData.email);
        setSuccessMessage('Recovery link dispatched. Please inspect your inbox.');
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed.';
      setError(msg);
      if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('cooldown')) {
        setIsRateLimited(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-stone-100 dark:border-stone-800">
        
        {/* Brand Side */}
        <div className="md:w-1/2 bg-stone-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <Sparkles className="absolute -top-12 -right-12 w-48 h-48 text-brand-500/10 rotate-12" />
          
          <div className="relative z-10">
            <span className="text-2xl font-black text-brand-500 tracking-tighter">MARKET<span className="text-white">PLACE</span></span>
            <h1 className="text-4xl font-black mt-12 leading-tight serif italic">
              {mode === 'login' ? "Welcome back to the maker's hub." : 
               mode === 'signup' ? "Join our community of extraordinary creators." : 
               "Recover your portal access."}
            </h1>
            <p className="mt-6 text-stone-400 leading-relaxed font-medium">
              Discover unique treasures and support independent artisans from around the globe.
            </p>
          </div>

          <div className="mt-12 space-y-4 relative z-10">
            <div className="flex items-center gap-3 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-brand-500" />
              <span>Secure checkout & data protection</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-brand-500" />
              <span>Direct support for independent shops</span>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="md:w-1/2 p-8 md:p-14">
          <div className="mb-8">
            {mode === 'forgot' && (
              <button 
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-stone-400 hover:text-brand-600 transition-colors mb-4"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Login
              </button>
            )}
            <h2 className="text-2xl font-black text-stone-900 dark:text-stone-50 serif">
              {mode === 'login' ? "Sign In" : mode === 'signup' ? "Create Account" : "Reset Access"}
            </h2>
            <p className="text-stone-500 dark:text-stone-400 mt-2 font-medium">
              {mode === 'login' ? "Enter your details to access your account." : 
               mode === 'signup' ? "Start your journey as a buyer or seller today." : 
               "We'll send a magic link to your registered email address."}
            </p>
          </div>

          {error && (
            <div className={`mb-6 p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${
              isRateLimited 
              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-500 border-amber-100 dark:border-amber-900/30' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
            }`}>
              {isRateLimited ? <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest">{isRateLimited ? 'Cooldown Active' : 'Access Error'}</p>
                <p className="text-xs font-medium leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-black rounded-2xl border border-green-100 dark:border-green-900/30 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Full Identity</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 group-focus-within:text-brand-600 transition-colors" />
                  <input
                    type="text"
                    required
                    className="w-full bg-stone-50 dark:bg-stone-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all dark:text-stone-50 font-medium"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Email Channel</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 group-focus-within:text-brand-600 transition-colors" />
                <input
                  type="email"
                  required
                  className="w-full bg-stone-50 dark:bg-stone-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all dark:text-stone-50 font-medium"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Secret Key</label>
                  {mode === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setMode('forgot');
                        setError('');
                      }}
                      className="text-[10px] font-black uppercase text-brand-600 hover:underline"
                    >
                      Lost access?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 group-focus-within:text-brand-600 transition-colors" />
                  <input
                    type="password"
                    required
                    className="w-full bg-stone-50 dark:bg-stone-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all dark:text-stone-50 font-medium"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-stone-900 dark:bg-brand-600 text-white font-black py-4.5 rounded-2xl hover:bg-brand-600 dark:hover:bg-brand-500 transition-all flex items-center justify-center gap-2 shadow-2xl mt-6 uppercase text-xs tracking-[0.2em] active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? "Enter Marketplace" : mode === 'signup' ? "Begin Journey" : "Dispatch Reset Link"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* SSO Section */}
          {mode !== 'forgot' && (
            <div className="mt-8 space-y-6">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-stone-100 dark:border-stone-800"></div>
                <span className="flex-shrink mx-4 text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Or use social</span>
                <div className="flex-grow border-t border-stone-100 dark:border-stone-800"></div>
              </div>

              <div id="googleSignInButton" className="w-full flex justify-center"></div>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-stone-100 dark:border-stone-800 text-center">
            <p className="text-stone-500 dark:text-stone-400 text-xs font-medium">
              {mode === 'login' ? "New here?" : mode === 'signup' ? "Already part of the community?" : "Remembered your key?"}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError('');
                  setIsRateLimited(false);
                }}
                className="ml-2 font-black text-brand-600 hover:underline uppercase text-[10px] tracking-widest"
              >
                {mode === 'login' ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
