import { AlertEvent } from '@defi-copilot/domain';
import { AlertContext, AlertEvaluator } from './types';
import { healthFactorEvaluator } from './rules/health-factor';
import { portfolioDropEvaluator } from './rules/portfolio-drop';
import { yieldDropEvaluator } from './rules/yield-drop';
import { largeBalanceChangeEvaluator } from './rules/large-balance-change';

const DEFAULT_EVALUATORS: AlertEvaluator[] = [
  healthFactorEvaluator,
  portfolioDropEvaluator,
  yieldDropEvaluator,
  largeBalanceChangeEvaluator,
];

export function evaluateAlerts(
  context: AlertContext,
  evaluators: AlertEvaluator[] = DEFAULT_EVALUATORS,
): AlertEvent[] {
  return evaluators.flatMap((evaluator) => evaluator(context));
}
