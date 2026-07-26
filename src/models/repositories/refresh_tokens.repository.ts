import { HttpStatus, Injectable } from "@nestjs/common";
import { DataSource, Repository } from 'typeorm';
import { NBException } from "src/app/exceptions/forbidden-error.exception";
import { RefreshTokens } from "../entities/refresh_tokens.entity";
import { NB } from "src/app/helpers/nb.helper";

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

    async getTokenDatabyHashToken(tokenHash: string) {
        try {
            const data = await this.find({
                where: {
                    token: tokenHash
                }
            });

            if (!NB.isNoEmpty(data)) {
                throw new NBException('Refresh token not found', HttpStatus.BAD_REQUEST);
            }

            return data[0];
        } catch (error: any) {
            throw new NBException(error.stack, HttpStatus.BAD_REQUEST);
        }
    }

    async updateRefreshToken(tokenHash: any, data: any) {
        try {
            const update = await this.update(tokenHash, data);
            return update;
        } catch (error: any) {
            throw new NBException(error.stack, HttpStatus.BAD_REQUEST);
        }
    }
}

