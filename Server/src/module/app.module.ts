import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from '../controller/app.controller'
import { AppService } from '../service/app.service'
import { AppGateway } from '../gateway/app.gateway'
import { EspGateway } from '../gateway/esp.gateway'

@Module({
  imports: [TypeOrmModule.forRoot()],
  controllers: [ AppController ],
  providers: [AppService, AppGateway, EspGateway],
})
export class AppModule {}
