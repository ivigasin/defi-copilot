'use client';

import { createContext, useContext, useRef, useCallback, useEffect, type ReactNode } from 'react';
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

async function tryRegister(addr: string, registeredRef: { current: Set<string> }) {
  if (registeredRef.current.has(addr)) return true;
  try {
    await registerWallet(addr);
    registeredRef.current.add(addr);
    return true;
  } catch (err: unknown) {
    const e = err as { message?: string };
    const msg = typeof e?.message === 'string' ? e.message : String(err);
    if (msg.includes('already registered')) {
      registeredRef.current.add(addr);
      return true;
    }
    console.error('Failed to register wallet:', msg);
    return false;
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address: wagmiAddress, isConnecting } = useAccount();
  const { connectors, connect: wagmiConnect, error: connectError } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const registeredRef = useRef<Set<string>>(new Set());

  const address = wagmiAddress ?? null;

  // Handle auto-reconnect: register wallet when wagmi restores a session
  useEffect(() => {
    if (!address) return;
    if (registeredRef.current.has(address)) return;
    tryRegister(address, registeredRef).then((ok) => {
      if (!ok) wagmiDisconnect();
    });
  }, [address, wagmiDisconnect]);

  // Wrap connect to register wallet after successful connection
  const connect: typeof wagmiConnect = useCallback(
    (variables, options) => {
      wagmiConnect(variables, {
        ...options,
        onSuccess: async (data, ...rest) => {
          const raw = data.accounts[0];
          const addr: string | undefined = typeof raw === 'string' ? raw : raw?.address;
          if (addr) {
            const ok = await tryRegister(addr, registeredRef);
            if (!ok) wagmiDisconnect();
          }
          options?.onSuccess?.(data, ...rest);
        },
      });
    },
    [wagmiConnect, wagmiDisconnect],
  );

  const connectMetaMask = useCallback(() => {
    const metamask = connectors.find((c) => c.id === 'metaMask' || c.name === 'MetaMask');
    if (metamask) {
      connect({ connector: metamask });
    } else {
      console.warn('MetaMask connector not found. Is MetaMask installed?');
    }
  }, [connectors, connect]);

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
