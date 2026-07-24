import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany
} from 'typeorm';
import { UserRoles } from './user_roles.entity';
import { RefreshTokens } from './refresh_tokens.entity';
import { Sessions } from './sessions.entity';
import { Devices } from './devices.entity';
import { PasswordHistories } from './password_histories.entity';
import { LoginHistories } from './login_histories.entity';

@Entity('users')
export class Users {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50 })
    first_name: string;

    @Column({ type: 'varchar', length: 50 })
    last_name: string;

    @Column({ type: 'varchar', length: 191, unique: true, nullable: true })
    email: string;

    @Column({ type: 'varchar', length: 20, unique: true })
    mobile_number: string;

    @Column({ type: 'varchar', length: 255, select: false })
    password: string;

    @Column({ type: 'int', default: 1 })
    status: number;

    @Column({ type: 'int', default: 0 })
    email_verified: number;

    @Column({ type: 'int', default: 0 })
    mobile_verified: number;

    @Column({ type: 'int', default: 0 })
    failed_login_count: number;

    @Column({ type: 'datetime', nullable: true })
    locked_until?: Date;

    @Column({ type: 'datetime', nullable: true })
    last_login_at?: Date;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deleted_at?: Date;

    // Relations

    @OneToMany(
        () => UserRoles,
        (user_role) => user_role.user,
    )
    user_roles: UserRoles[];

    @OneToMany(() => RefreshTokens, (token) => token.user)
    refresh_tokens: RefreshTokens[];

    @OneToMany(() => Sessions, (session) => session.user)
    sessions: Sessions[];

    @OneToMany(() => Devices, (device) => device.user)
    devices: Devices[];

    @OneToMany(() => PasswordHistories, (history) => history.user)
    password_histories: PasswordHistories[];

    @OneToMany(() => LoginHistories, (history) => history.user)
    login_histories: LoginHistories[];
}