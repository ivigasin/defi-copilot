import { Controller, Post, Get, Param, Body, UsePipes } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletSchema, CreateWalletDto } from './dto/create-wallet.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  listWallets() {
    return this.walletsService.listWallets();
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateWalletSchema))
  registerWallet(@Body() dto: CreateWalletDto) {
    return this.walletsService.registerWallet(dto);
  }

  @Get(':address/portfolio')
  getPortfolio(@Param('address') address: string) {
    return this.walletsService.getPortfolio(address);
  }

  @Get(':address/positions')
  getPositions(@Param('address') address: string) {
    return this.walletsService.getPositions(address);
  }

  @Get(':address/recommendations')
  getRecommendations(@Param('address') address: string) {
    return this.walletsService.getRecommendations(address);
  }

  @Get(':address/alerts')
  getAlerts(@Param('address') address: string) {
    return this.walletsService.getAlerts(address);
  }
}
