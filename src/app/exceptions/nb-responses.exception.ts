import { HttpException, HttpStatus } from '@nestjs/common';
import { NB } from '../helpers/nb.helper';
import { NBMoment } from '../helpers/nb-moment.helper';

export const SuccessResponse = (
    code: number = HttpStatus.OK, // Default to HttpStatus.OK
    message?: string,
    messageKey: any = null,
    data: any = null,
    alarmNumber: any = null
) => {
    const jsonResponse: any = {
        code: code,
        status: true,
        message: message || null,
    };

    if (NB.isNoEmpty(alarmNumber)) {
        jsonResponse.AlarmNumber = alarmNumber;
    }

    if (messageKey) {
        jsonResponse.message_key = messageKey;
    }

    jsonResponse.timestamp = NBMoment.responseDate();

    if (data) {
        jsonResponse.data = data;
    }

    return jsonResponse; // Return the object, it will be handled by the interceptor
};

export const ErrorException = (
    code: number = HttpStatus.INTERNAL_SERVER_ERROR,
    message?: string,
    messageKey: any = null,
    data: any = null
) => {
    const jsonResponse: any = {
        code,
        status: false,
        message: message || null,
    };

    if (messageKey) {
        jsonResponse.message_key = messageKey;
    }

    if (data) {
        jsonResponse.data = data;
    }

    return jsonResponse; // Return the object, it will be handled by the interceptor
};

export const ThrowErrorException = (
    code: number = HttpStatus.INTERNAL_SERVER_ERROR,
    message?: string,
    messageKey: any = null,
    data: any = null
): never => {

    throw new HttpException(
        ErrorException(code, message, messageKey, data),
        code
    );
};