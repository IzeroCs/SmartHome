import { ConnectionOptions } from "typeorm"

const host: any = process.env.DB_HOST || "localhost"
const port: any = process.env.DB_PORT || 3306
const user: any = process.env.DB_USER || "root"
const pass: any = process.env.DB_PASS || ""
const name: any = process.env.DB_NAME || "mqtt"

const config: ConnectionOptions = {
    type: "mysql",
    host: host,
    port: port,
    username: user,
    password: pass,
    database: name,

    cli: {
        entitiesDir: "src/database/entity",
        migrationsDir: "src/database/migrations",
        subscribersDir: "src/database/subscriber"
    },

    entities: [__dirname + "/entity/*.entity{.ts,.js}"],
    migrations: [__dirname + "/migrations/*{.ts,.js}"],
    subscribers: [__dirname + "/subscribers/*{.ts,.js}"],

    migrationsRun: false,
    synchronize: true,
    logging: true,
    logger: "file",
    cache: true
}

export = config
