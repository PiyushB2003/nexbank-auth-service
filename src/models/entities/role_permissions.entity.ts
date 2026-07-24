import {
    Entity,
    PrimaryColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Roles } from './roles.entity';
import { Permissions } from './permissions.entity';

@Entity('role_permissions')
export class RolePermissions {
    @PrimaryColumn()
    role_id: number;

    @PrimaryColumn()
    permission_id: number;

    @ManyToOne(() => Roles, (role) => role.role_permissions)
    @JoinColumn({ name: 'role_id' })
    role: Roles;

    @ManyToOne(
        () => Permissions,
        (permission) => permission.role_permissions,
    )
    @JoinColumn({ name: 'permission_id' })
    permission: Permissions;
}