import { BaseSeed } from "../base.seed"
import { getRepository } from "typeorm"
import { DeviceType } from "../entity/device_type.entity"

export class DeviceTypeSeed extends BaseSeed {
    private def = [
        {
            name: "Đèn",
            nsp: "light",
            type: 1,
        },
        {
            name: "Quạt",
            nsp: "fan",
            type: 2,
        },
        {
            name: "Bình nóng lạnh",
            nsp: "heater",
            type: 3,
        },
    ]

    async seed() {
        const repository = getRepository(DeviceType)
        const count = await repository.count()

        if (count <= 0) {
            this.logger.debug("Insert first data device type")

            for (let i = 0; i < this.def.length; ++i) {
                const type = this.def[i]
                const record = new DeviceType()

                record.name = type.name
                record.nsp = type.nsp
                record.type = type.type

                await repository.save(record)
                this.logger.debug(`Added device type ${type.name}`)
            }
        }
    }
}
