import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

import { Users } from './users.entity';

@Entity('password_histories')
export class PasswordHistories {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'char', length: 36 })
    user_id: string;

    @Column({ length: 255 })
    password: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    changed_at: Date;

    /*
     * Relationships
     */

    @ManyToOne(() => Users, (user) => user.password_histories, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({
        name: 'user_id',
    })
    user: Users;
}