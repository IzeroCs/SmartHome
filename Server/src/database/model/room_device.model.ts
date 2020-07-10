import { getRepository, getConnection } from "typeorm"
import { RoomDevice } from "../entity/room_device.entity"
import { isUndefined, isNumber } from "util"
import { EntityUtil } from "../util/entity.util"
import { BaseModel } from "../base.model"
import { Validate, checker } from "../util/validate.util"
import { MiddlewareModel } from "../middleware.model"
import { ErrorModel, NSP } from "../error.model"
import { EspPin } from "../entity/esp_pin.entity"

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
            relations: ["esp", "pin", "room", "type"],
            where: {
                room: roomID
            }
        })
    }

    static getDevice(deviceId: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const repository = getRepository(RoomDevice)
            const find = await repository.findOne({ id: deviceId }, { relations: ["esp", "pin", "room", "type"] })
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

    static getDeviceList(espId: number): Promise<any> {
        return new Promise(async resolve => {
            const repository = getRepository(RoomDevice)
            const mid = new MiddlewareModel()
            const find = await repository.find({
                relations: ["esp", "pin", "room", "type"],
                where: {
                    esp: espId
                }
            })

            resolve(find)
        })
    }

    static updateDevice(deviceId: number, object: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const repository = getRepository(RoomDevice)
            const find = await repository.findOne({ id: deviceId }, { relations: ["esp", "pin"] })
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

                checker("pin.status")
                    .isRequired()
                    .isNumber()
            )

            mid.preUpdate(() => {
                if (find.name === res.name && find.pin.status === res.pin.status) return NSP.hasNotChanged
            })

            mid.update(async () => {
                await repository.update(deviceId, {
                    name: res.name,
                    pin: {
                        status: res.pin.status
                    }
                })
            })

            mid.run(res)
            mid.response(error => {
                if (error) return reject(error)
                else return resolve(res)
            })
        })
    }

    static updateStatusDevice(deviceId: number, object: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const repository = getRepository(RoomDevice)
            const find = await repository.findOne({ id: deviceId }, { relations: ["esp", "pin"] })
            const res = EntityUtil.create(RoomDevice, object)
            const mid = new MiddlewareModel()

            mid.preProcessed(() => {
                if (isUndefined(find) || isUndefined(find.esp)) return NSP.deviceNotExists
                if (!find.esp.online) return NSP.deviceNotOnline
            })

            mid.validate(
                checker("pin.status")
                    .isRequired()
                    .isBoolean()
            )

            mid.preUpdate(() => {
                if (find.pin.status === res.pin.status) return NSP.hasNotChanged
            })

            mid.update(async () => {
                const repositoryEspPin = await getRepository(EspPin)

                await repositoryEspPin.update(find.pin.id, {
                    status: res.pin.status
                })
            })

            mid.run(res)
            mid.response(error => {
                if (error) return reject(error)
                else return resolve(res)
            })
        })
    }
}
