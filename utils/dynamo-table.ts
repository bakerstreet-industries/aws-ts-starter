import log from "ts-log-class";
import uuid = require("uuid");
import { injectable, inject } from "inversify";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { AWSError } from "aws-sdk/lib/error";
import { Request } from "aws-sdk/lib/request";
import { MODULE_TYPES, IAppSettings } from './../module/models';
import { LambdaError } from "./errors";

export interface IDynamoDBDocumentClient {
    delete(params: DocumentClient.DeleteItemInput, callback?: (err: AWSError, data: DocumentClient.DeleteItemOutput) => void): Request<DocumentClient.DeleteItemOutput, AWSError>;
    query(params: DocumentClient.QueryInput, callback?: (err: AWSError, data: DocumentClient.QueryOutput) => void): Request<DocumentClient.QueryOutput, AWSError>;
    put(params: DocumentClient.PutItemInput, callback?: (err: AWSError, data: DocumentClient.PutItemOutput) => void): Request<DocumentClient.PutItemOutput, AWSError>;

    // delete(...rest): any;
    // query(...rest): any;
    // put(...rest): any;
}

export interface IDynamoTable {
    del(key: { [name: string]: any }): Promise<any>;
    get(keyConditionExpression: string, expressionAttributeValues: { [name: string]: any }): Promise<any>;
    put(data: any): Promise<any>;
}

@log()
//AHHHH - YUNO WORKY?!
//module initialization error: TypeError at /var/task/module/handler.js:2511:21 at __decorate (/var/task/module/handler.js:1228:95) at /var/task/module/handler.js:1297:26 at Object.defineProperty.value (/var/task/module/handler.js:1303:2) at __webpack_require__ (/var/task/module/handler.js:30:30) at Object.c (/var/task/module/handler.js:1201:22) at __webpack_require__ (/v
@injectable()
export class DynamoTableWrapper implements IDynamoTable {

    constructor(
        @inject(MODULE_TYPES.IAppSettings) private _settings: IAppSettings,
        @inject(MODULE_TYPES.IDynamoDBDocumentClient) private _documentClient: IDynamoDBDocumentClient
    ) { }

    del(key: { [name: string]: any }): Promise<any> {
        return new Promise((resolve, reject) => {
            this._documentClient.delete({
                TableName: this._settings.table.name,
                Key: key
            }, (err) => {
                if (err) {
                    reject(LambdaError.deleteDataFailed(err));
                } else {
                    resolve();
                }
            });
        });
    }

    get(keyConditionExpression: string, expressionAttributeValues: { [name: string]: any }): Promise<any> {
        return new Promise((resolve, reject) => {
            this._documentClient.query({
                TableName: this._settings.table.name,
                KeyConditionExpression: keyConditionExpression,
                ExpressionAttributeValues: expressionAttributeValues
            }, (err, data) => {
                if (err || !data.Items || data.Items.length == 0) {
                    reject(LambdaError.notFound(JSON.stringify(expressionAttributeValues)));
                } else {
                    resolve(data.Items);
                }
            });
        });
    }

    put(data): Promise<any> {
        // If provided don't create a UUID on the property that is marked for auto uuid.
        this._settings.table.idFields.forEach((field) => {
            data[field] = data[field] || uuid.v1();
        });
        if (this._settings.table.addTimestamps) {
            if (data.createTime) {
                data.updateTime = Date.now();
            } else {
                data.createTime = Date.now();
            }
        }
        return new Promise((resolve, reject) => {
            this._documentClient.put({
                TableName: this._settings.table.name,
                Item: data
            }, (err) => {
                if (err) {
                    reject(LambdaError.putDataFailed(err));
                } else {
                    resolve(data);
                }
            });
        });
    }

    // Dynamo DB scans are EXPENSIVE - avoid doing this.
    // protected scan(): Promise<any[]> {
    //     return new Promise((resolve, reject) => {
    //         this._documentClient.scan({
    //             TableName: this._settings.dynamoTable.name,
    //             ConsistentRead: true
    //         }, (err, data) => {
    //             if (err) {
    //                 reject(LambdaError.internalError(err));
    //             } else {
    //                 let items = [];
    //                 if (data && data.Items) {
    //                     items = data.Items;
    //                 }
    //                 resolve(items);
    //             }
    //         });
    //     });
    // }
}
