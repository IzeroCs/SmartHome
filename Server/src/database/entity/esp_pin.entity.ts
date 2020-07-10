import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm"
import { Esp } from "./esp.entity"
import { RoomDevice } from "./room_device.entity"
import { EspGateway, StatusCloud, IOPin } from "../../gateway/esp.gateway"

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
    name: string

    @Column("tinyint")
    input: IOPin

    @Column("tinyint")
    outputType: IOPin

    @Column("tinyint")
    outputPrimary: IOPin

    @Column("tinyint")
    ouputSecondary: IOPin

    @Column("tinyint", { nullable: true, default: 0 })
    dualToggleCount: IOPin

    @Column({ nullable: true, default: 1 })
    statusCloud: StatusCloud

    @Column({ nullable: true, default: false })
    status: boolean
}
