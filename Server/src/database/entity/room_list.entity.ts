import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    OneToMany,
    ManyToOne,
} from "typeorm"
import { RoomType } from "./room_type.entity"
import { RoomDevice } from "./room_device.entity"

@Entity()
export class RoomList {
    @PrimaryGeneratedColumn()
    @OneToOne(
        type => RoomDevice,
        device => device.room,
    )
    @JoinColumn()
    id: number

    @Column()
    name: string

    @Column()
    enable: boolean

    @ManyToOne(
        type => RoomType,
        type => type.lists,
    )
    type: RoomType
}
