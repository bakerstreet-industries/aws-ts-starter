import log from "ts-log-class";
import { inject, injectable } from "inversify";
import { MODULE_TYPES, IModel } from "./models";
import { IModuleRepo } from "./repos";
import { LambdaError } from "../utils/errors";

export interface IModuleService {
    post(model: IModel): Promise<IModel>;
    get(id: string): Promise<IModel>;
    del(id: string);
    //list(): Promise<IModel[]>;
    put(model: IModel): Promise<IModel>;
}

@log()
@injectable()
export class ModuleService implements IModuleService {

    constructor(
        @inject(MODULE_TYPES.IModuleRepo) private _repo: IModuleRepo
    ) { }

    public post(model: IModel): Promise<IModel> {
        this.validate(model);
        if (model.id) {
            return this.get(model.id).then(
                () => this.put(model)
            );
        }
        return this._repo.post(model);
    }

    public get(id: string): Promise<IModel> {
        // Sample throw logic
        if (id == "error") {
            throw new LambdaError(401, "Permission Denied", "Access Error");
        }
        return this._repo.get(id);
    }

    // public list(): Promise<IModel[]> {
    //     return this._repo.list();
    // }

    public del(id: string): Promise<void> {
        return this._repo.del(id);
    }

    public put(model: IModel): Promise<IModel> {
        this.validate(model);
        return this.get(model.id).then(
            () => this._repo.put(model)
        );
    }

    private validate(model: IModel): void {
        if (model === null || model === undefined) {
            throw new LambdaError(400, "Cannot post a null or undefined model.", "Request Error");
        }
    }

}