export class NB {

    /**
   * Action : isNoEmpty()
   * THIS FUNCTION USE FOR CHECK DATA (OBJECT, STRING, NUMBER ETC)
   * IS EXIST OR NOT
   * 
   * @return BOOLEAN
   *-----------------------------------------------------------------------*/
    public static isNoEmpty = (data: any) => {

        if (this.isObject(data)) {
            if (Object.keys(data).length === 0 && data.constructor === Object) {
                return false;
            }
            return true;
        } else {
            if (data != "" && data != undefined && data != 'undefined' && data != null && data != 'null' && data != 0 && data != "0") {
                return true;
            }
        }

        return false;
    }

    /**
    * Action : isObject()
    * THIS FUNCTION USE FOR CHECK THIS IS OBJECT OR NOT
    * 
    * @return BOOLEAN
    *-----------------------------------------------------------------------*/
    public static isObject = (objValue: any) => {
        if (objValue && typeof objValue === 'object' && objValue.constructor === Object) {
            return true;
        }
        return false;
    }
}