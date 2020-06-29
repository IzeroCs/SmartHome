import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    OneToMany,
    JoinColumn,
} from "typeorm"
import { RoomList } from "./room_list.entity"

@Entity()
export class RoomType {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column("tinyint")
    type: number

    @Column()
    enable: boolean

    @OneToMany(
        type => RoomList,
        room => room.type,
    )
    lists: RoomList[]
}
