import { BaseSeed } from "../base.seed"
import { RoomDevice } from "../entity/room_device.entity"
import { RoomList } from "../entity/room_list.entity"
import { Esp } from "../entity/esp.entity"
import { isNull } from "util"
import { DeviceType } from "../entity/device_type.entity"

export class RoomDeviceSeed extends BaseSeed {
    async seed() {
        const repository = this.connection.getRepository(RoomDevice)
        const repositoryRoom = this.connection.getRepository(RoomList)
        const repositoryEsp = this.connection.getRepository(Esp)
        const repositoryDeviceType = this.connection.getRepository(DeviceType)
        const roomFind = await repositoryRoom.findOne({ name: "Phòng khách" })
        const deviceTypeLight = await repositoryDeviceType.findOne({ type: 1 })
        const deviceTypeFan = await repositoryDeviceType.findOne({ type: 2 })
        const deviceTypeHeater = await repositoryDeviceType.findOne({ type: 3 })
        const espFind = await repositoryEsp.findOne({ name: "ESP2Z4R1U8L2U0ZSC1T5K3M" }, { relations: ["pins"] })

        if (isNull(roomFind) || isNull(espFind)) return

        const deviceCount = await repository.count({ esp: espFind })

        if (deviceCount > 0) return

        this.logSeedRunning()
        const devices = [
            {
                name: "Đèn",
                des: "Trái",
                pin: espFind.pins[0],
                type: deviceTypeLight,
                widget: 0
            },
            {
                name: "Đèn",
                des: "Phải",
                pin: espFind.pins[2],
                type: deviceTypeLight,
                widget: 0
            },
            {
                name: "Quạt trần",
                des: "",
                pin: espFind.pins[4],
                type: deviceTypeLight,
                widget: 1
            },
            {
                name: "Quạt đứng",
                des: "",
                pin: espFind.pins[5],
                type: deviceTypeFan,
                widget: 0
            },
            {
                name: "Quạt bàn",
                des: "",
                pin: espFind.pins[6],
                type: deviceTypeFan,
                widget: 0
            },
            {
                name: "Bình nóng lạnh",
                des: "",
                pin: espFind.pins[7],
                type: deviceTypeHeater,
                widget: 0
            },
            {
                name: "Bình nóng lạnh",
                des: "",
                pin: espFind.pins[7],
                type: deviceTypeHeater,
                widget: 0
            }
        ]

        for (let i = 0; i < devices.length; ++i) {
            const device = devices[i]
            const deviceRecord = new RoomDevice()

            deviceRecord.name = device.name
            deviceRecord.descriptor = device.des
            deviceRecord.pin = device.pin
            deviceRecord.esp = espFind
            deviceRecord.room = roomFind
            deviceRecord.type = device.type
            deviceRecord.widget = device.widget

            await repository.save(deviceRecord)
            this.logger.debug(`Room device ${device.name} added for ${roomFind.name}`)
        }

        this.logSeedRunned()
    }
}
