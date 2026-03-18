"use client";

const CURRENCIES = ["USD", "EUR", "GBP"];

interface QuoteInputProps {
  amount: string;
  setAmount: (val: string) => void;
  currency: string;
  setCurrency: (val: string) => void;
  tab: "buy" | "sell";
  setTab: (val: "buy" | "sell") => void;
  bestAmountOut: number;
}

export default function QuoteInput({
  amount,
  setAmount,
  currency,
  setCurrency,
  tab,
  setTab,
  bestAmountOut,
}: QuoteInputProps) {
  const parsedAmount = parseFloat(amount) || 0;

  return (
    <div className="animate-fade-in">
      {/* Tabs */}
      <div className="flex p-1 bg-black/40 rounded-xl mb-6 border border-white/5">
        <button
          onClick={() => setTab("buy")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            tab === "buy"
              ? "bg-white/10 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Buy
        </button>
        {/* <button
          onClick={() => setTab("sell")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            tab === "sell" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Sell
        </button> */}
      </div>

      {/* Amount Inputs */}
      <div className="space-y-4 mb-6">
        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
          <label className="text-xs text-zinc-500 font-medium mb-1 block">
            You pay
          </label>
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
                <option key={c} value={c} className="bg-zinc-900">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
          <label className="text-xs text-zinc-500 font-medium mb-1 block">
            You receive {tab === "buy" ? "(Estimated)" : ""}
          </label>
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={parsedAmount > 0 ? bestAmountOut.toString() : "0.00"}
              readOnly
              className="bg-transparent text-3xl font-semibold text-white focus:outline-none w-full"
            />
            <div className="bg-white/5 text-white flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2 border border-white/5">
              <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-[10px]">
                ₿
              </div>
              sBTC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
