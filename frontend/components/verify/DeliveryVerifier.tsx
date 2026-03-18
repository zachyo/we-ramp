"use client";

import { useState } from "react";
import { openContractCall } from "@stacks/connect";
import { uintCV, bufferCVFromString } from "@stacks/transactions";
import { useWallet } from "@/components/wallet/WalletProvider";

interface DeliveryVerifierProps {
  expectedAmount: number; // in sBTC 
}

export default function DeliveryVerifier({ expectedAmount }: DeliveryVerifierProps) {
  const { connected, network } = useWallet();
  const [status, setStatus] = useState<"idle" | "pending" | "verified">("idle");
  const [isCalling, setIsCalling] = useState(false);

  // Hardcoded for MVP based on PRD / agg.clar
  const CONTRACT_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"; 
  const CONTRACT_NAME = "agg";

  const handleInitiate = async () => {
    if (!connected) {
      alert("Please connect your Stacks wallet.");
      return;
    }

    setIsCalling(true);
    const amountInSats = Math.floor(expectedAmount * 100000000);

    try {
      await openContractCall({
        network: "testnet" as any,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "initiate-verification",
        functionArgs: [uintCV(amountInSats)],
        onFinish: (data) => {
          console.log("Initiate complete:", data);
          setStatus("pending");
        },
        onCancel: () => {
          console.log("Initiate cancelled");
        },
      });
    } catch (e) {
      console.error(e);
      alert("Failed to call initiate-verification.");
    } finally {
      setIsCalling(false);
    }
  };

  const handleConfirm = async () => {
    if (!connected) {
      alert("Please connect your Stacks wallet.");
      return;
    }

    setIsCalling(true);
    // Placeholder 32-byte buffer for MVP
    const dummyProof = bufferCVFromString("00000000000000000000000000000000");

    try {
      await openContractCall({
        network: "testnet" as any,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "confirm-delivery",
        functionArgs: [dummyProof],
        onFinish: (data) => {
          console.log("Confirm complete:", data);
          setStatus("verified");
        },
        onCancel: () => {
          console.log("Confirm cancelled");
        },
      });
    } catch (e) {
      console.error(e);
      alert("Failed to call confirm-delivery.");
    } finally {
      setIsCalling(false);
    }
  };

  if (status === "verified") {
    return (
      <div className="w-full bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-4 text-center">
        <div className="text-green-400 font-bold mb-1 flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Verified!
        </div>
        <p className="text-sm text-green-300">Your on-ramp delivery has been secured on-chain.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-black/40 border border-white/10 rounded-lg p-4 mt-4">
      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Delivery Verifier
      </h4>
      <p className="text-xs text-zinc-400 mb-4">
        Deposit 1 STX to verify your BTC receipt on-chain. Once bridging is confirmed, you get a full refund + verification badge.
      </p>

      {status === "idle" && (
        <button
          onClick={handleInitiate}
          disabled={isCalling}
          className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
        >
          {isCalling ? "Initiating..." : "1. Initiate Verification"}
        </button>
      )}

      {status === "pending" && (
        <button
          onClick={handleConfirm}
          disabled={isCalling}
          className="w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-sm font-medium rounded transition-colors disabled:opacity-50"
        >
          {isCalling ? "Confirming..." : "2. Confirm Delivery"}
        </button>
      )}
    </div>
  );
}
