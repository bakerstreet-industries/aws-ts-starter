import { DynamoDB } from "aws-sdk";
import { injectable, unmanaged } from "inversify";
import { LambdaError } from "./errors";
import log from "ts-log-class";
import uuid = require("uuid");

let ddb = new DynamoDB();
let _documentClient = new DynamoDB.DocumentClient();

@log()
@injectable()
export class Table {
    constructor(
        @unmanaged() private _tableName: string,
        @unmanaged() private _timestamps: boolean = true,
        @unmanaged() private _uuidFields: string[] = []
    ) { }

    protected internalDelete(key: { [name: string]: any }): Promise<any> {
        return new Promise((resolve, reject) => {
            _documentClient.delete({
                TableName: this._tableName,
                Key: key
            }, (err) => {
                if (err) {
                    reject(LambdaError.deleteDataFailed(err));
                }
                resolve();
            });
        });
    }

    protected internalGet(keyConditionExpression: string, expressionAttributeValues: { [name: string]: any }): Promise<any> {
        return new Promise((resolve, reject) => {
            _documentClient.query({
                TableName: this._tableName,
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

    protected internalPut(data): Promise<any> {
        this._uuidFields.forEach((field) => {
            // If provided don't create an UUID on the property that is marked for auto uuid.
            data[field] = data[field] || uuid.v1();
        });
        if (this._timestamps) {
            if (data.createTime) {
                data.updateTime = Date.now();
            } else {
                data.createTime = Date.now();
            }
        }
        return new Promise((resolve, reject) => {
            _documentClient.put({
                TableName: this._tableName,
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
    // protected internalScan(): Promise<any[]> {
    //     return new Promise((resolve, reject) => {
    //         _documentClient.scan({
    //             TableName: this._tableName,
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