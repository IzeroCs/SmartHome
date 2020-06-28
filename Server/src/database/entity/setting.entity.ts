import {Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Setting {
    @PrimaryGeneratedColumn()
    id: number;

}
