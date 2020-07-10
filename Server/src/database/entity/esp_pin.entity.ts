import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm"
import { Esp } from "./esp.entity"
import { RoomDevice } from "./room_device.entity"
import { EspGateway } from "../../gateway/esp.gateway"

@Entity()
export class EspPin {
    @PrimaryGeneratedColumn()
    @OneToOne(
        type => RoomDevice,
        device => device.pin
    )
    id: number

    @ManyToOne(
        type => Esp,
        esp => esp.pins
    )
    esp: Esp

    @Column("tinyint", { nullable: true })
    name: number

    @Column("tinyint")
    input: number

    @Column("tinyint")
    outputType: number

    @Column("tinyint")
    outputPrimary: number

    @Column("tinyint")
    ouputSecondary: number

    @Column("tinyint", { nullable: true, default: 0 })
    dualToggleCount: number

    @Column({ nullable: true, default: 1 })
    statusCloud: number

    @Column({ nullable: true, default: false })
    status: boolean
}
