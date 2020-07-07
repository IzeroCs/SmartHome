import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToOne, ManyToOne } from "typeorm"
import { EspPin } from "./esp_pin.entity"
import { Esp } from "./esp.entity"
import { RoomList } from "./room_list.entity"
import { DeviceType } from "./device_type.entity"
import { StatusDevice, WidgetDevice } from "../model/room_device.model"

@Entity()
export class RoomDevice {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ default: "", nullable: true })
    descriptor: string

    @Column("tinyint", { default: 0 })
    widget: number

    @Column("tinyint", { default: 0, nullable: true })
    status: number

    @ManyToOne(
        type => DeviceType,
        type => type.type
    )
    type: DeviceType

    @OneToOne(
        type => EspPin,
        pin => pin.id
    )
    @JoinColumn()
    pin: EspPin

    @ManyToOne(
        type => Esp,
        esp => esp.devices
    )
    esp: Esp

    @ManyToOne(
        type => RoomList,
        room => room.devices
    )
    room: RoomList
}
