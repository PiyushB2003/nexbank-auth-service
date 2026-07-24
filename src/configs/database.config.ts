import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const DBJSON: any = {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [__dirname + '/../**/*.entity.ts'],
    logging: false,
    synchronize: false, // Danger, please don't change this value
    debug: false,
    autoLoadEntities: true,
    timezone: '+00:00'
}

const database: TypeOrmModuleOptions = DBJSON
export default database;