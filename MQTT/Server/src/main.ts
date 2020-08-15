import { TypeOrm } from "./database/typeorm"
import { MQTT } from "./mqtt/mqtt"
import dotenv from "dotenv"

const typeOrm: TypeOrm = new TypeOrm()
const mqtt: MQTT = new MQTT()

async function bootstrap() {
    await dotenv.config()
    await typeOrm.connection()
    await mqtt.setup()
    await mqtt.run()
}

bootstrap()
