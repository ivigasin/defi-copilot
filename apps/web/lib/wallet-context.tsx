'use client';

import { createContext, useContext, useRef, useCallback, useEffect, useState, type ReactNode } from 'react';
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

/** Attempts to register a wallet address. Returns null on success, or an error message on failure. */
async function tryRegister(addr: string, registeredRef: { current: Set<string> }): Promise<string | null> {
  if (registeredRef.current.has(addr)) return null;
  try {
    await registerWallet(addr);
    registeredRef.current.add(addr);
    return null;
  } catch (err: unknown) {
    const e = err as { message?: string };
    const msg = typeof e?.message === 'string' ? e.message : String(err);
    if (msg.includes('already registered')) {
      registeredRef.current.add(addr);
      return null;
    }
    console.error('Failed to register wallet:', msg);
    return msg;
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address: wagmiAddress, isConnecting } = useAccount();
  const { connectors, connect: wagmiConnect, error: connectError } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const registeredRef = useRef<Set<string>>(new Set());
  const activeAddressRef = useRef<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const address = wagmiAddress ?? null;

  // Keep activeAddressRef in sync for stale-result guards in async callbacks
  useEffect(() => {
    activeAddressRef.current = address;
  }, [address]);

  // Handle auto-reconnect: register wallet when wagmi restores a session
  useEffect(() => {
    if (!address) return;
    if (registeredRef.current.has(address)) return;
    const targetAddress = address;
    tryRegister(targetAddress, registeredRef).then((errorMsg) => {
      // Guard against stale result if address changed during async registration
      if (activeAddressRef.current !== targetAddress) return;
      if (errorMsg) {
        setRegistrationError(errorMsg);
        wagmiDisconnect();
      }
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
            setRegistrationError(null);
            const errorMsg = await tryRegister(addr, registeredRef);
            // Guard against stale result: only apply state updates if address is still current
            if (errorMsg && activeAddressRef.current === addr) {
              setRegistrationError(errorMsg);
              wagmiDisconnect();
              return;
            }
          }
          options?.onSuccess?.(data, ...rest);
        },
      });
    },
    [wagmiConnect, wagmiDisconnect],
  );

  const connectMetaMask = useCallback(() => {
    const metamask = connectors.find((c) => c.id === 'injected' || c.id === 'metaMask' || c.name === 'MetaMask');
    if (metamask) {
      connect({ connector: metamask });
    } else {
      console.warn('MetaMask connector not found. Is MetaMask installed?');
    }
  }, [connectors, connect]);

  // Suppress low-signal wagmi infrastructure errors that have no actionable
  // meaning for the user (e.g. "Provider not found" when MetaMask is absent).
  const connectErrorMessage = connectError?.message ?? null;
  const isProviderNotFound =
    connectErrorMessage !== null && connectErrorMessage.includes('Provider not found');
  const displayError = isProviderNotFound ? registrationError : (connectErrorMessage ?? registrationError);

  return (
    <WalletContext
      value={{
        address,
        isLoading: isConnecting,
        error: displayError,
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
