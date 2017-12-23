import { IAppSettings, APP_SETTINGS } from './settings';
import { DynamoDB } from 'aws-sdk';
import { Container } from "inversify";
import { MODULE_TYPES } from "./models";
import { IModuleRepo, ModuleRepo } from "./repos";
import { IModuleService, ModuleService } from "./services";
import { IDynamoDBDocumentClient, IDynamoTable, DynamoTableWrapper } from './../utils/dynamo-table';

let container = new Container();
container.bind<IAppSettings>(MODULE_TYPES.IAppSettings).toConstantValue(APP_SETTINGS);
container.bind<IDynamoDBDocumentClient>(MODULE_TYPES.IDynamoDBDocumentClient).to(DynamoDB.DocumentClient);
container.bind<IDynamoTable>(MODULE_TYPES.IDynamoTable).to(DynamoTableWrapper);
container.bind<IModuleRepo>(MODULE_TYPES.IModuleRepo).to(ModuleRepo);
container.bind<IModuleService>(MODULE_TYPES.IModuleService).to(ModuleService);

export default container;