import { HttpStatus, Injectable } from "@nestjs/common";
import { DataSource, In, Repository } from 'typeorm';
import { NBException } from "src/app/exceptions/forbidden-error.exception";
import { UserRoles } from "../entities/user_roles.entity";

@Injectable()
export class UserRolesRepository extends Repository<UserRoles> {

    constructor(
        private dataSource: DataSource,
    ) {
        super(UserRoles, dataSource.createEntityManager());
    }

    async createUserRole(data: any) {
        try {
            const insert = await this.save(data);
            return insert;
        } catch (error: any) {
            throw new NBException(error.stack, HttpStatus.BAD_REQUEST);
        }
    }
}

