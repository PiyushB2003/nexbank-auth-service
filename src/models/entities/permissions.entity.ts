import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToMany,
} from 'typeorm';
import { RolePermissions } from './role_permissions.entity';


@Entity('permissions')
export class Permissions {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100, unique: true })
    name: string;

    @Column({ length: 255, nullable: true })
    description?: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    /*
     * Relationships
     */

    @OneToMany(
        () => RolePermissions,
        (role_permission) => role_permission.permission,
    )
    role_permissions: RolePermissions[];
}