import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AppHelper } from 'src/app/helpers/app.helper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/models/entities/users.entity';
import { UsersRepository } from 'src/models/repositories/users.repository';
import { UserRoles } from 'src/models/entities/user_roles.entity';
import { Roles } from 'src/models/entities/roles.entity';
import { RolePermissions } from 'src/models/entities/role_permissions.entity';
import { Permissions } from 'src/models/entities/permissions.entity';
import { RefreshTokens } from 'src/models/entities/refresh_tokens.entity';
import { Sessions } from 'src/models/entities/sessions.entity';
import { Devices } from 'src/models/entities/devices.entity';
import { PasswordHistories } from 'src/models/entities/password_histories.entity';
import { LoginHistories } from 'src/models/entities/login_histories.entity';
import { AuthService } from './auth.service';
import { PasswordHistoriesRepository } from 'src/models/repositories/password_histories.repository';
import { UserRolesRepository } from 'src/models/repositories/user_roles.repository';
import { RolesRepository } from 'src/models/repositories/roles.repository';
import { LoginHistoriesRepository } from 'src/models/repositories/login_histories.repository';
import { RefreshTokensRepository } from 'src/models/repositories/refresh_tokens.repository';
import { SessionsRepository } from 'src/models/repositories/sessions.repository';
import { DevicesRepository } from 'src/models/repositories/devices.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationPublisherService } from 'src/app/services/rabbitmq/notification-publisher.service';
import dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [

    ClientsModule.register([
      {
        name: 'NOTIFICATION_RMQ',

        transport: Transport.RMQ,

        options: {
          urls: [
            process.env.RABBITMQ_URL!,
          ],

          queue: process.env.RABBITMQ_QUEUE || 'notification_queue',

          queueOptions: {
            durable: true
          },

          persistent: true
        }
      }
    ]),

    TypeOrmModule.forFeature([

      // ENTITIES
      PasswordHistories,
      RolePermissions,
      LoginHistories,
      RefreshTokens,
      Permissions,
      UserRoles,
      Sessions,
      Devices,
      Roles,
      Users
    ]),
  ],
  controllers: [AuthController],
  providers: [

    // REPOSITORIES
    PasswordHistoriesRepository,
    LoginHistoriesRepository,
    RefreshTokensRepository,
    UserRolesRepository,
    SessionsRepository,
    DevicesRepository,
    RolesRepository,
    UsersRepository,

    // SERVICES
    NotificationPublisherService,
    AuthService,

    // HELPERS
    AppHelper,
  ],
})
export class AuthModule { }
