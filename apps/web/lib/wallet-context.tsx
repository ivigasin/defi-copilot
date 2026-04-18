'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { registerWallet } from './api';

interface WalletState {
  address: string | null;
  isLoading: boolean;
  error: string | null;
  connectMetaMask: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectMetaMask = useCallback(async () => {
    type EIP1193Provider = {
      request: (args: { method: string }) => Promise<string[]>;
      isMetaMask?: boolean;
      providers?: EIP1193Provider[];
    };
    const win = window as unknown as { ethereum?: EIP1193Provider };
    const root = win.ethereum;
    if (!root) {
      setError('MetaMask not detected. Install the MetaMask extension and refresh.');
      return;
    }
    // When multiple wallets are installed, each injects into window.ethereum.providers[]
    const ethereum: EIP1193Provider =
      root.providers?.find((p) => p.isMetaMask && !('isOKExWallet' in p) && !('isOkxWallet' in p)) ??
      (root.isMetaMask ? root : null) ??
      root;
    if (!ethereum.isMetaMask) {
      setError('MetaMask not detected. Install the MetaMask extension and refresh.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const addr = accounts[0];
      if (!addr) throw new Error('No account returned from MetaMask');
      await registerWallet(addr).catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes('already registered')) throw err;
      });
      setAddress(addr);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setError(null);
  }, []);

  return (
    <WalletContext value={{ address, isLoading, error, connectMetaMask, disconnect }}>
      {children}
    </WalletContext>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
