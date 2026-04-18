import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from './prisma';
import { createProvider } from '@defi-copilot/provider-sdk';
import { processSnapshot } from './jobs/snapshot';
import { processRecommendations } from './jobs/recommendations';
import { processAlerts } from './jobs/alerts';

const REDIS_HOST = process.env.REDIS_HOST ?? 'localhost';
const REDIS_PORT = Number(process.env.REDIS_PORT ?? 6379);
const SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const connection = new IORedis({ host: REDIS_HOST, port: REDIS_PORT, maxRetriesPerRequest: null });
const providerType = (process.env.PROVIDER_TYPE ?? 'mock') as 'mock' | 'evm';
const provider = createProvider(providerType);

const snapshotQueue = new Queue('snapshot', { connection });

const worker = new Worker(
  'snapshot',
  async (job) => {
    const { walletAddress } = job.data as { walletAddress: string };

    // 1. Fetch and store snapshot
    const { snapshot, balances, positions } = await processSnapshot(walletAddress, provider, prisma);

    // 2. Refresh recommendations
    await processRecommendations(walletAddress, balances, positions, prisma);

    // 3. Evaluate alerts
    await processAlerts(walletAddress, balances, positions, snapshot, prisma);
  },
  { connection },
);

worker.on('completed', (job) => {
  console.log(`[worker] Job ${job.id} completed for ${job.data.walletAddress}`);
});

worker.on('failed', (job, err) => {
  console.error(`[worker] Job ${job?.id} failed:`, err.message);
});

async function scheduleAllWallets() {
  const wallets = await prisma.wallet.findMany();
  console.log(`[scheduler] Found ${wallets.length} wallet(s)`);

  for (const wallet of wallets) {
    await snapshotQueue.add(
      'snapshot',
      { walletAddress: wallet.address },
      {
        repeat: { every: SNAPSHOT_INTERVAL_MS },
        jobId: `snapshot-${wallet.address}`,
      },
    );
    console.log(`[scheduler] Scheduled snapshot for ${wallet.address}`);
  }
}

async function main() {
  console.log('[worker] Starting DeFi Copilot worker...');
  await prisma.$connect();
  await scheduleAllWallets();
  console.log(`[worker] Ready. Polling every ${SNAPSHOT_INTERVAL_MS / 1000}s`);
}

main().catch((err) => {
  console.error('[worker] Fatal error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[worker] Shutting down...');
  await worker.close();
  await snapshotQueue.close();
  await connection.quit();
  await prisma.$disconnect();
  process.exit(0);
});
