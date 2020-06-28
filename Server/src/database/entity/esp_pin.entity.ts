import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Esp } from './esp.entity';

@Entity()
export class EspPin {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(type => Esp, esp => esp.pins)
    esp: Esp;

    @Column("tinyint")
    name: number;

    @Column("tinyint")
    input: number;

    @Column("tinyint")
    outputType: number;

    @Column("tinyint")
    outputPrimary: number;

    @Column("tinyint")
    ouputSecondary: number;

    @Column("tinyint")
    dualToggleCount: number;

    @Column()
    status: boolean;
}
