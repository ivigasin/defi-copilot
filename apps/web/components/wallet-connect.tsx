'use client';

import { useWallet } from '@/lib/wallet-context';

const WALLET_META: Record<string, { label: string; gradient: string; shadow: string; icon: () => React.ReactNode }> = {
  metaMask: {
    label: 'MetaMask',
    gradient: 'from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300',
    shadow: 'shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_28px_rgba(249,115,22,0.6)]',
    icon: () => (
      <svg width="20" height="20" viewBox="0 0 318.6 318.6" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    gradient: 'from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600',
    shadow: 'shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_28px_rgba(255,255,255,0.25)]',
    icon: () => (
      <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    gradient: 'from-purple-600 to-violet-500 hover:from-purple-500 hover:to-violet-400',
    shadow: 'shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_28px_rgba(139,92,246,0.6)]',
    icon: () => (
      <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#000"/>
        <path d="M10 24.6V28h13.4v-3.4H10zM10 10v3.4h3.4v11.2h3.4V10H10zM23.4 10v3.4H30v-3.4h-6.6zM26.6 17.2H30v-3.4h-3.4v3.4zM26.6 24.6H30V17.2h-3.4v7.4z" fill="white"/>
      </svg>
    ),
  },
};

const CONNECTOR_ORDER = ['metaMask', 'okxWallet', 'walletConnect'];

export function WalletConnect() {
  const { address, isLoading, error, connectors, connect, disconnect } = useWallet();

  if (address) {
    return (
      <div className="flex items-center gap-3 px-5 py-2.5 bg-violet-950 border-b border-violet-800">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          <span className="text-sm text-violet-300">Connected</span>
        </span>
        <code className="text-sm font-mono text-white bg-violet-800/60 px-2 py-0.5 rounded">
          {address.slice(0, 6)}…{address.slice(-4)}
        </code>
        <button
          onClick={disconnect}
          className="ml-auto text-sm text-violet-400 hover:text-rose-400 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  const sorted = [...connectors].sort((a, b) => {
    const ai = CONNECTOR_ORDER.indexOf(a.id);
    const bi = CONNECTOR_ORDER.indexOf(b.id);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return (
    <div className="flex flex-col items-center gap-3 px-5 py-4 bg-violet-950 border-b border-violet-800">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {sorted.map((connector) => {
          const meta = WALLET_META[connector.id];
          if (!meta) return null;
          const Icon = meta.icon;
          return (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
                bg-gradient-to-r ${meta.gradient} text-white
                disabled:opacity-50 disabled:cursor-not-allowed
                ${meta.shadow}
                transition-all duration-200`}
            >
              <Icon />
              {meta.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-sm text-rose-400 text-center max-w-sm">{error}</p>
      )}
    </div>
  );
}
