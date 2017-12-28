import { MODULE_TYPES, IAppSettings } from '../models';
import chai = require("chai");
import container from "../container";
import { IModel } from "../../module/models";
import { IDynamoDBDocumentClient, DynamoTableWrapper, IDynamoTable } from '../../utils/dynamo-table';
import { APIGatewayEvent } from 'aws-lambda';
import { Request } from 'aws-sdk/lib/request';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { AWSError } from 'aws-sdk/lib/error';
import catchChaiAssertionFailures from '../../utils/tests/chai-assertion-catch';

function generateDummyRequest(): Request<DocumentClient.DeleteItemOutput | DocumentClient.QueryOutput | DocumentClient.PutItemOutput, AWSError> {
    return {
        abort: null,
        createReadStream: null,
        eachPage: null,
        isPageable: null,
        send: null,
        on: null,
        promise: null,
        startTime: null,
        httpRequest: null,
    };
}

let mockDocumentClient: IDynamoDBDocumentClient = {
    delete: (params: DocumentClient.DeleteItemInput, callback?: (err: AWSError, data: DocumentClient.DeleteItemOutput) => void): Request<DocumentClient.DeleteItemOutput, AWSError> => {
        callback(null, null);
        return generateDummyRequest();
    },
    put: (params: DocumentClient.PutItemInput, callback?: (err: AWSError, data: DocumentClient.PutItemOutput) => void): Request<DocumentClient.PutItemOutput, AWSError> => {
        callback(null, params.Item);
        return generateDummyRequest();
    },
    query: (params: DocumentClient.QueryInput, callback?: (err: AWSError, data: DocumentClient.QueryOutput) => void): Request<DocumentClient.QueryOutput, AWSError> => {
        callback(null, {
            Items: [{
                sample: "test1"
            }]
        });
        return generateDummyRequest();
    }
};
let settings: IAppSettings = {
    table: {
        addTimestamps: true,
        idFields: ["id"],
        name: "blah"
    }
}
let dtw: DynamoTableWrapper = new DynamoTableWrapper(settings, mockDocumentClient);
container.rebind<IDynamoTable>(MODULE_TYPES.IDynamoTable).toConstantValue(dtw);

// Import methods that utilize the container after the mocked rebind
import { post } from '../main';


describe('Model Module CRUD', () => {

    let event: APIGatewayEvent;

    beforeEach(() => {

        event = {
            body: "",
            headers: { "key": "val" },
            httpMethod: "POST",
            isBase64Encoded: false,
            path: "sample",
            pathParameters: null,
            queryStringParameters: null,
            stageVariables: null,
            requestContext: null,
            resource: ""
        };
    })

    it("Main Post", () => {
        event.body = JSON.stringify({ name: "whoop" });

        return catchChaiAssertionFailures(post(event))
            .then(data => {
                chai.expect(data).contains.all.keys("id", "createTime");
                chai.expect(data.name).to.equal("whoop");
                return data;
            })
    });

});