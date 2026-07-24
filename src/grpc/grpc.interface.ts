import { Observable } from "rxjs";

/**
 * Interface: IGrpcService
 *
 * This interface is used to define the gRPC service for connecting to the auth microservice.
 * It includes a method for sending auth data.
 *
 * @returns Observable<any>
 * -----------------------------------------------------------------------
 */
export interface IAuthGrpcService {
    requestSendAuthData(dataArray: IAuthDataArray, metadata: any): Observable<any>;
}

/**
 * Interface: IDataArray
 *
 * This interface represents the structure of the auth data being sent.
 * 
 * -----------------------------------------------------------------------
 */
interface IAuthDataArray {
    authdata: string[];
}