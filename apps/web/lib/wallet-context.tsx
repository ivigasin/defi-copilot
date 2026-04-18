'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { registerWallet } from './api';

interface WalletState {
  address: string | null;
  isLoading: boolean;
  error: string | null;
  connect: (address: string) => Promise<void>;
  connectMetaMask: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (addr: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await registerWallet(addr);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('already registered')) {
        setError(msg);
        setIsLoading(false);
        return;
      }
    }
    setAddress(addr);
    setIsLoading(false);
  }, []);

  const connectMetaMask = useCallback(async () => {
    const ethereum = (window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
    if (!ethereum) {
      setError('MetaMask not detected. Please install the MetaMask extension.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const addr = accounts[0];
      if (!addr) throw new Error('No account returned from MetaMask');
      await connect(addr);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setIsLoading(false);
    }
  }, [connect]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setError(null);
  }, []);

  return (
    <WalletContext value={{ address, isLoading, error, connect, connectMetaMask, disconnect }}>
      {children}
    </WalletContext>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
