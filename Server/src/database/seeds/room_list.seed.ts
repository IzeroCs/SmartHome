import { BaseSeed } from "../base.seed"
import { RoomList } from "../entity/room_list.entity"
import { RoomType } from "../entity/room_type.entity"
import { isNull } from "util"

export class RoomListSeed extends BaseSeed {
    private datas: Array<object> = [
        { name: "Phòng khách", type: 1 },
        { name: "Phòng ngủ", type: 2 },
        { name: "Phòng bếp", type: 3 },
        { name: "Phòng tắm", type: 4 },
        { name: "Ban công", type: 5 },
        { name: "Cầu thang", type: 6 },
        { name: "Sân nhà", type: 7 },
        { name: "Gác lửng", type: 8 },
        { name: "Gác mái", type: 9 },
    ]

    async seed() {
        const repository = this.connection.getRepository(RoomList)
        const repositoryRoomType = this.connection.getRepository(RoomType)

        if ((await repository.count()) <= 0) {
            this.logger.debug("Insert first data room list")

            for (let i = 0; i < this.datas.length; ++i) {
                const data = this.datas[i]
                const name = data["name"]
                const type = parseInt(data["type"])
                const roomType = await repositoryRoomType.findOne({
                    type: type,
                })

                if (!isNull(roomType)) {
                    const room = new RoomList()
                    room.name = name
                    room.type = roomType
                    room.enable = true

                    await repository.save(room)
                    this.logger.debug(`Room list ${name} has been saved`)
                }
            }
        }
    }
}
