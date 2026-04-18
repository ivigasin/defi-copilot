import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { WalletsModule } from './wallets/wallets.module';

@Global()
@Module({
  imports: [WalletsModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
