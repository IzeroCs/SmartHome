import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AppGateway } from './app.gateway'
import { EspGateway } from './esp.gateway'

@Module({
  imports: [TypeOrmModule.forRoot()],
  controllers: [],
  providers: [AppGateway, EspGateway],
})
export class AppModule {}
