"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./module/app.module");
const logger_util_1 = require("./util/logger.util");
const wildcard_adapter_1 = require("./adapter/wildcard.adapter");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: new logger_util_1.AppLogger()
    });
    await app.useStaticAssets(path_1.join(__dirname, "..", "public"));
    await app.useWebSocketAdapter(new wildcard_adapter_1.WildcardAdapter(app));
    if (process.env.ENVIRONMENT == "product")
        setTimeout(async () => await app.listen(3000, "0.0.0.0"), 2000);
    else
        setTimeout(async () => await app.listen(3000, "192.168.31.104"), 2000);
}
bootstrap();
//# sourceMappingURL=main.js.map