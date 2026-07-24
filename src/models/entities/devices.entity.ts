import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

import { Users } from './users.entity';
import { Sessions } from './sessions.entity';

@Entity('devices')
export class Devices {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'char', length: 36 })
    user_id: string;

    @Column({ length: 100, nullable: true })
    device_name?: string;

    @Column({ length: 50, nullable: true })
    device_type?: string;

    @Column({ length: 100, nullable: true })
    os?: string;

    @Column({ length: 100, nullable: true })
    browser?: string;

    @Column({ length: 255, nullable: true, unique: true })
    device_fingerprint?: string;

    @Column({ default: false })
    is_trusted: boolean;

    @Column({ type: 'datetime', nullable: true })
    last_used_at?: Date;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    /*
     * Relationships
     */

    @ManyToOne(() => Users, (user) => user.devices, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({
        name: 'user_id',
    })
    user: Users;

    @OneToMany(() => Sessions, (session) => session.device)
    sessions: Sessions[];
}