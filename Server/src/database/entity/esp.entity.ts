import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    JoinColumn,
    OneToOne,
} from "typeorm"
import { EspPin } from "./esp_pin.entity"
import { RoomDevice } from "./room_device.entity"

@Entity()
export class Esp {
    @PrimaryGeneratedColumn()
    @OneToOne(
        type => RoomDevice,
        device => device.esp,
    )
    id: number

    @Column()
    name: string

    @Column()
    online: boolean

    @Column()
    auth: boolean

    @OneToMany(
        type => EspPin,
        pin => pin.esp,
    )
    pins: EspPin[]
}
