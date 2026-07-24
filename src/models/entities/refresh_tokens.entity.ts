import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    OneToMany,
} from 'typeorm';

import { Users } from './users.entity';
import { Sessions } from './sessions.entity';


@Entity('refresh_tokens')
export class RefreshTokens {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'char', length: 36 })
    user_id: string;

    @Column({ length: 255 })
    token: string;

    @Column({ type: 'datetime' })
    expires_at: Date;

    @Column({ default: 0 })
    revoked: number;

    @Column({ type: 'datetime', nullable: true })
    revoked_at?: Date;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    /*
     * Relationships
     */

    @ManyToOne(() => Users, (user) => user.refresh_tokens, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({
        name: 'user_id',
    })
    user: Users;

    @OneToMany(() => Sessions, (session) => session.refresh_token)
    sessions: Sessions[];
}