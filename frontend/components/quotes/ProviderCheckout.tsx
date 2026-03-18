"use client";

import { ProviderQuote } from "@/lib/aggregator";
import DeliveryVerifier from "@/components/verify/DeliveryVerifier";

interface ProviderCheckoutProps {
  selectedProvider: ProviderQuote;
  setSelectedProvider: (val: ProviderQuote | null) => void;
  amount: string;
  currency: string;
  widgetUrl: string | null;
  fallbackUrl: string | null;
  purchaseInitiated: boolean;
  setPurchaseInitiated: (val: boolean) => void;
  handlePegIn: () => Promise<void>;
  connected: boolean;
}

export default function ProviderCheckout({
  selectedProvider,
  setSelectedProvider,
  amount,
  currency,
  widgetUrl,
  fallbackUrl,
  purchaseInitiated,
  setPurchaseInitiated,
  handlePegIn,
  connected,
}: ProviderCheckoutProps) {
  return (
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
          <div className="text-white font-medium">
            {amount} {currency}
          </div>
        </div>
        <div className="text-right">
          <span className="text-zinc-400">Receiving (via Bridge)</span>
          <div className="text-primary font-medium">{selectedProvider.amountOut} sBTC</div>
        </div>
      </div>

      {/* Widget Area */}
      <div className="flex-1 relative bg-black/60 rounded-xl border border-white/10 overflow-hidden min-h-[400px] flex flex-col">
        {widgetUrl ? (
          <div className="flex-1 flex flex-col w-full h-full">
            {/* Embedded Widget */}
            <iframe
              src={widgetUrl}
              title={`${selectedProvider.provider} Buy Widget`}
              className="w-full flex-1 min-h-[400px] border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              allow="usb; ethereum; clipboard-write; payment; microphone; camera"
              loading="lazy"
              onLoad={() => setPurchaseInitiated(true)}
            />
            {/* Bridge overlay/actions that show after iframe loads */}
            <div className="p-4 bg-black/80 border-t border-white/10 flex flex-col items-center justify-center animate-fade-in relative z-20">
              <p className="text-sm text-zinc-400 mb-3 text-center">
                Once you have successfully received Native BTC, bridge it securely.
              </p>
              <button
                onClick={handlePegIn}
                className="bg-primary hover:bg-primary-dark text-black font-bold py-2.5 px-6 rounded-lg transition-colors w-full sm:w-auto flex items-center justify-center gap-2 mb-4"
              >
                Bridge to sBTC
                <span className="bg-black/20 px-2 py-0.5 rounded text-xs">Wallet Popup</span>
              </button>

              <DeliveryVerifier expectedAmount={selectedProvider.amountOut} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center absolute inset-0">
            {!connected ? (
              <>
                <p className="text-3xl mb-4">🔗</p>
                <h3 className="text-lg font-bold mb-2 text-white">Connect Wallet Required</h3>
                <p className="text-sm text-zinc-400 mb-6 max-w-sm">
                  Please connect your wallet to proceed with purchasing sBTC.
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl mb-4">🔑</p>
                <h3 className="text-lg font-bold mb-2 text-white">API Key Not Configured</h3>
                <p className="text-sm text-zinc-400 mb-6 max-w-sm">
                  The {selectedProvider.provider} widget requires an API key in the environment variables.
                </p>
                {fallbackUrl && (
                  <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                    Open {selectedProvider.provider} Directly
                  </a>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
