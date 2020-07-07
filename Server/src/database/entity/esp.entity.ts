import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, OneToOne } from "typeorm"
import { EspPin } from "./esp_pin.entity"
import { RoomDevice } from "./room_device.entity"

@Entity()
export class Esp {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ default: false })
    online: boolean

    @Column({ default: false })
    auth: boolean

    @Column({ default: -100 })
    detail_rssi: string

    @OneToMany(
        type => RoomDevice,
        device => device.esp
    )
    devices: RoomDevice[]

    @OneToMany(
        type => EspPin,
        pin => pin.esp
    )
    pins: EspPin[]
}
