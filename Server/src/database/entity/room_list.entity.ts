import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { RoomType } from './room_type.entity';
import { RoomDevice } from './room_device.entity';

@Entity()
export class RoomList {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    enable: boolean;

    @OneToOne(type => RoomType, type => type.lists)
    type: RoomType;

    @OneToMany(type => RoomDevice, device => device.room)
    devices: RoomDevice[];
}
