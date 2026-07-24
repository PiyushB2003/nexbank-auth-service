import { HttpStatus, Injectable } from "@nestjs/common";
import { DataSource, Repository } from 'typeorm';
import { NBException } from "src/app/exceptions/forbidden-error.exception";
import { LoginHistories } from "../entities/login_histories.entity";

@Injectable()
export class LoginHistoriesRepository extends Repository<LoginHistories> {

    constructor(
        private dataSource: DataSource,
    ) {
        super(LoginHistories, dataSource.createEntityManager());
    }

    async logAttempt(data: any) {
        try {
            const insert = await this.save(data);
            return insert;
        } catch (error: any) {
            throw new NBException(error.stack, HttpStatus.BAD_REQUEST);
        }
    }
}

