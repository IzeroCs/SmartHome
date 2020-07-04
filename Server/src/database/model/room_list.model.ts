import { getRepository } from "typeorm"
import { RoomList } from "../entity/room_list.entity"

export class RoomListModel {
    static getAll(): Promise<any> {
        return getRepository(RoomList).find({
            relations: ["type"],
            where: {
                enable: true,
            },
        })
    }
}
