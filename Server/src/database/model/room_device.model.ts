import { getRepository, getConnection } from "typeorm"
import { RoomDevice } from "../entity/room_device.entity"
import { isUndefined, isNumber } from "util"
import { EntityUtil } from "../util/entity.util"
import { BaseModel } from "../base.model"
import { Validate, checker } from "../util/validate.util"

export enum WidgetDevice {
    WidgetSmall = 0,
    WidgetLarge = 1
}

export enum StatusDevice {
    StatusOff = 0,
    StatusOn = 1
}

export enum UpdateDevice {
    NameRequired = "NAME_REQUIRED",
    NameLengthInvalid = "NAME_LENGTH_INVALID",
    StatusInvalid = "STATUS_INVALID",
    DeviceNotExists = "DEVICE_NOT_EXISTS"
}

export class RoomDeviceModel extends BaseModel {
    static getList(roomID: number) {
        return getRepository(RoomDevice).find({
            relations: ["esp", "room", "type"],
            where: {
                room: roomID
            }
        })
    }

    static async updateDevice(deviceId: number, object: any) {
        const repository = getRepository(RoomDevice)
        const find = await repository.findOne({ id: deviceId })
        const res = EntityUtil.create(RoomDevice, object)

        if (isUndefined(find)) return this.response({ code: UpdateDevice.DeviceNotExists })

        const validate = new Validate([
            checker(["name", "type.type"])
                .isRequired()
                .isNotEmpty()
                .custom("nameInvalid", (field: string, value: string) => {
                    if (field == "name") return true
                })
                .isLength(4, 30)
                .isMin(5)
                .isMax(3)
                .isNumber(),
            checker("value")
                .isRequired()
                .isNotEmpty()
                .isEmail(),
            checker(["type", "type.v"])
                .isRequired()
                .isNotEmpty()
                .isURL()
                .isIn(["google", "google.co", "google.com"])
        ])

        validate.execute({
            name: "Test",
            value: "izerocs.gmail.com",
            type: {
                id: 1,
                type: 2,
                v: "google.com"
            }
        })
    }
}
