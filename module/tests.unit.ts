import { MODULE_TYPES } from './models';
import { IModuleRepo } from './repos';
import chai = require("chai");
import container from "./container";
import { IModel } from "../module/models";


class MockModuleRepo implements IModuleRepo {
    post(model: IModel): Promise<IModel> {
        return Promise.resolve({
            sampleProp: 'post'
        });
    }

    get(id: string): Promise<IModel> {
        return Promise.resolve({
            sampleProp: 'get'
        });
    }

    del(id: string): Promise<void> {
        return Promise.resolve();
    }

    put(model: IModel): Promise<IModel> {
        return Promise.resolve({
            sampleProp: 'put'
        });
    }
}

container.rebind<IModuleRepo>(MODULE_TYPES.IModuleRepo).to(MockModuleRepo);

describe('Model Module CRUD', () => {

    before(() => {
        chai.expect(true).to.be.equal(false);
    });

});