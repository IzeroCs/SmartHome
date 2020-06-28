import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { EspPin } from './esp_pin.entity';
import { Esp } from './esp.entity';
import { type } from 'os';
import { RoomList } from './room_list.entity';

@Entity()
export class RoomDevice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToOne(type => EspPin, pin => pin.id)
    @JoinColumn()
    pin: EspPin;

    @OneToOne(type => Esp, esp => esp.id)
    @JoinColumn()
    esp: Esp;

    @OneToOne(type => RoomList, room => room.devices)
    room: RoomList;
}
