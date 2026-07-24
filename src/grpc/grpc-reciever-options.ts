import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import dotenv from 'dotenv';
dotenv.config();

// RECIEVER MICROSERVICE OPTIONS
export const authMicroserviceOptions = {
    transport: Transport.GRPC,
    options : {
        package: 'AuthApi',
        protoPath: join(process.cwd(), 'src', 'grpc', 'protos', 'auth-api.proto'),
        url: process.env.LOCAL_MICROSERVICE,
        keepalive: {
            // Send keepalive pings every 10 seconds.
            keepaliveTimeMs: 30000, // 30 seconds

            // Keepalive ping timeout after.
            keepaliveTimeoutMs: 5000, // 5 seconds
            
            // Allow keepalive pings when there are no gRPC calls.
            keepalivePermitWithoutCalls: 1,
        }
    }
}