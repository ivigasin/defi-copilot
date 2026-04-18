'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { registerWallet } from './api';

interface WalletState {
  address: string | null;
  isLoading: boolean;
  error: string | null;
  connect: (address: string) => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [manualAddress, setManualAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address: wagmiAddress, isConnected } = useAccount();

  // Auto-register wagmi-connected wallet
  useEffect(() => {
    if (!isConnected || !wagmiAddress) return;

    registerWallet(wagmiAddress).catch((err) => {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('already registered')) {
        console.error('[wallet] Failed to register wagmi wallet:', msg);
      }
    });
  }, [wagmiAddress, isConnected]);

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
    setManualAddress(addr);
    setIsLoading(false);
  }, []);

  const disconnect = useCallback(() => {
    setManualAddress(null);
    setError(null);
  }, []);

  // Prefer manual address, then wagmi address
  const address = manualAddress ?? (isConnected ? wagmiAddress ?? null : null);

  return (
    <WalletContext value={{ address, isLoading, error, connect, disconnect }}>
      {children}
    </WalletContext>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
