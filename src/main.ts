import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { authMicroserviceOptions } from './grpc/grpc-reciever-options';
import dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {

  const app = await NestFactory.createMicroservice(
    AppModule,
    authMicroserviceOptions
  );

  await app.listen();

  console.log(
    `Auth gRPC running on ${process.env.PORT}`,
  );
}
bootstrap();
