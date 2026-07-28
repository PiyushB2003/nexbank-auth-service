import { HttpStatus, Injectable } from "@nestjs/common";
import { DataSource, In, Repository } from 'typeorm';
import { NB } from "src/app/helpers/nb.helper";
import { NBException } from "src/app/exceptions/forbidden-error.exception";
import { Users } from "../entities/users.entity";

@Injectable()
export class UsersRepository extends Repository<Users> {

    constructor(
        private dataSource: DataSource,
    ) {
        super(Users, dataSource.createEntityManager());
    }

    async isAlreadyNumberExist(mobileNumer: string) {
        try {
            const data = await this.find({
                where: {
                    mobile_number: mobileNumer
                }
            });

            return data.length > 0 ? true : false;
        } catch (error: any) {
            throw new NBException(error.stack, HttpStatus.BAD_REQUEST);
        }
    }

    async createUser(data: any) {
        try {
            const insert = await this.save(data);
            return insert;
        } catch (error: any) {
            throw new NBException(error.stack, HttpStatus.BAD_REQUEST);
        }
    }

    async findByMobileNumber(mobileNumber: string) {
        try {
            const data = await this.find({
                where: {
                    mobile_number: mobileNumber
                },
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    mobile_number: true,
                    password: true,
                    email: true,
                    status: true,
                    mobile_verified: true
                }
            });

            return data[0];
        } catch (error: any) {
            throw new NBException(error.stack, HttpStatus.BAD_REQUEST);
        }
    }

    async updateLastLogin(userId: string) {
        try {
            const update = await this.update(userId, { last_login_at: new Date() });
            return update;
        } catch (error: any) {
            throw new NBException(error.stack, HttpStatus.BAD_REQUEST);
        }
    }

    async updatePassword(userId: string, newPassword: string) {
        try {
            const update = await this.update(userId, { password: newPassword })
            return update;
        } catch (error: any) {
            throw new NBException(error.stack, HttpStatus.BAD_REQUEST);
        }
    }

    async getUserById(userId: string) {
        try {
            const data = await this.find({
                where: {
                    id: userId
                },
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    mobile_number: true,
                    password: true,
                    email: true,
                    status: true,
                    mobile_verified: true
                }
            });

            if (!NB.isNoEmpty(data)) {
                throw new NBException('User not found', HttpStatus.BAD_REQUEST);
            }

            return data[0];
        } catch (error: any) {
            throw new NBException(error.stack, HttpStatus.BAD_REQUEST);
        }
    }
}

