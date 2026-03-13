"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authenticate, AppConfig, UserSession } from "@stacks/connect";

const appConfig = new AppConfig(["store_write", "publish_data"]);
export const userSessionInstance = new UserSession({ appConfig });

interface WalletContextType {
  connected: boolean;
  address: string | null;
  network: string;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  address: null,
  network: "testnet",
  connect: () => {},
  disconnect: () => {},
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (userSessionInstance.isUserSignedIn()) {
      const userData = userSessionInstance.loadUserData();
      setAddress(userData.profile.stxAddress.testnet);
      setConnected(true);
    } else if (userSessionInstance.isSignInPending()) {
      userSessionInstance.handlePendingSignIn().then((userData) => {
        setAddress(userData.profile.stxAddress.testnet);
        setConnected(true);
      });
    }
  }, []);

  const connect = () => {
    authenticate({
      appDetails: {
        name: "weRamp",
        icon: window.location.origin + "/favicon.ico", // Placeholder icon
      },
      redirectTo: "/",
      onFinish: () => {
        const userData = userSessionInstance.loadUserData();
        setAddress(userData.profile.stxAddress.testnet);
        setConnected(true);
      },
      userSession: userSessionInstance,
    });
  };

  const disconnect = () => {
    userSessionInstance.signUserOut();
    setAddress(null);
    setConnected(false);
  };

  if (!mounted) {
    // Avoid hydration mismatch by not rendering until mounted
    return null;
  }

  return (
    <WalletContext.Provider value={{ connected, address, network: "testnet", connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}
