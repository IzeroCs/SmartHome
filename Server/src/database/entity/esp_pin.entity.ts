import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    ManyToOne,
} from "typeorm"
import { Esp } from "./esp.entity"
import { RoomDevice } from "./room_device.entity"

@Entity()
export class EspPin {
    @PrimaryGeneratedColumn()
    @OneToOne(
        type => RoomDevice,
        device => device.pin,
    )
    id: number

    @ManyToOne(
        type => Esp,
        esp => esp.pins,
    )
    esp: Esp

    @Column("tinyint")
    name: number

    @Column("tinyint")
    input: number

    @Column("tinyint")
    outputType: number

    @Column("tinyint")
    outputPrimary: number

    @Column("tinyint")
    ouputSecondary: number

    @Column("tinyint")
    dualToggleCount: number

    @Column()
    status: boolean
}
