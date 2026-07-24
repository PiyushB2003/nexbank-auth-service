import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';

import { Users } from './users.entity';
import { RefreshTokens } from './refresh_tokens.entity';
import { Devices } from './devices.entity';

@Entity('sessions')
export class Sessions {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'char', length: 36 })
    user_id: string;

    @Column({ type: 'char', length: 36, nullable: true })
    device_id?: string;

    @Column({ type: 'char', length: 36, nullable: true })
    refresh_token_id?: string;

    @Column({ length: 50, nullable: true })
    ip_address?: string;

    @Column({ type: 'text', nullable: true })
    user_agent?: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    login_at: Date;

    @Column({ type: 'datetime', nullable: true })
    last_activity?: Date;

    @Column({ type: 'datetime', nullable: true })
    logout_at?: Date;

    @Column({ default: true })
    is_active: boolean;

    /*
     * Relationships
     */

    @ManyToOne(() => Users, (user) => user.sessions, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({
        name: 'user_id',
    })
    user: Users;

    @ManyToOne(() => Devices, (device) => device.sessions, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({
        name: 'device_id',
    })
    device?: Devices;

    @ManyToOne(
        () => RefreshTokens,
        (refresh_token) => refresh_token.sessions,
        {
            onDelete: 'SET NULL',
            nullable: true,
        },
    )
    @JoinColumn({
        name: 'refresh_token_id',
    })
    refresh_token?: RefreshTokens;
}