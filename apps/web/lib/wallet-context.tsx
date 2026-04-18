'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { registerWallet } from './api';

interface WalletState {
  address: string | null;
  isLoading: boolean;
  error: string | null;
  connectors: ReturnType<typeof useConnect>['connectors'];
  connect: ReturnType<typeof useConnect>['connect'];
  disconnect: () => void;
  /** @deprecated Use connect() with a connector instead */
  connectMetaMask: () => void;
}

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address: wagmiAddress, isConnecting } = useAccount();
  const { connectors, connect, error: connectError } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const address = wagmiAddress ?? null;

  // Register wallet with backend when connected
  useEffect(() => {
    if (!address) return;
    registerWallet(address).catch((err: unknown) => {
      const e = err as { message?: string };
      const msg = typeof e?.message === 'string' ? e.message : String(err);
      if (!msg.includes('already registered')) {
        console.error('Failed to register wallet:', msg);
      }
    });
  }, [address]);

  const connectMetaMask = () => {
    const metamask = connectors.find((c) => c.id === 'metaMask' || c.name === 'MetaMask');
    if (metamask) connect({ connector: metamask });
  };

  return (
    <WalletContext
      value={{
        address,
        isLoading: isConnecting,
        error: connectError?.message ?? null,
        connectors,
        connect,
        disconnect: wagmiDisconnect,
        connectMetaMask,
      }}
    >
      {children}
    </WalletContext>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
