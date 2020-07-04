import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm"
import { RoomDevice } from "./room_device.entity"

@Entity()
export class DeviceType {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    nsp: String

    @Column()
    type: number
}
