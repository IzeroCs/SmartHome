"use strict";
const host = process.env.DB_HOST || "localhost";
const port = process.env.DB_PORT || 3306;
const user = process.env.DB_USER || "root";
const pass = process.env.DB_PASS || "";
const name = process.env.DB_NAME || "smarthome";
const config = {
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
    entities: [__dirname + "/database/entity/*.entity{.ts,.js}"],
    migrations: [__dirname + "/database/migrations/*{.ts,.js}"],
    subscribers: [__dirname + "/database/subscribers/*{.ts,.js}"],
    migrationsRun: false,
    synchronize: true,
    logging: true,
    logger: "file",
    cache: true
};
module.exports = config;
//# sourceMappingURL=ormconfig.js.map