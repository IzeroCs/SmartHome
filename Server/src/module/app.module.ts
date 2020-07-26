import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { DatabaseModule } from "./database.module"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AppGateway } from "../gateway/app.gateway"
import { EspGateway } from "../gateway/esp.gateway"
import { SeedDatabase } from "../database/seed"
import { Connection } from "typeorm"

@Module({
    imports: [ConfigModule.forRoot(), DatabaseModule.forRoot()],
    controllers: [],
    providers: [AppGateway, EspGateway],
    exports: [TypeOrmModule]
})
export class AppModule {
    constructor(private connection: Connection) {
        const seed = new SeedDatabase(connection)
        seed.seed()
    }
}
