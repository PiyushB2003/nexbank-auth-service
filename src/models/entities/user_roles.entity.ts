import {
    Entity,
    PrimaryColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Users } from './users.entity';
import { Roles } from './roles.entity';


@Entity('user_roles')
export class UserRoles {
    @PrimaryColumn({ type: 'char', length: 36 })
    user_id: string;

    @PrimaryColumn()
    role_id: number;

    @ManyToOne(() => Users, (user) => user.user_roles, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: Users;

    @ManyToOne(() => Roles, (role) => role.user_roles, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({
        name: 'role_id',
    })
    role: Roles;
}