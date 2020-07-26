import { DynamicModule } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

export class DatabaseModule {
    static forRoot(): DynamicModule {
        return TypeOrmModule.forRoot(require("../ormconfig"))
    }
}
