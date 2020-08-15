import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, OneToOne } from "typeorm"
import { EspPin } from "./esp_pin.entity"

@Entity()
export class Esp {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ default: false })
    online: boolean

    @Column({ default: false })
    auth: boolean

    @Column({ default: false })
    token: string

    @Column({ default: false })
    token_generator: string

    @Column({ default: -100 })
    detail_rssi: string

    @OneToMany(type => EspPin, pin => pin.esp)
    pins: EspPin[]

    @Column({ default: false })
    auth_at: Date
}
