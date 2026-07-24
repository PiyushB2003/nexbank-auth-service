import * as Moment from 'moment-timezone';
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Action : RA()
 * THIS IS AN APP HELPER THAT CONTAINS MANY FUNCTIONS LIKE
 * CHECKING IF DATA IS EMPTY, CHECKING IF IT'S AN OBJECT, GETTING OBJECT LENGTH,
 * REMOVING HTML TAGS FROM A STRING, ETC.
 * 
 * @return void
 *-----------------------------------------------------------------------*/
export class NBMoment {

    /**
     * Action : responseDate()
     * GET CURRENT DATE IN A DIFFERENT FORMAT (STRING)
     * 
     * @return DATE
     *-----------------------------------------------------------------------*/
    public static responseDate(): string {
        return Moment.tz(String(process.env.TIMEZONE)).format('DD.MM.YYYY | HH:mm:ss');
    }
}