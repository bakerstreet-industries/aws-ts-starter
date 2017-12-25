import "reflect-metadata";
import { injectable, inject } from "inversify";
import { DynamoTableWrapper, IDynamoTable } from "../utils/dynamo-table";
import log from "ts-log-class";
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
export class ModuleRepo implements IModuleRepo {

    constructor(
        @inject(MODULE_TYPES.IDynamoTable) private _table: IDynamoTable,
    ) { }

    post(model: IModel): Promise<IModel> {
        return this._table.put(model);
    }

    get(id: string): Promise<IModel> {
        return this._table.get('id = :id', { ':id': id })
            .then(items => items[0]);
    }

    // list(): Promise<IModel[]> {
    //     return this._table.scan();
    // }

    del(id: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.get(id).then(
                model => this._table.delete({ id: model.id, createTime: model.createTime })
            ).then(() => resolve());
        });
    }

    put(model: IModel): Promise<IModel> {
        return this._table.put(model);
    }
}