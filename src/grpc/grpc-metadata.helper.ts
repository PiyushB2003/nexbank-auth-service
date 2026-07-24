import { Metadata } from '@grpc/grpc-js';

export interface GrpcMetadataOptions {
    operation: string;
    action: string;
    requestId?: string;
    service?: string;
    userId?: string;
    authorization?: string;
}

export class createGrpcMetadata {
    static create(options: GrpcMetadataOptions): Metadata {
        const metadata = new Metadata();

        metadata.set('operation', options.operation);
        metadata.set('action', options.action);

        if (options.requestId) {
            metadata.set('request-id', options.requestId);
        }

        if (options.service) {
            metadata.set('service', options.service);
        }

        if (options.userId) {
            metadata.set('user-id', options.userId);
        }

        if (options.authorization) {
            metadata.set('authorization', options.authorization);
        }

        return metadata;
    }
}