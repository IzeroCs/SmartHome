import { ConnectionOptions } from "typeorm"

const config: ConnectionOptions = {
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "izerocs",
    password: "khongbiet",
    database: "smarthome",

    cli: {
        entitiesDir: "src/database/entity",
        migrationsDir: "src/database/migrations",
        subscribersDir: "src/database/subscriber",
    },

    entities: [__dirname + "/database/entity/*.entity{.ts,.js}"],
    migrations: [__dirname + "/database/migrations/*{.ts,.js}"],
    subscribers: [__dirname + "/database/subscribers/*{.ts,.js}"],

    migrationsRun: false,
    synchronize: true,
    logging: true,
    logger: "file",
    cache: true,
}

export = config
