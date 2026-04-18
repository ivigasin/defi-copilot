'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useWallet } from '@/lib/wallet-context';

export function WalletConnect() {
  const { address: walletAddress, isLoading: isWalletLoading, error: walletError, connect: manualConnect, disconnect: manualDisconnect } = useWallet();
  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const { connectors, connect: wagmiConnect, isPending: isWagmiPending } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const [input, setInput] = useState('');
  const [showManual, setShowManual] = useState(false);

  // Sync wagmi connection to wallet context
  const activeAddress = walletAddress ?? (isWagmiConnected ? wagmiAddress : null);

  if (activeAddress) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-sm text-zinc-500">Connected:</span>
        <code className="text-sm font-mono bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded">
          {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
        </code>
        <button
          onClick={() => {
            manualDisconnect();
            if (isWagmiConnected) wagmiDisconnect();
          }}
          className="ml-auto text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => wagmiConnect({ connector })}
            disabled={isWagmiPending}
            className="px-3 py-1.5 text-sm font-medium rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            {connector.name}
          </button>
        ))}
        <button
          onClick={() => setShowManual(!showManual)}
          className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          {showManual ? 'Hide' : 'Enter address manually'}
        </button>
      </div>

      {showManual && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter EVM wallet address (0x...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
          <button
            onClick={() => manualConnect(input.trim())}
            disabled={isWalletLoading || !input.trim()}
            className="px-4 py-1.5 text-sm font-medium rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isWalletLoading ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      )}

      {walletError && <p className="text-sm text-red-500">{walletError}</p>}
    </div>
  );
}
