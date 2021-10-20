import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class Todo extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("text")
    body: string;

    @Column("timestamp")
    created: Date;
}