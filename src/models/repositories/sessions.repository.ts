import { HttpStatus, Injectable } from "@nestjs/common";
import { DataSource, In, Repository } from 'typeorm';
import { NBException } from "src/app/exceptions/forbidden-error.exception";
import { Sessions } from "../entities/sessions.entity";
import { RefreshTokensRepository } from "./refresh_tokens.repository";

@Injectable()
export class SessionsRepository extends Repository<Sessions> {

    constructor(
        private refreshTokensRepo: RefreshTokensRepository,
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

    async getSessionByIdNUserId(userId: string, sessionId: string): Promise<Sessions | null> {
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

    async revokeAllOtherSessions(userId: string, currentSessionId: string): Promise<void> {
        // 1. Fetch all other active sessions for this user
        const otherSessions = await this.find({
            where: {
                user_id: userId,
                is_active: 1,
            },
        });

        const sessionsToRevoke = otherSessions.filter((s) => s.id !== currentSessionId);

        if (sessionsToRevoke.length > 0) {
            const refreshTokenIds = sessionsToRevoke
                .map((s) => s.refresh_token_id)
                .filter((id) => id !== null);

            // 2. Revoke their refresh tokens
            if (refreshTokenIds.length > 0) {
                await this.refreshTokensRepo.update(
                    { id: In(refreshTokenIds) },
                    { revoked: 1, revoked_at: new Date() }
                );
            }

            // 3. Deactivate those sessions
            const otherSessionIds = sessionsToRevoke.map((s) => s.id);
            await this.update(
                { id: In(otherSessionIds) },
                { is_active: 0, logout_at: new Date() }
            );
        }
    }
}