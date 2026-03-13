import Link from 'next/link';
export default function HeroSection() {
  return (
    <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50 mix-blend-screen pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] opacity-40 mix-blend-screen pointer-events-none"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-zinc-300 animate-fade-in mb-8">
          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          Now supporting 30+ global payment methods
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          Seamless Fiat to sBTC,<br className="hidden md:block" />
          <span className="text-gradient">Without the Friction.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          The premier non-custodial on-ramp aggregator for the Stacks ecosystem. Get the best rates with no mandatory KYC for small purchases.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <Link href="/onramp" className="btn-primary w-full sm:w-auto px-8 py-4 text-lg">
            Buy sBTC Now
          </Link>
          <a href="#features" className="btn-secondary w-full sm:w-auto px-8 py-4 text-lg">
            Explore Features
          </a>
        </div>
      </div>
    </section>
  );
}
