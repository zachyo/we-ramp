/\*\*

- Quote Aggregator Engine — sBTC On-Ramp Aggregator
-
- Fetches quotes from multiple providers in parallel.
- For each provider: attempts a real API call first, falls back
- to computed quotes using live BTC price + documented fee structure.
  \*/

export interface ProviderQuote {
provider: string;
logoSymbol: string;
rate: number; // How many USD per 1 sBTC (higher = better rate for fiat buyer)
feeFixed: number; // Fixed fee in USD
feePercent: number; // Percentage fee (e.g., 0.015 = 1.5%)
feeTotal: number; // Calculated: feeFixed + amount \* feePercent
amountOut: number; // sBTC you receive for the given fiat amount
estimatedTime: string;
noKyc: boolean;
kycThreshold: number; // Max USD purchasable without KYC
minAmount: number;
maxAmount: number;
available: boolean;
badge?: string;
score: number; // Computed ranking score (higher = better)
isLiveQuote: boolean; // true if quote came from real API, false if computed
}

export interface AggregatorParams {
amount: number; // Fiat amount in USD
currency?: string;
}

// ─── BTC Price Fetch ──────────────────────────────────────────────────────────

/\*\*

- Fetch a live BTC/USD price for realistic quote computation.
- Uses CoinGecko's free public API (no key required).
  \*/
  async function fetchBtcPrice(currency: string = "usd"): Promise<number> {
  try {
  const cur = currency.toLowerCase();
  const res = await fetch(
  `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${cur}`,
  { next: { revalidate: 60 } }, // Cache 1 minute
  );
  if (!res.ok) throw new Error("CoinGecko unavailable");
  const data = await res.json();
  return (data.bitcoin[cur] as number) ?? 85000;
  } catch {
  return 85000; // Fallback estimate
  }
  }

// ─── Provider Quote Strategies ────────────────────────────────────────────────

/\*\*

- Helper: build a computed quote using known fee structures.
- Used as fallback when real API calls fail or as primary when no API key exists.
  _/
  function computeQuote(
  provider: string,
  logoSymbol: string,
  amount: number,
  btcPrice: number,
  feePercent: number,
  feeFixed: number,
  estimatedTime: string,
  kycThreshold: number,
  minAmount: number,
  maxAmount: number,
  badge?: string,
  ): ProviderQuote {
  const feeTotal = amount _ feePercent + feeFixed;
  const netAmount = amount - feeTotal;
  const amountOut = Math.round((netAmount / btcPrice) \* 1e8) / 1e8;

return {
provider,
logoSymbol,
rate: btcPrice,
feeFixed,
feePercent,
feeTotal: Math.round(feeTotal \* 100) / 100,
amountOut: Math.max(amountOut, 0),
estimatedTime,
noKyc: amount < kycThreshold,
kycThreshold,
minAmount,
maxAmount,
available: amount >= minAmount && amount <= maxAmount,
badge,
score: 0,
isLiveQuote: false,
};
}

// ─── MoonPay ──────────────────────────────────────────────────────────────────

async function fetchMoonPayQuote(
amount: number,
currency: string,
btcPrice: number,
): Promise<ProviderQuote> {
const apiKey = process.env.NEXT_PUBLIC_MOONPAY_API_KEY || "";

// Attempt real API call
if (apiKey && !apiKey.startsWith("pk_test_xxxx")) {
try {
const res = await fetch(
`https://api.moonpay.com/v3/currencies/btc/buy_quote?` +
`baseCurrencyAmount=${amount}` +
`&baseCurrencyCode=${currency.toLowerCase()}` +
`&apiKey=${apiKey}`,
{ next: { revalidate: 30 } },
);
if (res.ok) {
const data = await res.json();
const feeTotal = (data.feeAmount ?? 0) + (data.extraFeeAmount ?? 0);
const amountOut =
Math.round((data.quoteCurrencyAmount ?? 0) \* 1e8) / 1e8;
const feePercent = amount > 0 ? feeTotal / amount : 0.035;

        return {
          provider: "MoonPay",
          logoSymbol: "M",
          rate: data.quoteCurrencyPrice ?? btcPrice,
          feeFixed: 0,
          feePercent,
          feeTotal: Math.round(feeTotal * 100) / 100,
          amountOut,
          estimatedTime: "~2 mins",
          noKyc: amount < 150,
          kycThreshold: 150,
          minAmount: 30,
          maxAmount: 2000,
          available: amount >= 30 && amount <= 2000,
          score: 0,
          isLiveQuote: true,
        };
      }
    } catch {
      // Fall through to computed
    }

}

// Fallback: computed quote
return computeQuote(
"MoonPay",
"M",
amount,
btcPrice,
0.035,
0,
"~2 mins",
150,
30,
2000,
);
}

// ─── Ramp Network ─────────────────────────────────────────────────────────────

async function fetchRampQuote(
amount: number,
currency: string,
btcPrice: number,
): Promise<ProviderQuote> {
// Ramp's quote API requires a server-side secret key,
// so we always compute from their documented fee structure.
// Bank transfer: ~0.9%, Card: ~2.9%. We use bank transfer (best case).
return computeQuote(
"Ramp Network",
"R",
amount,
btcPrice,
0.009,
0,
"~5 mins",
250,
20,
5000,
"Best Rate",
);
}

// ─── Transak ──────────────────────────────────────────────────────────────────

async function fetchTransakQuote(
amount: number,
currency: string,
btcPrice: number,
): Promise<ProviderQuote> {
// Attempt real API call — Transak has a public pricing endpoint
try {
const res = await fetch(
`https://api.transak.com/api/v1/pricing/public/quotes?` +
`fiatCurrency=${currency.toUpperCase()}` +
`&cryptoCurrency=BTC` +
`&fiatAmount=${amount}` +
`&isBuyOrSell=BUY` +
`&paymentMethod=credit_debit_card` +
`&network=mainnet`,
{ next: { revalidate: 30 } },
);
if (res.ok) {
const data = await res.json();
const response = data.response;
if (response && response.cryptoAmount) {
const amountOut = Math.round(response.cryptoAmount \* 1e8) / 1e8;
const feeTotal = response.totalFee ?? response.feeDecimal ?? 0;
const feePercent = amount > 0 ? feeTotal / amount : 0.015;

        return {
          provider: "Transak",
          logoSymbol: "T",
          rate: response.cryptoPrice ?? btcPrice,
          feeFixed: 0,
          feePercent,
          feeTotal: Math.round(feeTotal * 100) / 100,
          amountOut,
          estimatedTime: "~5 mins",
          noKyc: amount < 500,
          kycThreshold: 500,
          minAmount: 40,
          maxAmount: 3000,
          available: amount >= 40 && amount <= 3000,
          score: 0,
          isLiveQuote: true,
        };
      }
    }

} catch {
// Fall through to computed
}

return computeQuote(
"Transak",
"T",
amount,
btcPrice,
0.015,
0,
"~5 mins",
500,
40,
3000,
);
}

// ─── Mt Pelerin ───────────────────────────────────────────────────────────────

async function fetchMtPelerinQuote(
amount: number,
currency: string,
btcPrice: number,
): Promise<ProviderQuote> {
// Attempt real API call — Mt Pelerin has a public price endpoint
try {
const res = await fetch(
`https://api.mtpelerin.com/v1/prices?crypto=BTC&fiat=${currency.toUpperCase()}`,
{ next: { revalidate: 60 } },
);
if (res.ok) {
const data = await res.json();
// Mt Pelerin returns price in fiat per 1 BTC
if (data && data.BTC) {
const realRate = data.BTC;
const feePercent = 0.009; // Documented ~0.9%
const feeTotal = amount _ feePercent;
const netAmount = amount - feeTotal;
const amountOut = Math.round((netAmount / realRate) _ 1e8) / 1e8;

        return {
          provider: "Mt Pelerin",
          logoSymbol: "P",
          rate: realRate,
          feeFixed: 0,
          feePercent,
          feeTotal: Math.round(feeTotal * 100) / 100,
          amountOut: Math.max(amountOut, 0),
          estimatedTime: "10–30 mins",
          noKyc: amount < 1000,
          kycThreshold: 1000,
          minAmount: 50,
          maxAmount: 10000,
          available: amount >= 50 && amount <= 10000,
          badge: "Best No-KYC",
          score: 0,
          isLiveQuote: true,
        };
      }
    }

} catch {
// Fall through to computed
}

return computeQuote(
"Mt Pelerin",
"P",
amount,
btcPrice,
0.009,
0,
"10–30 mins",
1000,
50,
10000,
"Best No-KYC",
);
}

// ─── Ranking Algorithm ───────────────────────────────────────────────────────

/\*\*

- Score each quote. Higher is better.
- Formula: (amountOut / maxAmountOut) \* 60 [rate weight: 60%]
-        + (1 - feePercent / maxFee) * 30     [fee weight: 30%]
-        + (noKyc ? 1 : 0) * 10               [no-kyc bonus: 10%]
  \*/
  function rankQuotes(quotes: ProviderQuote[]): ProviderQuote[] {
  const available = quotes.filter((q) => q.available);
  if (available.length === 0) return quotes;

const maxAmountOut = Math.max(...available.map((q) => q.amountOut));
const maxFeePercent = Math.max(...available.map((q) => q.feePercent));

return quotes.map((q) => {
if (!q.available) return { ...q, score: 0 };

    const rateScore = maxAmountOut > 0 ? (q.amountOut / maxAmountOut) * 60 : 0;
    const feeScore =
      maxFeePercent > 0 ? (1 - q.feePercent / maxFeePercent) * 30 : 30;
    const kycScore = q.noKyc ? 10 : 0;

    return { ...q, score: Math.round(rateScore + feeScore + kycScore) };

});
}

// ─── Public Aggregator ────────────────────────────────────────────────────────

export async function aggregateQuotes(
params: AggregatorParams,
): Promise<ProviderQuote[]> {
const { amount, currency = "USD" } = params;

// Fetch live BTC price first
const btcPrice = await fetchBtcPrice(currency);

// Fetch all provider quotes in parallel (real API → fallback)
const [moonpay, ramp, transak, mtpelerin] = await Promise.all([
fetchMoonPayQuote(amount, currency, btcPrice),
fetchRampQuote(amount, currency, btcPrice),
fetchTransakQuote(amount, currency, btcPrice),
fetchMtPelerinQuote(amount, currency, btcPrice),
]);

const results = [moonpay, ramp, transak, mtpelerin];

// Rank and sort (best first)
const ranked = rankQuotes(results);
return ranked.sort((a, b) => b.score - a.score);
}

/\*\*

- Provider Widget URL Builder — sBTC On-Ramp Aggregator
-
- Constructs embeddable widget URLs for each on-ramp provider.
- All providers support URL/iframe-based embeds with query parameters
- for amount, currency, crypto asset, and wallet address.
  \*/

// ─── Provider Config ─────────────────────────────────────────────────────────

export interface ProviderWidgetConfig {
/** Base URL for the widget (sandbox vs production) \*/
baseUrl: string;
/** Whether the widget requires an API key _/
requiresApiKey: boolean;
/\*\* The actual API key _/
apiKey?: string;
/\*_ Query parameter name for the API key _/
apiKeyParam?: string;
}

/\*\*

- Lazily resolve whether we're in production.
- Reading process.env at function-call time avoids the Vercel/Turbopack issue
- where env vars aren't available yet during module initialisation.
  \*/
  function isProduction(): boolean {
  return process.env.NEXT_PUBLIC_STACKS_NETWORK === "mainnet";
  }

/\*\*

- Build the provider config map on demand so that every `process.env.*` read
- happens at call-time, not at module-load time.
  \*/
  function getProviderConfigs(): Record<string, ProviderWidgetConfig> {
  const prod = isProduction();
  return {
  MoonPay: {
  baseUrl: prod
  ? "https://buy.moonpay.com"
  : "https://buy-sandbox.moonpay.com",
  requiresApiKey: true,
  apiKey: process.env.NEXT_PUBLIC_MOONPAY_API_KEY || "",
  apiKeyParam: "apiKey",
  },
  Transak: {
  baseUrl: prod
  ? "https://global.transak.com"
  : "https://global-stg.transak.com",
  requiresApiKey: true,
  apiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY || "",
  apiKeyParam: "apiKey",
  },
  "Ramp Network": {
  baseUrl: prod
  ? "https://app.ramp.network"
  : "https://app.demo.ramp.network",
  requiresApiKey: true,
  apiKey: process.env.NEXT_PUBLIC_RAMP_API_KEY || "",
  apiKeyParam: "hostApiKey",
  },
  "Mt Pelerin": {
  baseUrl: "https://widget.mtpelerin.com",
  requiresApiKey: true,
  apiKey: process.env.NEXT_PUBLIC_MTPELERIN_API_KEY || "",
  apiKeyParam: "\_ctkn",
  },
  };
  }

// ─── URL Builder ──────────────────────────────────────────────────────────────

export interface WidgetUrlParams {
provider: string;
amount: number;
currency: string;
walletAddress: string;
}

/\*\*

- Build the embeddable widget URL for a given provider.
- Returns null if the provider requires an API key that isn't configured.
  \*/
  export function buildProviderWidgetUrl(params: WidgetUrlParams): string | null {
  console.log({ params });
  const { provider, amount, currency, walletAddress } = params;
  const config = getProviderConfigs()[provider];
  console.log({ config });

if (!config) return null;

// Check API key availability
let apiKey: string | undefined;
if (config.requiresApiKey && config.apiKey) {
apiKey = config.apiKey;
} else if (config.requiresApiKey && !config.apiKey) {
// Return a fallback direct link without embed
return getProviderFallbackUrl(provider);
}

const url = new URL(config.baseUrl);

switch (provider) {
case "MoonPay":
if (apiKey && config.apiKeyParam) {
url.searchParams.set(config.apiKeyParam, apiKey);
}
url.searchParams.set("currencyCode", "btc");
url.searchParams.set("baseCurrencyCode", currency.toLowerCase());
url.searchParams.set("baseCurrencyAmount", amount.toString());
url.searchParams.set("walletAddress", walletAddress);
url.searchParams.set("colorCode", "%23f7931a"); // Bitcoin orange
url.searchParams.set("theme", "dark");
break;

    case "Transak":
      if (apiKey && config.apiKeyParam) {
        url.searchParams.set(config.apiKeyParam, apiKey);
      }
      url.searchParams.set("cryptoCurrencyCode", "BTC");
      url.searchParams.set("fiatCurrency", currency.toUpperCase());
      url.searchParams.set("fiatAmount", amount.toString());
      url.searchParams.set("walletAddress", walletAddress);
      url.searchParams.set("network", "bitcoin");
      url.searchParams.set("themeColor", "f7931a");
      url.searchParams.set("hideMenu", "true");
      url.searchParams.set("disableWalletAddressForm", "true");
      break;

    case "Ramp Network":
      if (apiKey && config.apiKeyParam) {
        url.searchParams.set(config.apiKeyParam, apiKey);
      }
      url.searchParams.set("swapAsset", "BTC_BTC");
      url.searchParams.set("fiatValue", amount.toString());
      url.searchParams.set("fiatCurrency", currency.toUpperCase());
      url.searchParams.set("userAddress", walletAddress);
      url.searchParams.set("variant", "embedded-desktop");
      break;

    case "Mt Pelerin":
      if (apiKey && config.apiKeyParam) {
        url.searchParams.set(config.apiKeyParam, apiKey);
      }
      url.searchParams.set("type", "buy");
      url.searchParams.set("tab", "buy");
      url.searchParams.set("crys", "BTC");
      url.searchParams.set("bsc", currency.toUpperCase());
      url.searchParams.set("bsa", amount.toString());
      url.searchParams.set("addr", walletAddress);
      url.searchParams.set("net", "bitcoin");
      url.searchParams.set("rfr", "sbtc-onramp"); // referral code placeholder
      break;

    default:
      return null;

}

console.log({ url: url.toString() });

return url.toString();
}

/\*\*

- Get a direct link to the provider's website (used when API key is missing).
  \*/
  export function getProviderFallbackUrl(provider: string): string | null {
  const FALLBACK_URLS: Record<string, string> = {
  MoonPay: "https://www.moonpay.com/buy/btc",
  Transak: "https://global.transak.com",
  "Ramp Network": "https://ramp.network/buy",
  "Mt Pelerin": "https://www.mtpelerin.com/buy-bitcoin",
  };
  return FALLBACK_URLS[provider] ?? null;
  }

/\*\*

- Check if a provider has a valid API key configured.
  \*/
  export function isProviderConfigured(provider: string): boolean {
  const config = getProviderConfigs()[provider];
  if (!config) return false;
  if (!config.requiresApiKey) return true; // Mt Pelerin
  const key = config.apiKey;
  return !!key && !key.startsWith("pk_test_xxxx") && key !== "xxxx";
  }

/\*\*

- Returns the list of all supported providers.
  \*/
  export function getSupportedProviders(): string[] {
  return Object.keys(getProviderConfigs());
  }

"use client";

import { useState, useMemo } from "react";
import { ProviderQuote } from "@/lib/aggregator";
import {
buildProviderWidgetUrl,
getProviderFallbackUrl,
} from "@/lib/provider-urls";
import VerifyDelivery from "./VerifyDelivery";
import { useWallet } from "./WalletProvider";

interface ProviderModalProps {
quote: ProviderQuote;
amount: number;
currency: string;
onClose: () => void;
}

type ModalView = "details" | "widget" | "verify";

export default function ProviderModal({
quote,
amount,
currency,
onClose,
}: ProviderModalProps) {
const [view, setView] = useState<ModalView>("details");
const { connected, address } = useWallet();

const satoshis = Math.round(quote.amountOut \* 1e8);

// Get wallet address for widget URL
const walletAddress = useMemo(() => {
if (!connected || typeof window === "undefined") return "";
return address ?? "";
}, [connected, address]);

// Build widget URL
const widgetUrl = useMemo(() => {
console.log(
"walletAddress",
walletAddress,
quote.provider,
amount,
currency,
);
if (!walletAddress) return null;

    return buildProviderWidgetUrl({
      provider: quote.provider,
      amount,
      currency,
      walletAddress,
    });

}, [quote.provider, amount, currency, walletAddress]);

const fallbackUrl = getProviderFallbackUrl(quote.provider);

console.log({ widgetUrl, fallbackUrl });

// ─── Details View ──────────────────────────────────────────────────────

if (view === "details") {
return (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
<div className="card max-w-lg w-full p-8 relative animate-fade-up max-h-[90vh] overflow-y-auto">
{/_ Close _/}
<button
            onClick={onClose}
            className="absolute top-5 right-5 text-muted hover:text-primary transition-colors text-xl"
            aria-label="Close"
          >
✕
</button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent-dim flex items-center justify-center text-2xl">
              🛒
            </div>
            <div>
              <h2 className="text-xl font-bold">{quote.provider}</h2>
              <p className="text-sm text-muted">
                {amount} {currency} →{" "}
                <span className="text-accent-primary font-bold">
                  {quote.amountOut.toFixed(8)} sBTC
                </span>
              </p>
            </div>
          </div>

          {/* Summary card */}
          <div className="bg-elevated rounded-xl p-5 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">You pay</span>
              <span className="font-semibold">
                {amount} {currency}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Fee</span>
              <span className="font-semibold">${quote.feeTotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">You receive</span>
              <span className="font-bold text-accent-primary">
                {quote.amountOut.toFixed(8)} sBTC
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-default pt-3">
              <span className="text-muted">Est. time</span>
              <span className="font-semibold">{quote.estimatedTime}</span>
            </div>
            {!quote.noKyc && (
              <div className="flex justify-between text-sm border-t border-default pt-3">
                <span className="text-muted">KYC</span>
                <span className="text-yellow-400 font-semibold text-xs">
                  Required for amounts above ${quote.kycThreshold}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {connected ? (
              <>
                <button
                  onClick={() => setView("widget")}
                  className="btn-primary w-full"
                >
                  🚀 Buy with {quote.provider}
                </button>
                <button
                  onClick={() => setView("verify")}
                  className="btn-outline w-full text-sm"
                >
                  ✓ Already purchased? Verify Delivery
                </button>
              </>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted mb-3">
                  Connect your wallet to proceed with the purchase or verify
                  delivery.
                </p>
                {fallbackUrl && (
                  <a
                    href={fallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline w-full"
                  >
                    Open {quote.provider} Directly →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );

}

// ─── Widget View (iframe embed) ─────────────────────────────────────────

if (view === "widget") {
return (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
<div
className="card max-w-2xl w-full relative animate-fade-up overflow-hidden flex flex-col"
style={{ height: "min(85vh, 700px)" }} >
{/_ Header bar _/}
<div className="flex items-center justify-between px-6 py-4 border-b border-default shrink-0">
<div className="flex items-center gap-3">
<button
onClick={() => setView("details")}
className="text-muted hover:text-primary transition-colors text-sm" >
← Back
</button>
<span className="text-sm font-semibold">{quote.provider}</span>
<span className="badge badge-accent text-[10px]">
{amount} {currency}
</span>
</div>
<div className="flex items-center gap-3">
{(widgetUrl || fallbackUrl) && (
<a
href={widgetUrl || fallbackUrl || "#"}
target="\_blank"
rel="noopener noreferrer"
className="text-xs text-muted hover:text-accent-primary transition-colors" >
Open in new tab ↗
</a>
)}
<button
                onClick={onClose}
                className="text-muted hover:text-primary transition-colors text-xl"
                aria-label="Close"
              >
✕
</button>
</div>
</div>

          {/* Widget iframe */}
          <div className="flex-1 relative bg-elevated">
            {widgetUrl ? (
              <iframe
                src={widgetUrl}
                title={`${quote.provider} Buy Widget`}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                // loading="eager"
                allow="usb; ethereum; clipboard-write; payment; microphone; camera"
                loading="lazy"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-3xl mb-4">🔑</p>
                <h3 className="text-lg font-bold mb-2">
                  API Key Not Configured
                </h3>
                <p className="text-sm text-muted mb-6 max-w-sm">
                  The {quote.provider} widget requires an API key. You can still
                  complete your purchase directly on their site.
                </p>
                {fallbackUrl && (
                  <a
                    href={fallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Open {quote.provider} →
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-default shrink-0 flex items-center justify-between">
            <p className="text-xs text-muted">
              Purchase handled securely by {quote.provider}. Non-custodial.
            </p>
            <button
              onClick={() => setView("verify")}
              className="text-xs text-accent-primary hover:underline font-semibold"
            >
              Purchased? Verify Delivery →
            </button>
          </div>
        </div>
      </div>
    );

}

// ─── Verify View ──────────────────────────────────────────────────────

return (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
<div className="card max-w-lg w-full p-8 relative animate-fade-up max-h-[90vh] overflow-y-auto">
<button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted hover:text-primary transition-colors text-xl"
          aria-label="Close"
        >
✕
</button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent-dim flex items-center justify-center text-2xl">
            🔒
          </div>
          <div>
            <h2 className="text-xl font-bold">Verify Delivery</h2>
            <p className="text-sm text-muted">
              Confirm your sBTC arrived on-chain
            </p>
          </div>
        </div>

        <VerifyDelivery
          amountSatoshis={satoshis}
          onBack={() => setView("details")}
        />
      </div>
    </div>

);
}
