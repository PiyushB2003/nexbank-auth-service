import { Controller, HttpStatus, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { AppHelper } from 'src/app/helpers/app.helper';
import { InternalRpcGuard } from 'src/app/guards/internal-rpc.guard';
import { GrpcErrorResponse } from 'src/app/exceptions/grpc-responses.exception';
import { NB } from 'src/app/helpers/nb.helper';
import { AuthService } from './auth.service';

interface IRequestDataArray {
    authdata: string[];
}

@Controller()
@UseGuards(InternalRpcGuard)
export class AuthController {

    constructor(
        // SERVICE
        private readonly authService: AuthService,

        // HELPERS
        private readonly AppHelper: AppHelper
    ) { }

    @GrpcMethod('AuthApiController', 'RequestSendAuthData')
    async requestSendAuthData(
        data: IRequestDataArray,
        metadata: Metadata,
    ) {

        try {
            // SAFE METADATA EXTRACTION (WITH FALLBACK TO PREVENT CRASHES)
            const operationHeaders = metadata.get('operation');
            const actionHeaders = metadata.get('action');

            if (!operationHeaders?.length) {
                return GrpcErrorResponse(
                    HttpStatus.BAD_REQUEST,
                    'Missing operation metadata',
                );
            }

            if (!actionHeaders?.length) {
                return GrpcErrorResponse(
                    HttpStatus.BAD_REQUEST,
                    'Missing action metadata',
                );
            }

            const operation = operationHeaders?.length ? (operationHeaders[0] as string) : '';
            const action = actionHeaders?.length ? (actionHeaders[0] as string) : '';

            // SAFE DATA DECRYPTION
            const authData = NB.isNoEmpty(data?.authdata?.[0])
                ? this.AppHelper.decryptString(data.authdata[0])
                : null;

            // ROUTING LOGIC PASSING VARIABLES DIRECTLY (STATELESS)
            switch (action) {

                case 'register-initiate':
                    return await this.authService.registerInitiate(operation, action, authData);

                case 'register-vefiry-otp':
                    return await this.authService.registerVerifyOtp(operation, action, authData);

                case 'register-complete':
                    return await this.authService.registerComplete(operation, action, authData);

                case 'login':
                    return await this.authService.login(operation, action, authData);

                case 'refresh-token':
                    return await this.authService.refreshToken(operation, action, authData);

                case 'logout':
                    return await this.authService.logout(operation, action, authData);

                case 'me':
                    return await this.authService.getProfile(operation, action, authData);

                case 'change-password':
                    return await this.authService.changePassword(operation, action, authData);

                case 'forgot-password':
                    return await this.authService.forgotPassword(operation, action, authData);

                case 'reset-password':
                    return await this.authService.resetPassword(operation, action, authData);

                default:
                    return GrpcErrorResponse(HttpStatus.BAD_REQUEST, `Unknown or missing action: ${action}`);
            }

        } catch (error: any) {
            return GrpcErrorResponse(error.code || HttpStatus.INTERNAL_SERVER_ERROR, error.message);
        }
    }
}