import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { OtpPurpose, OtpRequestedEvent } from "./contracts/otp-requested.event";
import { randomUUID } from "crypto";
import { NotificationEvent } from "./events/notification.events";


@Injectable()
export class NotificationPublisherService {

    constructor(
        @Inject('NOTIFICATION_RMQ')
        private readonly notificationClient: ClientProxy
    ) { }

    async rmqPublishOtpRequest(
        mobile_number: string,
        otp: string,
        purpose: OtpPurpose
    ): Promise<void> {

        try {

            const event: OtpRequestedEvent = {
                event_id: randomUUID(),
                event_type: NotificationEvent.OTP_REQUESTED,
                version: 1,
                occured_at: new Date().toISOString(),
                data: {
                    mobile_number,
                    otp,
                    purpose
                }
            }

            this.notificationClient.emit(NotificationEvent.OTP_REQUESTED, event);

        } catch (error: any) {
            console.error('Error publishing OTP request event:', error);
        }
    }
}