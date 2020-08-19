import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import { StatusCloudEnum, IOPinEnum } from "../../socket/esp.const"
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
    input: IOPinEnum

    @Column("tinyint")
    outputType: IOPinEnum

    @Column("tinyint")
    outputPrimary: IOPinEnum

    @Column("tinyint")
    ouputSecondary: IOPinEnum

    @Column("tinyint", { nullable: true, default: 0 })
    dualToggleCount: IOPinEnum

    @Column({ nullable: true, default: 1 })
    statusCloud: StatusCloudEnum

    @Column({ nullable: true, default: false })
    statusClient: boolean
}
