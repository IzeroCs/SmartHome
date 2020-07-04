import { getRepository } from "typeorm"
import { RoomDevice } from "../entity/room_device.entity"

export class RoomDeviceModel {
    static getList(roomID: string | number) {
        return getRepository(RoomDevice).find({
            relations: ["esp", "room", "type"],
            where: {
                room: roomID,
            },
        })
    }
}
