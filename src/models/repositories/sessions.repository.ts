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

    async updateLastActivityByRefreshTokenId(refreshTokenId: string) {
        try {
            const update = await this.update(
                {
                    refresh_token_id: refreshTokenId
                },
                {
                    last_activity: new Date()
                }
            );

            if (update.affected === 0) {
                throw new NBException('Refresh token not found', HttpStatus.BAD_REQUEST);
            }

            return update;
        } catch (error: any) {
            throw new NBException(error.stack, HttpStatus.BAD_REQUEST);
        }
    }

    async getSessionByRefreshTokenId(refreshTokenId: string): Promise<Sessions | null> {
        try {
            return await this.findOne({
                where: {
                    refresh_token_id: refreshTokenId,
                    is_active: 1
                },
            });
        } catch (error: any) {
            throw new NBException(error.stack, HttpStatus.BAD_REQUEST);
        }
    }

    async getSessionByUserId(userId: string, sessionId: string): Promise<Sessions | null> {
        try {
            return await this.findOne({
                where: {
                    id: sessionId,
                    user_id: userId,
                    is_active: 1
                },
            });
        } catch (error: any) {
            throw new NBException(error.stack, HttpStatus.BAD_REQUEST);
        }
    }

    async updateSession(sessionId: string, data: any) {
        try {
            const update = await this.update(sessionId, data);
            return update;
        } catch (error: any) {
            throw new NBException(error.stack, HttpStatus.BAD_REQUEST);
        }
    }
}

