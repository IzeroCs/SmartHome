import dotenv from "dotenv"
import { TypeOrm } from "./database/typeorm"
import { Websocket } from "./socket/websocket"

const typeOrm: TypeOrm = new TypeOrm()
const websocket: Websocket = new Websocket()

async function bootstrap() {
    await dotenv.config()
    await typeOrm.connection()
    await websocket.setup()
    await websocket.listen()
}

bootstrap()
