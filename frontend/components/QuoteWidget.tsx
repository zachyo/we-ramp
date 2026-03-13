"use client";

import { useState, useEffect } from "react";
import { getQuotes, ProviderQuote } from "@/lib/aggregator";

const CURRENCIES = ["USD", "EUR", "GBP"];

export default function QuoteWidget() {
  const [amount, setAmount] = useState<string>("500");
  const [currency, setCurrency] = useState<string>("USD");
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [selectedProvider, setSelectedProvider] = useState<ProviderQuote | null>(null);
  
  const [quotes, setQuotes] = useState<ProviderQuote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const parsedAmount = parseFloat(amount) || 0;
  
  // The 'estimated' best amount out before selecting a specific route
  const bestAmountOut = quotes.length > 0 ? quotes[0].amountOut : 0;

  useEffect(() => {
    const fetchQuotes = async () => {
      if (parsedAmount > 0) {
        setIsLoading(true);
        try {
          const results = await getQuotes({ amount: parsedAmount, currency });
          setQuotes(results);
        } catch (error) {
          console.error("Failed to fetch quotes", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setQuotes([]);
      }
    };

    // Debounce to prevent rapid refetching on every keystroke
    const timerId = setTimeout(() => {
      fetchQuotes();
    }, 500);

    return () => clearTimeout(timerId);
  }, [parsedAmount, currency]);

  return (
    <div className="w-full max-w-lg mx-auto bg-glass-card rounded-4xl p-6 border border-white/10 shadow-2xl relative animate-fade-up overflow-hidden">
      {/* Background glow for the widget */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      {selectedProvider ? (
        <div className="flex flex-col h-full animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Complete Purchase</h3>
            <button 
              onClick={() => setSelectedProvider(null)}
              className="text-zinc-400 hover:text-white text-sm bg-white/5 px-3 py-1 rounded-full transition-colors"
            >
              ← Back
            </button>
          </div>
          
          <div className="p-4 bg-black/40 rounded-xl mb-4 border border-white/5 flex justify-between items-center text-sm">
            <div>
               <span className="text-zinc-400">Paying</span>
               <div className="text-white font-medium">{amount} {currency}</div>
            </div>
            <div className="text-right">
               <span className="text-zinc-400">Receiving (via Bridge)</span>
               <div className="text-primary font-medium">{selectedProvider.amountOut} sBTC</div>
            </div>
          </div>

          {/* Widget Embed Placeholder based on selected provider */}
          <div className="w-full h-[400px] bg-black/60 rounded-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/50 pointer-events-none"></div>
            <p className="text-zinc-500 font-medium mb-4">{selectedProvider.provider} Widget</p>
            <div className="w-12 h-12 rounded-full border-t-2 border-primary animate-spin"></div>
            <p className="text-xs text-zinc-600 mt-4 absolute bottom-4">Simulating iframe embed for {selectedProvider.provider}...</p>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          {/* Tabs */}
          <div className="flex p-1 bg-black/40 rounded-xl mb-6 border border-white/5">
            <button
              onClick={() => setTab("buy")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === "buy" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Buy
            </button>
            <button
              onClick={() => setTab("sell")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === "sell" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Sell
            </button>
          </div>

          {/* Amount Inputs */}
          <div className="space-y-4 mb-6">
            <div className="bg-black/40 rounded-2xl p-4 border border-white/5 transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
              <label className="text-xs text-zinc-500 font-medium mb-1 block">You pay</label>
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent text-3xl font-semibold text-white focus:outline-none w-full"
                  placeholder="0.00"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-white/10 text-white text-sm font-medium rounded-lg px-3 py-2 border-none focus:ring-0 cursor-pointer appearance-none ml-2"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c} className="bg-zinc-900">{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
              <label className="text-xs text-zinc-500 font-medium mb-1 block">You receive {tab === "buy" ? "(Estimated)" : ""}</label>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={parsedAmount > 0 ? bestAmountOut.toString() : "0.00"}
                  readOnly
                  className="bg-transparent text-3xl font-semibold text-white focus:outline-none w-full"
                />
                <div className="bg-white/5 text-white flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2 border border-white/5">
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-[10px]">₿</div>
                  sBTC
                </div>
              </div>
            </div>
          </div>

          {/* Quotes Section */}
          <div className="mb-2">
            <h4 className="text-sm font-medium text-zinc-400 mb-3 ml-1">Select best route</h4>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar relative">
              {isLoading && (
                 <div className="absolute inset-0 z-10 bg-glass/50 flex items-center justify-center rounded-xl">
                   <div className="w-6 h-6 rounded-full border-t-2 border-primary animate-spin"></div>
                 </div>
              )}
              {quotes.length === 0 && !isLoading && (
                 <div className="text-center p-4 text-zinc-500 text-sm">
                   Enter an amount to see routes.
                 </div>
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
        </div>
      )}
    </div>
  );
}
