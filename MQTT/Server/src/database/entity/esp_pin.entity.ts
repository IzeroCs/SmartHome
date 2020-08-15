import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import { StatusCloud, IOPin } from "../../mqtt/esp.enum"
import { Esp } from "./esp.entity"

@Entity()
export class EspPin {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(type => Esp, esp => esp.pins)
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
    statusClient: boolean
}
