
import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Scale, ShieldAlert, AlertTriangle, ShieldCheck, ArrowLeft, FileText, Ban, Trash2, Banknote } from 'lucide-react';

const LegalTerms: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors duration-500 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-brand-600 transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        <header className="space-y-4 mb-16">
          <div className="flex items-center gap-3 text-brand-600">
            <Gavel className="w-8 h-8" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Legal Framework</span>
          </div>
          <h1 className="text-5xl font-black text-stone-900 dark:text-stone-50 serif italic leading-tight">
            Artisan Standards & Marketplace Integrity
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-lg font-medium max-w-2xl">
            Our community is built on trust, transparency, and the celebration of human skill. These terms ensure the marketplace remains a sanctuary for genuine creators.
          </p>
        </header>

        <div className="space-y-12">
          {/* Section 1: Handmade Definition */}
          <section className="bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-xl overflow-hidden">
            <div className="p-10 md:p-14 space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-2xl">
                  <Scale className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black serif italic dark:text-stone-50">1. Definition of "Handmade"</h2>
              </div>
              
              <div className="prose prose-stone dark:prose-invert max-w-none space-y-6">
                <p className="text-xl font-black serif italic text-brand-700 dark:text-brand-500 leading-relaxed bg-brand-50 dark:bg-brand-900/10 p-8 rounded-[2rem] border-2 border-brand-100 dark:border-brand-900/20">
                  "Handmade means the item is made by the seller or their small team, with at least 70% of production completed by hand or using small-scale processes."
                </p>
                <div className="space-y-4 text-stone-600 dark:text-stone-400 font-medium">
                  <p>To qualify as handmade on our platform, the following criteria must be met:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>The seller must possess full knowledge of the production process and materials.</li>
                    <li>Items cannot be mass-produced in a factory setting where the seller has no direct oversight.</li>
                    <li>Assembled items must involve a significant creative transformation (more than just simple assembly of mass-produced components).</li>
                    <li>Vintage items must be at least 20 years old and accurately represented.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Enforcement & Penalties */}
          <section className="bg-stone-900 dark:bg-black text-white rounded-[3rem] shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Ban className="w-64 h-64" />
            </div>
            <div className="p-10 md:p-14 space-y-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 text-white rounded-2xl backdrop-blur-md">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black serif italic">2. Integrity Enforcement</h2>
              </div>

              <p className="text-stone-400 font-medium">
                Misrepresentation of mass-produced items as "handmade" undermines the livelihood of actual artisans. We maintain a zero-tolerance policy for deceptive practices.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 space-y-4">
                  <Trash2 className="w-8 h-8 text-amber-500" />
                  <h3 className="font-black text-xs uppercase tracking-widest">Listing Removal</h3>
                  <p className="text-[10px] text-stone-400 font-medium leading-relaxed">Suspected items will be removed immediately during investigation.</p>
                </div>
                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 space-y-4">
                  <Ban className="w-8 h-8 text-red-500" />
                  <h3 className="font-black text-xs uppercase tracking-widest">Shop Suspension</h3>
                  <p className="text-[10px] text-stone-400 font-medium leading-relaxed">Repeated violations result in permanent banning from the ecosystem.</p>
                </div>
                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 space-y-4">
                  <Banknote className="w-8 h-8 text-red-500" />
                  <h3 className="font-black text-xs uppercase tracking-widest">Loss of Payout</h3>
                  <p className="text-[10px] text-stone-400 font-medium leading-relaxed">Verified fraud leads to forfeiture of pending funds to compensate affected buyers.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Artisan Oath */}
          <section className="bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-xl overflow-hidden">
            <div className="p-10 md:p-14 space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black serif italic dark:text-stone-50">3. The Artisan's Oath</h2>
              </div>
              <p className="text-stone-600 dark:text-stone-400 font-medium leading-relaxed">
                By participating in the Marketplace, every seller takes a binding oath to uphold the dignity of craft. This is not just a policy; it is a promise to your fellow makers and every buyer who values the human touch.
              </p>
              <div className="flex justify-center pt-8">
                <Link 
                  to="/seller/onboarding" 
                  className="bg-stone-900 dark:bg-brand-600 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all"
                >
                  Confirm Compliance in Onboarding
                </Link>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-20 pt-12 border-t border-stone-200 dark:border-stone-800 text-center space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Marketplace Governance v2.4</p>
          <p className="text-xs text-stone-400 font-medium italic">"Creativity is the greatest form of rebellion against the mundane."</p>
        </footer>
      </div>
    </div>
  );
};

export default LegalTerms;
