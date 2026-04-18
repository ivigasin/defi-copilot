'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPortfolio, fetchPositions, fetchRecommendations, fetchAlerts } from './api';

export function usePortfolio(address: string | null) {
  return useQuery({
    queryKey: ['portfolio', address],
    queryFn: () => fetchPortfolio(address!),
    enabled: !!address,
  });
}

export function usePositions(address: string | null) {
  return useQuery({
    queryKey: ['positions', address],
    queryFn: () => fetchPositions(address!),
    enabled: !!address,
  });
}

export function useRecommendations(address: string | null) {
  return useQuery({
    queryKey: ['recommendations', address],
    queryFn: () => fetchRecommendations(address!),
    enabled: !!address,
  });
}

export function useAlerts(address: string | null) {
  return useQuery({
    queryKey: ['alerts', address],
    queryFn: () => fetchAlerts(address!),
    enabled: !!address,
  });
}
