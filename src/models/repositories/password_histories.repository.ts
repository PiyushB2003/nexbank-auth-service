import { HttpStatus, Injectable } from "@nestjs/common";
import { DataSource, In, Repository } from 'typeorm';
import { NBException } from "src/app/exceptions/forbidden-error.exception";
import { PasswordHistories } from "../entities/password_histories.entity";

@Injectable()
export class PasswordHistoriesRepository extends Repository<PasswordHistories> {

    constructor(
        private dataSource: DataSource,
    ) {
        super(PasswordHistories, dataSource.createEntityManager());
    }

    async createPasswordHistory(data: any) {
        try {
            const insert = await this.save(data);
            return insert;
        } catch (error: any) {
            throw new NBException(error.stack, HttpStatus.BAD_REQUEST);
        }
    }
}

