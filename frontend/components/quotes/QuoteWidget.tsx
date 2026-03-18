"use client";

import { useState, useEffect, useMemo } from "react";
import { getQuotes, ProviderQuote } from "@/lib/aggregator";
import {
  buildProviderWidgetUrl,
  getProviderFallbackUrl,
} from "@/lib/provider-urls";
import { useWallet } from "@/components/wallet/WalletProvider";

import QuoteInput from "./QuoteInput";
import QuoteList from "./QuoteList";
import ProviderCheckout from "./ProviderCheckout";
import { usePathname } from "next/navigation";

export default function QuoteWidget() {
  const pathname = usePathname();
  const [amount, setAmount] = useState<string>("500");
  const [currency, setCurrency] = useState<string>("USD");
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderQuote | null>(null);

  const [quotes, setQuotes] = useState<ProviderQuote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [purchaseInitiated, setPurchaseInitiated] = useState<boolean>(false);

  const { connected, address } = useWallet();

  const walletAddress = useMemo(() => {
    if (!connected || typeof window === "undefined") return "";
    return address ?? "";
  }, [connected, address]);

  const widgetUrl = useMemo(() => {
    if (!selectedProvider || !walletAddress) return null;
    return buildProviderWidgetUrl({
      provider: selectedProvider.provider,
      amount: parseFloat(amount) || 0,
      currency,
      walletAddress,
    });
  }, [selectedProvider, amount, currency, walletAddress]);

  const fallbackUrl = selectedProvider
    ? getProviderFallbackUrl(selectedProvider.provider)
    : null;

  const parsedAmount = parseFloat(amount) || 0;

  // The 'estimated' best amount out before selecting a specific route
  const bestAmountOut = quotes.length > 0 ? quotes[0].amountOut : 0;

  const handlePegIn = async () => {
    try {
      if (typeof window === "undefined" || !(window as any).btc) {
        alert(
          "Please install Leather or Xverse wallet to perform the sBTC peg-in.",
        );
        return;
      }
      if (!selectedProvider) return;

      // Mock sBTC Peg Wallet Address (Placeholder)
      const PEG_WALLET_ADDRESS = "tb1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";

      // Calculate amount in sats
      const amountInSats = Math.floor(
        selectedProvider.amountOut * 100000000,
      ).toString();

      // OP_RETURN memo format for sBTC (Placeholder format string)
      const memo = `sbtc-pegin:${address}`;

      await (window as any).btc.request("transfer", {
        network: "testnet",
        recipient: PEG_WALLET_ADDRESS,
        amount: amountInSats,
        memo: memo,
      });

      alert("sBTC Peg-In transaction submitted successfully!");
    } catch (e) {
      console.error("Peg-in error:", e);
      alert("Failed to initiate peg-in. See console.");
    }
  };

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
        <ProviderCheckout
          selectedProvider={selectedProvider}
          setSelectedProvider={setSelectedProvider}
          amount={amount}
          currency={currency}
          widgetUrl={widgetUrl}
          fallbackUrl={fallbackUrl}
          purchaseInitiated={purchaseInitiated}
          setPurchaseInitiated={setPurchaseInitiated}
          handlePegIn={handlePegIn}
          connected={connected}
        />
      ) : (
        <>
          <QuoteInput
            amount={amount}
            setAmount={setAmount}
            currency={currency}
            setCurrency={setCurrency}
            tab={tab}
            setTab={setTab}
            bestAmountOut={bestAmountOut}
          />
          {pathname === "/onramp" && (
            <QuoteList
              quotes={quotes}
              isLoading={isLoading}
              parsedAmount={parsedAmount}
              setSelectedProvider={setSelectedProvider}
            />
          )}
        </>
      )}
    </div>
  );
}
