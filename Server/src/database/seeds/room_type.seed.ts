import { BaseSeed } from "../base.seed"
import { RoomType } from "../entity/room_type.entity"

export class RoomTypeSeed extends BaseSeed {
    private datas: object = {
        1: "living_room",
        2: "bed_room",
        3: "kitchen_room",
        4: "bath_room",
        5: "balcony_room",
        6: "stairs_room",
        7: "stairs_room",
        8: "mezzanine_room",
        9: "roof_room",
    }

    async seed() {
        const repository = this.connection.getRepository(RoomType)
        const keys = Object.keys(this.datas)

        if ((await repository.count()) <= 0) {
            this.logger.debug("Insert first data room type")

            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i]
                const name = this.datas[key]
                const room = new RoomType()

                room.name = name
                room.type = parseInt(key)
                room.enable = true

                await repository.save(room)
                this.logger.debug(`Room type ${name} has been saved`)
            }
        }
    }
}
