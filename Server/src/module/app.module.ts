import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AppGateway } from "../gateway/app.gateway"
import { EspGateway } from "../gateway/esp.gateway"
import { SeedDatabase } from "../database/seed"
import * as OrmConfig from "../ormconfig"
import { Connection } from "typeorm"

@Module({
    imports: [TypeOrmModule.forRoot(OrmConfig)],
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
