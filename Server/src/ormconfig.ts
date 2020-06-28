import { ConnectionOptions } from 'typeorm';
import * as path from 'path';

const config: ConnectionOptions = {
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "izerocs",
    password: "khongbiet",
    database: "smarthome",

    cli: {
        entitiesDir: path.join(__dirname, '.', 'database', 'entity'),
        migrationsDir: path.join(__dirname, '.', 'database', 'migartion'),
        subscribersDir: path.join(__dirname, '.', 'database', 'subscriber')
    },

    entities: [ path.join(__dirname, '..', 'dist', 'database', 'entity', '*.entity{.ts,.js}') ],
    migrations: [ path.join(__dirname, '..', 'dist', 'database', 'migration', '*{.ts,.js}') ],
    subscribers: [ path.join(__dirname, '..', 'dist', 'database', 'subscriber', '*{.ts,.js}') ],
    migrationsRun: true,
    synchronize: false,
    logging: true,
    logger: 'file'
};

export config;
