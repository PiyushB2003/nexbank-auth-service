import { HttpStatus, Injectable } from "@nestjs/common";
import { DataSource, Repository } from 'typeorm';
import { NBException } from "src/app/exceptions/forbidden-error.exception";
import { Devices } from "../entities/devices.entity";

@Injectable()
export class DevicesRepository extends Repository<Devices> {

    constructor(
        private dataSource: DataSource,
    ) {
        super(Devices, dataSource.createEntityManager());
    }

    async saveDevice(data: any) {
        try {
            const insert = await this.save(data);
            return insert;
        } catch (error: any) {
            throw new NBException(error.stack, HttpStatus.BAD_REQUEST);
        }
    }
}

