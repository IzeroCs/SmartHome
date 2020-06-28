import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn } from 'typeorm';
import { EspPin } from './esp_pin.entity'

@Entity()
export class Esp {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(type => EspPin, pin => pin.esp)
    pins: EspPin[];

    @Column()
    name: string;

    @Column()
    online: boolean;

    @Column()
    auth: boolean;
}
