import "reflect-metadata";
import { injectable, inject } from "inversify";
import { Table } from "../utils/dynamo-table";
import log from "ts-log-class";
import { IAppSettings } from "./settings";
import { IModel, MODULE_TYPES } from "./models";

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

    constructor(
        @inject(MODULE_TYPES.IAppSettings) settings: IAppSettings
    ) {
        super(
            settings.table.name,
            settings.table.addTimestamps,
            settings.table.idFields
        );
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