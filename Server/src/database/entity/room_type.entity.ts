import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { RoomList } from './room_list.entity';

@Entity()
export class RoomType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    enable: boolean;

    @OneToMany(type => RoomList, type => type.type)
    lists: RoomList[];
}
