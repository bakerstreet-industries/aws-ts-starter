import { APIGatewayEvent } from "aws-lambda";

export const MODULE_TYPES = {
    IAppSettings: Symbol("IAppSettings"),
    IDynamoDBDocumentClient: Symbol("IDynamoDBDocumentClient"),
    IDynamoTable: Symbol("IDynamoClient"),
    IModuleService: Symbol("IModuleService"),
    IModuleRepo: Symbol("IModuleRepo"),
};

export interface IGetRequest extends APIGatewayEvent {
    pathParameters: {
        id: string
    }
}

export interface IDeleteRequest extends APIGatewayEvent {
    pathParameters: {
        id: string
    }
}

export interface IModel {
    id?: string;
    createTime?: number;
    sampleProp: string;
    updateTime?: number;
}

export interface IAppSettings {
    table: IDynamoSettings;
}

export interface IDynamoSettings {
    name: string;
    addTimestamps: boolean;
    idFields: string[];
}