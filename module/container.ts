import { DynamoTableWrapper, IDynamoTable, IDynamoDBDocumentClient } from './../utils/dynamo-table';
import { APP_SETTINGS } from './settings';
import { Container } from "inversify";
import { MODULE_TYPES, IAppSettings } from "./models";
import { IModuleRepo, ModuleRepo } from "./repos";
import { IModuleService, ModuleService } from "./services";
import { DynamoDB } from 'aws-sdk/clients/all';

let container = new Container();
container.bind<IDynamoDBDocumentClient>(MODULE_TYPES.IDynamoDBDocumentClient).toConstantValue(new DynamoDB.DocumentClient());
container.bind<IDynamoTable>(MODULE_TYPES.IDynamoTable).to(DynamoTableWrapper);
container.bind<IAppSettings>(MODULE_TYPES.IAppSettings).toConstantValue(APP_SETTINGS);
container.bind<IModuleRepo>(MODULE_TYPES.IModuleRepo).to(ModuleRepo);
container.bind<IModuleService>(MODULE_TYPES.IModuleService).to(ModuleService);

export default container;