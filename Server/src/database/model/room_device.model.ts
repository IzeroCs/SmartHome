import { getRepository, getConnection } from "typeorm"
import { RoomDevice } from "../entity/room_device.entity"
import { isUndefined, isNumber } from "util"
import { EntityUtil } from "../util/entity.util"
import { BaseModel } from "../base.model"
import { Validate, checker } from "../util/validate.util"
import { MiddlewareModel } from "../middleware.model"
import { ErrorModel, NSP } from "../error.model"

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

    static getDevice(deviceId: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const repository = getRepository(RoomDevice)
            const find = await repository.findOne({ id: deviceId }, { relations: ["esp", "room", "type"] })
            const mid = new MiddlewareModel()

            mid.preProcessed(() => {
                if (isUndefined(find)) return NSP.deviceNotExists
            })
                .run()
                .response(error => {
                    if (error) reject(error)
                    else resolve(find)
                })
        })
    }

    static updateDevice(deviceId: number, object: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const repository = getRepository(RoomDevice)
            const find = await repository.findOne({ id: deviceId }, { relations: ["esp"] })
            const res = EntityUtil.create(RoomDevice, object)
            const mid = new MiddlewareModel()

            mid.preProcessed(() => {
                if (isUndefined(find) || isUndefined(find.esp)) return NSP.deviceNotExists
                if (!find.esp.online) return NSP.deviceNotOnline
            })

            mid.validate(
                checker("name")
                    .isRequired()
                    .isNotEmpty()
                    .isLength(5, 30),

                checker("status")
                    .isRequired()
                    .isNumber()
            )

            mid.preUpdate(() => {
                if (find.name === res.name && find.status === res.status) return NSP.hasNotChanged
            })

            mid.update(async () => {
                await repository.save(res)
            })

            mid.run(res)
            mid.response(error => {
                if (error) return reject(error)
                else return resolve(res)
            })
        })
    }
}
