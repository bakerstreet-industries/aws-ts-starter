import "reflect-metadata";
import { injectable } from "inversify";
import { Table } from "../utils/dynamo-table";
import log from "ts-log-class";
import { config } from "../appsettings";
import { IModel } from "./models";

export interface IModuleRepo {
    post(model: IModel): Promise<IModel>;
    get(id: string): Promise<IModel>;
    del(id: string): Promise<void>;
    //list(): Promise<IModel[]>;
    put(model: IModel): Promise<IModel>;
}

@log()
@injectable()
export class ModuleRepo extends Table implements IModuleRepo {

    constructor() {
        super(config.DYNAMO_TABLE, true, ['id']);
    }

    post(model: IModel): Promise<IModel> {
        return super.internalPut(model);
    }

    get(id: string): Promise<IModel> {
        return super.internalGet('id = :id', { ':id': id })
            .then(items => items[0]);
    }

    // list(): Promise<IModel[]> {
    //     return super.internalScan();
    // }

    del(id: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.get(id).then(
                model => super.internalDelete({ id: model.id, createTime: model.createTime })
            ).then(() => resolve());
        });
    }

    put(model: IModel): Promise<IModel> {
        return super.internalPut(model);
    }
}