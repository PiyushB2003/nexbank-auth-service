import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {

    private getErrorMessage(error: unknown): string {
        return error instanceof Error ? error.message : 'internal_server_error';
    }

    private readonly logger = new Logger(RedisService.name);
    private readonly OTP_EXPIRY = 180;
    isConnectedLogged = false;
    private client: Redis;

    onModuleInit() {
        this.client = new Redis({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD,
            connectTimeout: Number(process.env.REDIS_TIMEOUT),
            retryStrategy: (times) => Math.min(times * 50, 2000), reconnectOnError: (err) => {
                if (err.message.includes('ECONNRESET')) {
                    return true;
                }
                return false;
            },
        });

        this.client.on('error', (err) => {
            console.error('Redis connection error:', err);
        });

        this.client.once('ready', () => {
            if (!this.isConnectedLogged) {
                this.isConnectedLogged = true;
                console.log('Redis connected successfully');
            }
        });
    }

    getClient(): Redis {
        return this.client;
    }

    getClientStatus(): string {
        return this.client?.status || 'uninitialized';
    }

    async isRedisConnected(): Promise<boolean> {
        if (!this.client) {
            return false;
        }

        const status = this.client.status;
        if (status !== 'ready' && status !== 'connect') {
            return false;
        }

        try {
            return (await this.client.ping()) === 'PONG';
        } catch {
            return false;
        }
    }


    onModuleDestroy() {
        this.client.quit().then(() => {
            console.log('Redis connection closed.');
        }).catch(err => {
            throw new Error(this.getErrorMessage(err));
        });
    }

    async deleteRedisCache(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (error) {
            throw new Error(this.getErrorMessage(error));
        }
    }

    private getOtpKey(type: string, mobile: string): string {
        try {

        } catch (error: any) {
            throw new Error(this.getErrorMessage(error));
        }
        return `otp:${type}:${mobile}`;
    }

    async saveOtp(type: string, mobile: string, otp: string): Promise<void> {
        try {
            await this.client.set(
                this.getOtpKey(type, mobile),
                otp,
                'EX',
                this.OTP_EXPIRY,
            );
        } catch (error: any) {
            throw new Error(this.getErrorMessage(error));
        }
    }

    async getOtp(type: string, mobile: string): Promise<string | null> {
        try {
            return this.client.get(
                this.getOtpKey(type, mobile),
            );
        } catch (error: any) {
            throw new Error(this.getErrorMessage(error));
        }
    }

    async deleteOtp(type: string, mobile: string): Promise<void> {
        try {
            await this.client.del(
                this.getOtpKey(type, mobile),
            );
        } catch (error: any) {
            throw new Error(this.getErrorMessage(error));
        }
    }

    async otpExists(type: string, mobile: string): Promise<boolean> {
        try {
            const exists = await this.client.exists(
                this.getOtpKey(type, mobile),
            );

            return exists === 1;
        } catch (error: any) {
            throw new Error(this.getErrorMessage(error));
        }
    }

    async getOtpTTL(type: string, mobile: string): Promise<number> {
        try {
            return this.client.ttl(
                this.getOtpKey(type, mobile),
            );
        } catch (error: any) {
            throw new Error(this.getErrorMessage(error));
        }
    }
}