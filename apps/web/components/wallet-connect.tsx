'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@/lib/wallet-context';
import type { Connector } from 'wagmi';

const WALLET_META: Record<string, { label: string; icon: () => React.ReactNode }> = {
  metaMask: {
    label: 'MetaMask',
    icon: () => (
      <svg width="28" height="28" viewBox="0 0 318.6 318.6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M274.1 35.5l-99.5 73.9L193 98.6z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M44.4 35.5l98.7 74.6-17.5-11.5zM238.3 206.8l-26.5 40.6 56.7 15.6 16.3-55.3zM33.9 207.7L50.1 263l56.7-15.6-26.5-40.6z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M103.6 138.2l-15.8 23.9 56.3 2.5-2-60.5zM214.9 138.2l-39-34.8-1.3 61.2 56.2-2.5z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M177.9 230.9l33.9 16.5-4.7-39.3z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M138.8 193.5l-28.2-8.3 19.9-9.1zM179.7 193.5l8.3-17.4 20 9.1z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M174.6 164.6l3.3-57.7 15.2-41.1h-67.5l15 41.1 3.5 57.7 1.2 18.2.1 44.8h27.7l.2-44.8z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  okxWallet: {
    label: 'OKX Wallet',
    icon: () => (
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="black"/>
        <path d="M23.3 10H16.7C16.3 10 16 10.3 16 10.7V16.3C16 16.7 16.3 17 16.7 17H23.3C23.7 17 24 16.7 24 16.3V10.7C24 10.3 23.7 10 23.3 10Z" fill="white"/>
        <path d="M14.3 17H7.7C7.3 17 7 17.3 7 17.7V23.3C7 23.7 7.3 24 7.7 24H14.3C14.7 24 15 23.7 15 23.3V17.7C15 17.3 14.7 17 14.3 17Z" fill="white"/>
        <path d="M32.3 17H25.7C25.3 17 25 17.3 25 17.7V23.3C25 23.7 25.3 24 25.7 24H32.3C32.7 24 33 23.7 33 23.3V17.7C33 17.3 32.7 17 32.3 17Z" fill="white"/>
        <path d="M23.3 24H16.7C16.3 24 16 24.3 16 24.7V30.3C16 30.7 16.3 31 16.7 31H23.3C23.7 31 24 30.7 24 30.3V24.7C24 24.3 23.7 24 23.3 24Z" fill="white"/>
      </svg>
    ),
  },
  walletConnect: {
    label: 'Ledger Live',
    icon: () => (
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#000"/>
        <path d="M10 24.6V28h13.4v-3.4H10zM10 10v3.4h3.4v11.2h3.4V10H10zM23.4 10v3.4H30v-3.4h-6.6zM26.6 17.2H30v-3.4h-3.4v3.4zM26.6 24.6H30V17.2h-3.4v7.4z" fill="white"/>
      </svg>
    ),
  },
  coinbaseWalletSDK: {
    label: 'Coinbase Wallet',
    icon: () => (
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#0052FF"/>
        <path d="M20 6C12.268 6 6 12.268 6 20s6.268 14 14 14 14-6.268 14-14S27.732 6 20 6zm-3.5 14c0-1.933 1.567-3.5 3.5-3.5s3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5-3.5-1.567-3.5-3.5z" fill="white"/>
      </svg>
    ),
  },
};

const CONNECTOR_ORDER = ['metaMask', 'okxWallet', 'walletConnect', 'coinbaseWalletSDK'];

function WalletModal({ onClose }: { onClose: () => void }) {
  const { address, connectors, connect, isLoading, error } = useWallet();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogTitleId = 'wallet-connect-dialog-title';
  const dialogDescriptionId = 'wallet-connect-dialog-description';

  const sorted = [...connectors].sort((a, b) => {
    const ai = CONNECTOR_ORDER.indexOf(a.id);
    const bi = CONNECTOR_ORDER.indexOf(b.id);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const handleConnect = (connector: Connector) => {
    connect({ connector });
  };

  useEffect(() => {
    if (address) onClose();
  }, [address, onClose]);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescriptionId}
        className="relative w-full max-w-sm mx-4 rounded-2xl bg-zinc-900 border border-zinc-700/50 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 id={dialogTitleId} className="text-lg font-semibold text-white">Connect Wallet</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 border-b border-zinc-800" />

        {/* Subtitle */}
        <p id={dialogDescriptionId} className="px-6 pt-3 pb-2 text-sm text-zinc-400 text-center">
          Select a wallet to connect
        </p>

        {/* Wallet list */}
        <div className="px-4 pb-5 space-y-1.5">
          {sorted.map((connector) => {
            const meta = WALLET_META[connector.id];
            if (!meta) return null;
            const Icon = meta.icon;
            return (
              <button
                key={connector.id}
                onClick={() => handleConnect(connector)}
                disabled={isLoading}
                className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl
                  text-white text-sm font-medium
                  bg-zinc-800/60 hover:bg-zinc-700/80
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-150 group"
              >
                <span>{meta.label}</span>
                <span className="opacity-80 group-hover:opacity-100 transition-opacity">
                  <Icon />
                </span>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="px-6 pb-4">
            <p className="text-sm text-rose-400 text-center">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function WalletConnect() {
  const { address, disconnect } = useWallet();
  const [isOpen, setIsOpen] = useState(false);

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          <code className="text-sm font-mono text-white">
            {address.slice(0, 6)}...{address.slice(-4)}
          </code>
        </span>
        <button
          onClick={disconnect}
          className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-rose-400
            hover:bg-zinc-800 border border-zinc-700 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-1.5 rounded-lg text-sm font-semibold
          bg-violet-600 text-white hover:bg-violet-500
          border border-violet-500 hover:border-violet-400
          transition-colors duration-150"
      >
        Connect wallet
      </button>

      {isOpen && <WalletModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
