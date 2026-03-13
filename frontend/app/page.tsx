
import HeroSection from "@/components/HeroSection";
import ProvidersMarquee from "@/components/ProvidersMarquee";
import FeaturesSection from "@/components/FeaturesSection";
import WaitlistForm from "@/components/WaitlistForm";
import QuoteWidget from "@/components/QuoteWidget";
import WalletConnect from "@/components/WalletConnect";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505] font-sans selection:bg-primary/30 selection:text-white">
      {/* Simple Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-linear-to-br from-primary to-primary-dark flexItems-center justify-center font-bold text-black logo-icon">
              W
            </div>
            <span className="text-xl font-bold tracking-tight text-white">we<span className="text-gradient">Ramp</span></span>
          </div>
          <nav className="flex items-center gap-4">
            <a href="#features" className="hidden sm:block text-sm font-medium text-zinc-400 hover:text-white transition-colors">Features</a>
            <WalletConnect />
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-20">
        <HeroSection />
        
        <section id="quote-widget" className="py-12 relative z-20 -mt-10 lg:-mt-20">
          <div className="container mx-auto px-4">
            <QuoteWidget />
          </div>
        </section>

        <ProvidersMarquee />
        <FeaturesSection />

        <section id="waitlist" className="py-24 border-t border-white/5 bg-linear-to-b from-black to-[#0a0a0a]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">Join the Waitlist</h2>
            <p className="text-zinc-400 max-w-xl mx-auto mb-8">
              Be the first to know when we launch new provider integrations, rewards, and more features.
            </p>
            <div className="max-w-md mx-auto">
              <WaitlistForm />
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-white/5 py-12 bg-black text-center text-zinc-500 text-sm">
        <div className="container mx-auto px-4">
           <p>© {new Date().getFullYear()} weRamp. All rights reserved.</p>
           <div className="mt-4 flex justify-center gap-4">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
           </div>
        </div>
      </footer>
    </div>
  );
}
