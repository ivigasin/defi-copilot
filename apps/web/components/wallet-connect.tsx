'use client';

import { useState } from 'react';
import { useWallet } from '@/lib/wallet-context';

export function WalletConnect() {
  const { address, isLoading, error, connect, connectMetaMask, disconnect } = useWallet();
  const [input, setInput] = useState('');
  const [showManual, setShowManual] = useState(false);

  if (address) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-sm text-zinc-500">Connected:</span>
        <code className="text-sm font-mono bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded">
          {address.slice(0, 6)}...{address.slice(-4)}
        </code>
        <button
          onClick={disconnect}
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
        <button
          onClick={connectMetaMask}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
        >
          <MetaMaskIcon />
          MetaMask
        </button>
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
            onClick={() => connect(input.trim())}
            disabled={isLoading || !input.trim()}
            className="px-4 py-1.5 text-sm font-medium rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function MetaMaskIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32.958 1L19.918 10.688l2.43-5.738L32.958 1z" fill="#E17726" stroke="#E17726" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.042 1l12.91 9.782-2.312-5.832L2.042 1z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M28.18 23.533l-3.465 5.301 7.414 2.04 2.128-7.22-6.077-.12zM1.75 23.654l2.114 7.22 7.4-2.04-3.45-5.3-6.064.12z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.84 14.515l-2.07 3.127 7.37.335-.248-7.928-5.052 4.466zM24.16 14.515l-5.12-4.56-.168 8.022 7.37-.335-2.082-3.127z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.264 28.834l4.44-2.155-3.83-2.986-.61 5.14zM19.296 26.679l4.44 2.155-.61-5.14-3.83 2.985z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
