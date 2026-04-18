import { Module } from '@nestjs/common';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import { WalletsRepository } from './wallets.repository';
import { createProvider } from '@defi-copilot/provider-sdk';

@Module({
  controllers: [WalletsController],
  providers: [
    WalletsService,
    WalletsRepository,
    {
      provide: 'PORTFOLIO_PROVIDER',
      useFactory: () => {
        const providerType = process.env.PROVIDER_TYPE ?? 'mock';
        return createProvider(providerType as 'mock' | 'evm');
      },
    },
  ],
})
export class WalletsModule {}
