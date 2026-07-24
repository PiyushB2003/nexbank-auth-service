import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToMany,
} from 'typeorm';
import { UserRoles } from './user_roles.entity';
import { RolePermissions } from './role_permissions.entity';


@Entity('roles')
export class Roles {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50, unique: true })
    name: string;

    @Column({ length: 255, nullable: true })
    description?: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    /*
     * Relationships
     */

    @OneToMany(
        () => UserRoles,
        (user_role) => user_role.role,
    )
    user_roles: UserRoles[];

    @OneToMany(
        () => RolePermissions,
        (role_permission) => role_permission.role,
    )
    role_permissions: RolePermissions[];
}