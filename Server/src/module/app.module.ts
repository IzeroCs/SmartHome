import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AppController } from "../controller/app.controller"
import { AppService } from "../service/app.service"
import { AppGateway } from "../gateway/app.gateway"
import { EspGateway } from "../gateway/esp.gateway"
import { SeedDatabase } from "../database/seed"
import * as OrmConfig from "../ormconfig"
import { Connection } from "typeorm"

@Module({
    imports: [TypeOrmModule.forRoot(OrmConfig)],
    controllers: [AppController],
    providers: [AppService, AppGateway, EspGateway],
    exports: [TypeOrmModule]
})
export class AppModule {
    constructor(private connection: Connection) {
        const seed = new SeedDatabase(connection)
        seed.seed()
    }
}
