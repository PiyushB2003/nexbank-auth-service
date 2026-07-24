import { HttpStatus } from '@nestjs/common';
import * as Moment from 'moment-timezone';
export class NBException {

    public message : string = "";
    public status : any = "";
    public timestamp =  Moment.tz(String(process.env.TIMEZONE)).format('DD.MM.YYYY | HH:mm:ss');

    constructor(message: string, status?: HttpStatus) {
        this.message = message;
        this.status = status;
        this.timestamp = this.timestamp;
    }
}