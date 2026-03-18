import Link from "next/link";
import QuoteWidget from "@/components/quotes/QuoteWidget";
import WalletConnect from "@/components/wallet/WalletConnect";

export const metadata = {
  title: "On-Ramp to sBTC | weRamp",
  description:
    "Get the best real-time quotes to instantly buy sBTC with no mandatory KYC.",
};

export default function OnrampPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505] font-sans selection:bg-primary/30 selection:text-white">
      {/* Simple Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="w-8 h-8 rounded bg-linear-to-br from-primary to-primary-dark flex items-center justify-center font-bold text-black logo-icon">
              W
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              we<span className="text-gradient">Ramp</span>
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <WalletConnect />
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[150px] opacity-50 mix-blend-screen pointer-events-none z-0"></div>

        <div className="container mx-auto px-4 relative z-10 block">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
              Instant Fiat to sBTC
            </h1>
            <p className="text-zinc-400 max-w-lg mx-auto text-lg leading-relaxed">
              We aggregate the market to find you the lowest fees and fastest
              routes without mandatory KYC checks.
            </p>
          </div>

          <div className="block">
            <QuoteWidget />
          </div>

          <div className="mt-16 max-w-2xl mx-auto text-center border-t border-white/5 pt-12 animate-fade-in">
            <h3 className="text-xl inline-flex items-center gap-2 font-medium text-white mb-4">
              <svg
                className="w-5 h-5 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              How Bridging Works
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              When converting natively through MVP providers, most deliver
              Bitcoin (<span className="text-white">BTC</span>). To ensure you
              get <span className="text-primary font-medium">sBTC</span>{" "}
              instantly and trustlessly into your Stacks wallet, we
              automatically prepare the routing through the official Stacks sBTC
              peg process as soon as your quote gets filled. Ensure you have
              your Leather or Xverse wallet connected.
            </p>
            <div className="inline-flex items-center justify-center p-1 rounded-full bg-white/5 border border-white/10">
              <span className="px-4 py-1.5 text-xs text-zinc-300 font-medium whitespace-nowrap">
                Fiat
              </span>
              <svg
                className="w-3 h-3 text-zinc-600 mx-1 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium text-xs whitespace-nowrap">
                <div className="w-3.5 h-3.5 bg-orange-500 text-black rounded-full flex items-center justify-center text-[8px] font-bold">
                  ₿
                </div>
                Native BTC
              </div>
              <svg
                className="w-3 h-3 text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-xs whitespace-nowrap">
                <div className="w-3.5 h-3.5 bg-primary text-black rounded-full flex items-center justify-center text-[8px] font-bold">
                  ₿
                </div>
                Stacks sBTC
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
