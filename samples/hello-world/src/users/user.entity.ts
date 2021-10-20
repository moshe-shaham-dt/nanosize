import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, PrimaryColumn} from "typeorm";

@Entity()
export class User extends BaseEntity {

    @PrimaryColumn('varchar')
    id: string;

    @Column("text")
    email: string;

    @Column("timestamp")
    created: Date;


}