import { LambdaError } from './../../utils/errors';
import { MODULE_TYPES, IAppSettings, IDeleteRequest, IGetRequest } from '../models';
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

function generateApiEvent(pathParameters: {[name: string]: string, id?: string}): any {
    return {
        body: "",
        headers: { "key": "val" },
        httpMethod: "POST",
        isBase64Encoded: false,
        path: "sample",
        pathParameters: pathParameters,
        queryStringParameters: null,
        stageVariables: null,
        requestContext: null,
        resource: ""
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
        let ret = [];
        if (params.ExpressionAttributeValues[":id"] === "123") {
            ret.push({
                id: "123",
                sample: "test1"
            });
        }
        callback(null, {
            Items: ret
        });
        return generateDummyRequest();
    }
};
let settings: IAppSettings = {
    table: {
        addTimestamps: true,
        idFields: ["id"],
        name: "blah"
    },
    example: "sampleSetting"
}
let dtw: DynamoTableWrapper = new DynamoTableWrapper(settings, mockDocumentClient);
container.rebind<IDynamoTable>(MODULE_TYPES.IDynamoTable).toConstantValue(dtw);

// Import methods that utilize the container after the mocked rebind
import { post, del, get, put } from '../main';


describe('Model Module CRUD', () => {

    let event: APIGatewayEvent;

    beforeEach(() => {
        event = generateApiEvent(null);
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

    it("Main Post with ID => Put", () => {
        event.body = JSON.stringify({ name: "whoop", id: "123", createTime: 1234 });

        return catchChaiAssertionFailures(post(event))
            .then(data => {
                chai.expect(data).contains.all.keys("id", "createTime", "updateTime");
                chai.expect(data.name).to.equal("whoop");
                return data;
            })
    });

    it("Main Post with missing ID => Put", () => {
        event.body = JSON.stringify({ name: "whoop", id: "1234", createTime: 1234 });

        return post(event)
            .catch((reason: LambdaError) => {
                chai.expect(JSON.stringify(reason)).to.equal('{"statusCode":404,"message":"The object {\\":id\\":\\"1234\\"} is not found","type":"notFound"}');
            });
    });

    it("Main Post null model", () => {
        event.body = "";
        try {
            return post(event);
        } catch (err) {
            chai.expect(JSON.stringify(err)).to.equal('{"statusCode":400,"message":"Model updates require a model that is not null or undefined.","type":"Request Error"}');
        }
    });

    it("Main Delete", () => {
        let req: IDeleteRequest = generateApiEvent({ id: "123" });

        //The assertion is that the promise successfully resolves. There is nothing to verify in a response, but only that it doesn't return or throw an error.
        return del(req);
    });

    it("Main Delete returns 404", () => {
        let req: IDeleteRequest = generateApiEvent({ id: "does-not-exist" });

        return del(req).catch(reason => {
            chai.expect(JSON.stringify(reason)).to.equal('{"statusCode":404,"message":"The object {\\":id\\":\\"does-not-exist\\"} is not found","type":"notFound"}');
        });
    });

    it("Main Get", () => {
        let req: IGetRequest = generateApiEvent({ id: "123" });

        return catchChaiAssertionFailures(get(req))
            .then(res => {
                chai.expect(JSON.stringify(res)).to.equal('{"id":"123","sample":"test1"}');
            })
    });

    it("Main Get => Permissions error sample", () => {
        let req: IGetRequest = generateApiEvent({ id: "error" });

        try {
            return get(req)
        } catch (err) {
            chai.expect(JSON.stringify(err)).to.equal('{"statusCode":401,"message":"Permission Denied","type":"Access Error"}');
        }
    });

    it("Main Put", () => {
        event.body = JSON.stringify({ name: "aName", id: "123", createTime: 1234 });

        return catchChaiAssertionFailures(put(event))
            .then(res => {
                chai.expect(res).contains.all.keys("id", "createTime", "updateTime");
                chai.expect(res.name).to.equal("aName");

            })
    });

});