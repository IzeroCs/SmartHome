import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './module/app.module';
import { AppLogger } from './util/logger.util';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: new AppLogger(),
    });
    app.useStaticAssets(join(__dirname, '..', 'public'));
    await app.listen(3000, '192.168.31.104');
}
bootstrap();
