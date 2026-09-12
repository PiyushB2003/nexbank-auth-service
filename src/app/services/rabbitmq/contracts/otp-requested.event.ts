export type OtpPurpose = 'register' | 'forgot-password';

export interface OtpRequestedEvent {
    event_id: string;
    event_type: 'notification.otp.requested';
    version: 1;
    occured_at: string;

    data: {
        mobile_number: string;
        otp: string;
        purpose: OtpPurpose;
    }
}