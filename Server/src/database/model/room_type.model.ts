import { getRepository } from "typeorm"
import { RoomType } from "../entity/room_type.entity"

export class RoomTypeModel {
    static getAll(): Promise<any> {
        return getRepository(RoomType).find({ enable: true })
    }
}
