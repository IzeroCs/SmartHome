import { NestExpressApplication } from "@nestjs/platform-express"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./module/app.module"
import { AppLogger } from "./util/logger.util"
import { WildcardAdapter } from "./adapter/wildcard.adapter"
import { join } from "path"

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: new AppLogger()
    })

    await app.useStaticAssets(join(__dirname, "..", "public"))
    await app.useWebSocketAdapter(new WildcardAdapter(app))
    setTimeout(async () => await app.listen(3000, "192.168.31.104"), 2000)
}
bootstrap()
