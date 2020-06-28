import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Esp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    online: boolean;

    @Column()
    auth: boolean;
}
