import { HttpStatus, Injectable } from "@nestjs/common";
import { DataSource, In, Repository } from 'typeorm';
import { NBException } from "src/app/exceptions/forbidden-error.exception";
import { Roles } from "../entities/roles.entity";
import { NB } from "src/app/helpers/nb.helper";

@Injectable()
export class RolesRepository extends Repository<Roles> {

    constructor(
        private dataSource: DataSource,
    ) {
        super(Roles, dataSource.createEntityManager());
    }

    async getRoleIdByRoleName(roleName: string) {
        try {
            const data = await this.find({
                where: {
                    name: roleName
                },
                select: {
                    id: true
                }
            });

            if (!NB.isNoEmpty(data)) {
                throw new NBException('Role not found', HttpStatus.BAD_REQUEST);
            }

            return data[0].id;
        } catch (error: any) {
            throw new NBException(error.stack, HttpStatus.BAD_REQUEST);
        }
    }
}

