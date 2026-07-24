import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './components/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './configs/database.config';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './app/services/redis/redis.module';

@Module({
  imports: [

    TypeOrmModule.forRoot(
      databaseConfig,
    ),

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    AuthModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
