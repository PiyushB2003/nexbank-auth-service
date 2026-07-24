import { HttpStatus, Injectable } from "@nestjs/common";
import { DataSource, Repository } from 'typeorm';
import { NBException } from "src/app/exceptions/forbidden-error.exception";
import { Sessions } from "../entities/sessions.entity";

@Injectable()
export class SessionsRepository extends Repository<Sessions> {

    constructor(
        private dataSource: DataSource,
    ) {
        super(Sessions, dataSource.createEntityManager());
    }

    async createSession(data: any) {
        try {
            const insert = await this.save(data);
            return insert;
        } catch (error: any) {
            throw new NBException(error.stack, HttpStatus.BAD_REQUEST);
        }
    }
}

