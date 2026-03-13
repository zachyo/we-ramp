"use client";

import { useWallet } from "./WalletProvider";

export default function WalletConnect() {
  const { connected, address, network, connect, disconnect } = useWallet();

  if (connected && address) {
    const truncateAddress = `${address.slice(0, 5)}...${address.slice(-4)}`;
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase tracking-wider">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
            {network}
          </div>
          <span className="text-sm text-zinc-300 font-mono">
            {truncateAddress}
          </span>
        </div>
        <button 
          onClick={disconnect}
          className="text-xs text-red-500 hover:text-red-400 transition-colors bg-red-500/10 hover:bg-red-500/20 px-3 py-2 rounded-xl border border-red-500/20 font-medium"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={connect}
      className="btn-secondary px-5 py-2 text-sm font-medium shadow-lg hover:shadow-primary/20 transition-all"
    >
      Connect Wallet
    </button>
  );
}
