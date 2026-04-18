const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message?.message ?? body.message ?? `API error ${res.status}`);
  }
  return res.json();
}

export interface Wallet {
  address: string;
  label: string | null;
  createdAt: string;
}

export interface AssetBalance {
  id: string;
  walletAddress: string;
  chainId: number;
  tokenSymbol: string;
  tokenAddress: string | null;
  amount: number;
  usdValue: number;
}

export interface PortfolioSnapshot {
  id: string;
  walletAddress: string;
  totalUsdValue: number;
  timestamp: string;
  balances: AssetBalance[];
}

export interface ProtocolPosition {
  id: string;
  walletAddress: string;
  chainId: number;
  protocol: string;
  positionType: string;
  assetSymbols: string[];
  usdValue: number;
  debtUsd: number | null;
  apy: number | null;
  rewardsUsd: number | null;
  healthFactor: number | null;
  riskScore: number | null;
  updatedAt: string;
}

export interface Recommendation {
  id: string;
  walletAddress: string;
  type: string;
  title: string;
  summary: string;
  rationale: string[];
  confidence: number;
  expectedImpactUsd: number | null;
  createdAt: string;
}

export interface AlertEvent {
  id: string;
  walletAddress: string;
  ruleId: string;
  message: string;
  severity: string;
  createdAt: string;
}

export function registerWallet(address: string, label?: string) {
  return apiFetch<Wallet>('/wallets', {
    method: 'POST',
    body: JSON.stringify({ address, label }),
  });
}

export function fetchPortfolio(address: string) {
  return apiFetch<PortfolioSnapshot>(`/wallets/${address}/portfolio`);
}

export function fetchPositions(address: string) {
  return apiFetch<ProtocolPosition[]>(`/wallets/${address}/positions`);
}

export function fetchRecommendations(address: string) {
  return apiFetch<Recommendation[]>(`/wallets/${address}/recommendations`);
}

export function fetchAlerts(address: string) {
  return apiFetch<AlertEvent[]>(`/wallets/${address}/alerts`);
}
