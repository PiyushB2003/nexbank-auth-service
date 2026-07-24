import { HttpStatus } from '@nestjs/common';
import { AppHelper } from '../helpers/app.helper';
import { NB } from '../helpers/nb.helper';


const appHelper = new AppHelper();

export const GrpcSuccessResponse = (
    code: number = HttpStatus.OK,
    message?: string,
    data: any = [],
) => {

    const jsonResponse: any = {
        code,
        status: true,
        message: message || null,
    };

    if (NB.isNoEmpty(data)) {
        jsonResponse.data = data;
    }

    return {
        authresponse: appHelper.encryptString(
            JSON.stringify(jsonResponse),
        ),
    };
};

export const GrpcErrorResponse = (
    code: number = HttpStatus.INTERNAL_SERVER_ERROR,
    message?: string,
    messageKey: any = null,
    data: any = [],
) => {

    const jsonResponse: any = {
        code,
        status: false,
        message: message || null,
    };

    if (messageKey) {
        jsonResponse.message_key = messageKey;
    }

    if (data.length > 0) {
        jsonResponse.data = data;
    }

    return {
        authresponse: appHelper.encryptString(
            JSON.stringify(jsonResponse),
        ),
    };
};