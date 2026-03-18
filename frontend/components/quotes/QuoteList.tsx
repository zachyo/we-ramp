"use client";

import { ProviderQuote } from "@/lib/aggregator";

interface QuoteListProps {
  quotes: ProviderQuote[];
  isLoading: boolean;
  parsedAmount: number;
  setSelectedProvider: (provider: ProviderQuote) => void;
}

export default function QuoteList({ quotes, isLoading, parsedAmount, setSelectedProvider }: QuoteListProps) {
  return (
    <div className="mb-2">
      <h4 className="text-sm font-medium text-zinc-400 mb-3 ml-1">Select best route</h4>
      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-glass/50 flex items-center justify-center rounded-xl">
            <div className="w-6 h-6 rounded-full border-t-2 border-primary animate-spin"></div>
          </div>
        )}
        {quotes.length === 0 && !isLoading && (
          <div className="text-center p-4 text-zinc-500 text-sm">Enter an amount to see routes.</div>
        )}
        {quotes.map((quote) => (
          <button
            key={quote.provider}
            disabled={!quote.available}
            onClick={() => setSelectedProvider(quote)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all group ${
              quote.available
                ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                : "bg-black/20 border-white/5 opacity-50 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold font-mono text-white">
                {quote.logoSymbol}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{quote.provider}</span>
                  {quote.badge && (
                    <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary uppercase">
                      {quote.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs text-zinc-500">
                  {quote.estimatedTime} • Return: {quote.amountOut} sBTC
                </span>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              {quote.noKyc && parsedAmount <= quote.kycThreshold && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 mb-1">
                  No-KYC
                </span>
              )}
              <span className="text-xs text-zinc-500 mt-1">Fee: ${quote.feeTotal.toFixed(2)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
