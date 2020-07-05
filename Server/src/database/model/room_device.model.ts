import { getRepository, getConnection } from "typeorm"
import { RoomDevice } from "../entity/room_device.entity"
import { isUndefined } from "util"
import { EntityUtil } from "../util/entity.util"
import { BaseModel } from "../base.model"

export enum WidgetDevice {
    WidgetSmall = 0,
    WidgetLarge = 1,
}

export enum StatusDevice {
    StatusOff = 0,
    StatusOn = 1,
}

export enum UpdateDevice {
    NameRequired = "NAME_REQUIRED",
    NameLengthInvalid = "NAME_LENGTH_INVALID",
    StatusInvalid = "STATUS_INVALID",
    DeviceNotExists = "DEVICE_NOT_EXISTS",
}

export class RoomDeviceModel extends BaseModel {
    static getList(roomID: number) {
        return getRepository(RoomDevice).find({
            relations: ["esp", "room", "type"],
            where: {
                room: roomID,
            },
        })
    }

    static async updateDevice(deviceId: number, object: any) {
        const repository = getRepository(RoomDevice)
        const find = await repository.findOne({ id: deviceId })
        const res = EntityUtil.create(RoomDevice, object)

        if (isUndefined(find))
            return this.response({ code: UpdateDevice.DeviceNotExists })

        this.validate(res)
            .then(v => console.log("Value: ", v))
            .catch(err => console.log("Error: ", err))
    }
}
