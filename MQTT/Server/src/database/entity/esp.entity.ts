import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, OneToOne, Unique, Index } from "typeorm"
import { EspPin } from "./esp_pin.entity"

@Entity()
export class Esp {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @Index({ unique: true })
    name: string

    @Column({ nullable: true, default: false })
    online: boolean

    @Column({ nullable: true, default: false })
    authentication: boolean

    @Column({ nullable: true, default: "" })
    token: string

    @Column({ nullable: true, default: "" })
    token_generator: string

    @Column({ nullable: true, default: -100 })
    detail_rssi: number

    @Column({ nullable: true, default: 0 })
    detail_heap: number

    @Column({ nullable: true, default: 0 })
    esp_chip_id: number

    @Column({ nullable: true, default: 0 })
    esp_free_sketch: number

    @Column({ nullable: true, default: 0 })
    esp_boot_version: number

    @OneToMany(type => EspPin, pin => pin.esp)
    pins: EspPin[]

    @Column({ nullable: true, default: false })
    authentication_at: Date
}
