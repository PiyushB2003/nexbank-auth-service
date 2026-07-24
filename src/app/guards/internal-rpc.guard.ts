import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Metadata } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class InternalRpcGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        if (context.getType() !== 'rpc') {
            return false;
        }
        const rpcContext = context.switchToRpc();
        
        const metadata = rpcContext.getContext() as Metadata;
        if (!metadata || typeof metadata.get !== 'function') {
            return false;
        }

        const serviceArray = metadata.get('service');
        const serviceOrigin: any = serviceArray.length > 0 ? serviceArray[0].toString() : null;
        const allowedServices = ['nexbank-backend'];

        if(!allowedServices.includes(serviceOrigin)){
            console.error('Unauthorized request: Invalid service origin');
            throw new RpcException({
                code: HttpStatus.UNAUTHORIZED,
                message: 'Unauthorized request: Invalid service origin',
            });
        }
        return true;
    }
}