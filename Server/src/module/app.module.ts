import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from '../controller/app.controller';
import { AppService } from '../service/app.service';
import { AppGateway } from '../gateway/app.gateway';
import { EspGateway } from '../gateway/esp.gateway';
import * as OrmConfig from '../ormconfig';

@Module({
    imports: [TypeOrmModule.forRoot(OrmConfig) ],
    controllers: [AppController],
    providers: [AppService, AppGateway, EspGateway],
})
export class AppModule { }
