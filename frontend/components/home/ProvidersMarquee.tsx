const PROVIDERS = [
  // { name: "TransFi", logo: "TransFi" },
  { name: "Mt Pelerin", logo: "MtPelerin" },
  { name: "Onramper", logo: "Onramper" },
  // { name: "MoonPay", logo: "MoonPay" },
  // { name: "Ramp", logo: "Ramp" },
  { name: "Transak", logo: "Transak" },
  { name: "Guardarian", logo: "Guardarian" },
];

export default function ProvidersMarquee() {
  return (
    <section className="py-12 border-y border-white/5 bg-black/20 overflow-hidden">
      <div className="container mx-auto px-4 mb-8 text-center">
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest">
          Aggregating the best providers
        </p>
      </div>

      <div className="relative flex w-full flex-nowrap overflow-hidden mask-[linear-gradient(to_right,transparent_0,black_128px,black_calc(100%-128px),transparent_100%)]">
        <div className="flex w-max animate-marquee items-center justify-center gap-16 py-4 pr-16">
          {PROVIDERS.map((provider, i) => (
            <div
              key={i}
              className="text-xl md:text-2xl font-bold text-zinc-600 grayscale opacity-70 transition-all hover:grayscale-0 hover:opacity-100 hover:text-white cursor-default"
            >
              {provider.logo}
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {PROVIDERS.map((provider, i) => (
            <div
              key={`dup-${i}`}
              className="text-xl md:text-2xl font-bold text-zinc-600 grayscale opacity-70 transition-all hover:grayscale-0 hover:opacity-100 hover:text-white cursor-default"
            >
              {provider.logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
