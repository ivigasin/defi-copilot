import { Recommendation } from '@defi-copilot/domain';
import { PortfolioData, RecommendationRule } from './types';
import { idleStablecoinRule } from './rules/idle-stablecoin';
import { highConcentrationRule } from './rules/high-concentration';
import { lowHealthFactorRule } from './rules/low-health-factor';
import { unclaimedRewardsRule } from './rules/unclaimed-rewards';
import { lowYieldRule } from './rules/low-yield';

const DEFAULT_RULES: RecommendationRule[] = [
  idleStablecoinRule,
  highConcentrationRule,
  lowHealthFactorRule,
  unclaimedRewardsRule,
  lowYieldRule,
];

export function evaluateRecommendations(
  data: PortfolioData,
  rules: RecommendationRule[] = DEFAULT_RULES,
): Recommendation[] {
  return rules.flatMap((rule) => rule(data));
}
