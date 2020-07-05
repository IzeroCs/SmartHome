import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm"

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
