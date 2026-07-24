import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

import { Users } from './users.entity';

@Entity('login_histories')
export class LoginHistories {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'char', length: 36, nullable: true })
    user_id?: string;

    @Column({ length: 45, nullable: true })
    ip_address?: string;

    @Column({ type: 'text', nullable: true })
    user_agent?: string;

    @Column({ length: 100, nullable: true })
    device_name?: string;

    @Column({ default: 0 })
    status: number;

    @Column({ length: 255, nullable: true })
    failure_reason?: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    login_at: Date;

    /*
     * Relationships
     */

    @ManyToOne(() => Users, (user) => user.login_histories, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'user_id' })
    user?: Users;
}