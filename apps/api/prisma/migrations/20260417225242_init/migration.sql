-- CreateEnum
CREATE TYPE "PositionType" AS ENUM ('LENDING', 'BORROWING', 'LIQUIDITY_POOL', 'STAKING', 'FARMING', 'VAULT');

-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('IDLE_STABLECOIN', 'HIGH_CONCENTRATION', 'LOW_HEALTH_FACTOR', 'UNCLAIMED_REWARDS', 'LOW_YIELD');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('HEALTH_FACTOR', 'PORTFOLIO_DROP', 'YIELD_DROP', 'LARGE_BALANCE_CHANGE');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "wallets" (
    "address" TEXT NOT NULL,
    "label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "portfolio_snapshots" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "total_usd_value" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_balances" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "token_symbol" TEXT NOT NULL,
    "token_address" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "usd_value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "asset_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocol_positions" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "protocol" TEXT NOT NULL,
    "position_type" "PositionType" NOT NULL,
    "asset_symbols" TEXT[],
    "usd_value" DOUBLE PRECISION NOT NULL,
    "debt_usd" DOUBLE PRECISION,
    "apy" DOUBLE PRECISION,
    "rewards_usd" DOUBLE PRECISION,
    "health_factor" DOUBLE PRECISION,
    "risk_score" DOUBLE PRECISION,
    "metadata" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "protocol_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "type" "RecommendationType" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "rationale" TEXT[],
    "confidence" DOUBLE PRECISION NOT NULL,
    "expected_impact_usd" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_rules" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "alert_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_events" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "portfolio_snapshots_wallet_address_timestamp_idx" ON "portfolio_snapshots"("wallet_address", "timestamp");

-- CreateIndex
CREATE INDEX "asset_balances_wallet_address_idx" ON "asset_balances"("wallet_address");

-- CreateIndex
CREATE INDEX "protocol_positions_wallet_address_idx" ON "protocol_positions"("wallet_address");

-- CreateIndex
CREATE INDEX "recommendations_wallet_address_idx" ON "recommendations"("wallet_address");

-- CreateIndex
CREATE INDEX "alert_rules_wallet_address_idx" ON "alert_rules"("wallet_address");

-- CreateIndex
CREATE INDEX "alert_events_wallet_address_created_at_idx" ON "alert_events"("wallet_address", "created_at");

-- AddForeignKey
ALTER TABLE "portfolio_snapshots" ADD CONSTRAINT "portfolio_snapshots_wallet_address_fkey" FOREIGN KEY ("wallet_address") REFERENCES "wallets"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_balances" ADD CONSTRAINT "asset_balances_wallet_address_fkey" FOREIGN KEY ("wallet_address") REFERENCES "wallets"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_positions" ADD CONSTRAINT "protocol_positions_wallet_address_fkey" FOREIGN KEY ("wallet_address") REFERENCES "wallets"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_wallet_address_fkey" FOREIGN KEY ("wallet_address") REFERENCES "wallets"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_wallet_address_fkey" FOREIGN KEY ("wallet_address") REFERENCES "wallets"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_events" ADD CONSTRAINT "alert_events_wallet_address_fkey" FOREIGN KEY ("wallet_address") REFERENCES "wallets"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_events" ADD CONSTRAINT "alert_events_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "alert_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
