import { HttpStatus, Injectable } from "@nestjs/common";
import { DataSource, Repository } from 'typeorm';
import { NBException } from "src/app/exceptions/forbidden-error.exception";
import { RefreshTokens } from "../entities/refresh_tokens.entity";

@Injectable()
export class RefreshTokensRepository extends Repository<RefreshTokens> {

    constructor(
        private dataSource: DataSource,
    ) {
        super(RefreshTokens, dataSource.createEntityManager());
    }

    async saveRefreshToken(data: any) {
        try {
            const insert = await this.save(data);
            return insert;
        } catch (error: any) {
            throw new NBException(error.stack, HttpStatus.BAD_REQUEST);
        }
    }
}

