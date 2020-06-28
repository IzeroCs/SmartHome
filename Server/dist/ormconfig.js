"use strict";
var config = {
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "izerocs",
    password: "khongbiet",
    database: "smarthome",
    cli: {
        entitiesDir: 'src/database/entity',
        migrationsDir: 'src/database/migrations',
        subscribersDir: 'src/database/subscriber'
    },
    entities: [__dirname + "/database/**/*.entity{.ts,.js}"],
    migrations: [__dirname + "/database/migrations/**/*{.ts,.js}"],
    subscribers: [__dirname + "/database/subscriber/**/*{.ts,.js}"],
    migrationsRun: false,
    synchronize: true,
    logging: true,
    logger: 'file',
    cache: true
};
module.exports = config;
//# sourceMappingURL=ormconfig.js.map