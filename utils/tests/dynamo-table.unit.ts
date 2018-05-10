import chai = require("chai");
import { DynamoTableWrapper, IDynamoDBDocumentClient, IDynamoTable } from "../dynamo-table";
import { IAppSettings } from "../../module/models";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { AWSError } from "aws-sdk/lib/error";
import { Request } from "aws-sdk/lib/request";
import { LambdaError } from "../errors";

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

describe('Dynamo Table Wrapper', () => {

  let mockDocumentClient: IDynamoDBDocumentClient;
  let dtw: IDynamoTable;
  let err: AWSError;
  let settings: IAppSettings;

  beforeEach(() => {
    settings = {
      table: {
        addTimestamps: true,
        idFields: null,
        name: "blah"
      },
      example: "sampleSetting"
    };

    mockDocumentClient = {
      delete: null,
      query: null,
      put: null
    };

    dtw = new DynamoTableWrapper(settings, mockDocumentClient);

    err = {
      code: "",
      cfId: "",
      extendedRequstId: "",
      hostname: "",
      message: "",
      name: "",
      region: "",
      requestId: "",
      retryable: false,
      retryDelay: 0,
      stack: "",
      statusCode: 0,
      time: new Date()
    } as any;
  });

  it("Execute the Document delete method successfully", () => {
    let result: any;
    mockDocumentClient.delete = (params: DocumentClient.DeleteItemInput, callback?: (err: AWSError, data: DocumentClient.DeleteItemOutput) => void): Request<DocumentClient.DeleteItemOutput, AWSError> => {
      result = "mock-delete";
      callback(null, result);
      return generateDummyRequest();
    };
    return dtw.delete({ "mock-key": "mock-val" }).then(() => {
      chai.expect(result).to.equal("mock-delete");
    });
  });

  it("Execute the Document delete method unsuccessfully", () => {
    mockDocumentClient.delete = (params: DocumentClient.DeleteItemInput, callback?: (err: AWSError, data: DocumentClient.DeleteItemOutput) => void): Request<DocumentClient.DeleteItemOutput, AWSError> => {
      chai.expect(params.TableName).to.equal("blah");
      err.message = "mock-delete-fail"
      callback(err, null);
      return generateDummyRequest();
    };
    return dtw.delete({ "mock-key": "mock-val" }).catch(reason => {
      chai.expect(JSON.stringify(
        reason
      )).to.equal(JSON.stringify(
        LambdaError.deleteDataFailed({ message: "mock-delete-fail" })
      ));
    });
  });

  it("Execute the Document get method successfully", () => {
    mockDocumentClient.query = (params: DocumentClient.QueryInput, callback?: (err: AWSError, data: DocumentClient.QueryOutput) => void): Request<DocumentClient.QueryOutput, AWSError> => {
      chai.expect(params.TableName).to.equal("blah");
      callback(null, { Items: [{}] });
      return generateDummyRequest();
    };
    return dtw.get("", { "key": "val" }).then(data => {
      chai.expect(JSON.stringify(data)).to.equal("[{}]");
    });
  });

  it("Execute the Document get method unsuccessfully with no Items Property", () => {
    mockDocumentClient.query = (params: DocumentClient.QueryInput, callback?: (err: AWSError, data: DocumentClient.QueryOutput) => void): Request<DocumentClient.QueryOutput, AWSError> => {
      chai.expect(params.TableName).to.equal("blah");
      callback(null, {});
      return generateDummyRequest();
    };
    return dtw.get("", { "key": "val" }).catch(reason => {
      chai.expect(JSON.stringify(reason)).to.equal('{"statusCode":404,"message":"The object {\\"key\\":\\"val\\"} is not found","type":"notFound"}');
    });
  });

  it("Execute the Document get method unsuccessfully with no Items", () => {
    mockDocumentClient.query = (params: DocumentClient.QueryInput, callback?: (err: AWSError, data: DocumentClient.QueryOutput) => void): Request<DocumentClient.QueryOutput, AWSError> => {
      chai.expect(params.TableName).to.equal("blah");
      callback(null, { Items: [] });
      return generateDummyRequest();
    };
    return dtw.get("", { "key": "val" }).catch(reason => {
      chai.expect(JSON.stringify(reason)).to.equal('{"statusCode":404,"message":"The object {\\"key\\":\\"val\\"} is not found","type":"notFound"}');
    });
  });

  it("Execute the Document get method unsuccessfully with AWSError", () => {
    mockDocumentClient.query = (params: DocumentClient.QueryInput, callback?: (err: AWSError, data: DocumentClient.QueryOutput) => void): Request<DocumentClient.QueryOutput, AWSError> => {
      chai.expect(params.TableName).to.equal("blah");
      callback(err, null);
      return generateDummyRequest();
    };
    return dtw.get("", { "key": "val" }).catch(reason => {
      chai.expect(JSON.stringify(reason)).to.equal('{"statusCode":404,"message":"The object {\\"key\\":\\"val\\"} is not found","type":"notFound"}');
    });
  });

  it("Should not add a createTime property to the incoming object when addTimestamps is true", () => {
    mockDocumentClient.put = (params: DocumentClient.PutItemInput, callback?: (err: AWSError, data: DocumentClient.PutItemOutput) => void): Request<DocumentClient.PutItemOutput, AWSError> => {
      chai.expect(params.TableName).to.equal("blah");
      callback(null, params.Item);
      return generateDummyRequest();
    };
    settings.table.addTimestamps = false;
    return dtw.put({ "key": "val" }).then(data => {
      chai.expect(JSON.stringify(data)).to.equal('{"key":"val"}');
    });
  });

  it("Should add a createTime property to the incoming object when addTimestamps is true", () => {
    mockDocumentClient.put = (params: DocumentClient.PutItemInput, callback?: (err: AWSError, data: DocumentClient.PutItemOutput) => void): Request<DocumentClient.PutItemOutput, AWSError> => {
      chai.expect(params.TableName).to.equal("blah");
      //New create time values are always set to Date.now(), which will never pass a test looking for a static time
      params.Item.createTime = 1514312897594;
      callback(null, params.Item);
      return generateDummyRequest();
    };
    return dtw.put({ "key": "val" }).then(data => {
      chai.expect(JSON.stringify(data)).to.equal('{"key":"val","createTime":1514312897594}');
    });
  });

  it("Should add an updateTime property to the incoming object when addTimestamps is true and a createTime property already exists", () => {
    mockDocumentClient.put = (params: DocumentClient.PutItemInput, callback?: (err: AWSError, data: DocumentClient.PutItemOutput) => void): Request<DocumentClient.PutItemOutput, AWSError> => {
      chai.expect(params.TableName).to.equal("blah");
      //New update time values are always set to Date.now(), which will never pass a test looking for a static time
      params.Item.updateTime = 1514313438713;
      callback(null, params.Item);
      return generateDummyRequest();
    };
    return dtw.put({ "key": "val", "createTime": 1514312897594 }).then(data => {
      chai.expect(JSON.stringify(data)).to.equal('{"key":"val","createTime":1514312897594,"updateTime":1514313438713}');
    });
  });

  it("Should catch and reject with a wrapped AWS error on a put failure from the Document Client", () => {
    mockDocumentClient.put = (params: DocumentClient.PutItemInput, callback?: (err: AWSError, data: DocumentClient.PutItemOutput) => void): Request<DocumentClient.PutItemOutput, AWSError> => {
      chai.expect(params.TableName).to.equal("blah");
      err.message = "sample-put-error";
      callback(err, null);
      return generateDummyRequest();
    };
    return dtw.put({ "key": "val", "createTime": 1514312897594 }).catch(reason => {
      chai.expect(reason instanceof LambdaError).to.be.true;
      chai.expect(JSON.stringify(reason)).to.equal('{"statusCode":500,"message":"sample-put-error","type":"putFailed"}');
    });
  });

  it("Should add property fields to the incoming object when idFields are set on the settings object and no id field already exists", () => {
    mockDocumentClient.put = (params: DocumentClient.PutItemInput, callback?: (err: AWSError, data: DocumentClient.PutItemOutput) => void): Request<DocumentClient.PutItemOutput, AWSError> => {
      chai.expect(params.TableName).to.equal("blah");
      //New id values are always generated with a new uuid, which will never pass a test looking for a static id values
      params.Item.sample = "cd965b00-ea6c-11e7-966b-b13b8d801f06";
      params.Item.id = "cd965b01-ea6c-11e7-966b-b13b8d801f06";
      callback(null, params.Item);
      return generateDummyRequest();
    };
    settings.table.addTimestamps = false;
    settings.table.idFields = ["sample", "id"];
    return dtw.put({ "key": "val" }).then(data => {
      chai.expect(JSON.stringify(data)).to.equal('{"key":"val","sample":"cd965b00-ea6c-11e7-966b-b13b8d801f06","id":"cd965b01-ea6c-11e7-966b-b13b8d801f06"}');
    });
  });

  it("Should add property fields to the incoming object when idFields are set on the settings object and no id field already exists", () => {
    mockDocumentClient.put = (params: DocumentClient.PutItemInput, callback?: (err: AWSError, data: DocumentClient.PutItemOutput) => void): Request<DocumentClient.PutItemOutput, AWSError> => {
      chai.expect(params.TableName).to.equal("blah");
      //New id values are always generated with a new uuid, which will never pass a test looking for a static id values
      params.Item.id = "cd965b01-ea6c-11e7-966b-b13b8d801f06";
      callback(null, params.Item);
      return generateDummyRequest();
    };
    settings.table.addTimestamps = false;
    settings.table.idFields = ["sample", "id"];
    return dtw.put({ "key": "val", "sample": "muwahaha" }).then(data => {
      chai.expect(JSON.stringify(data)).to.equal('{"key":"val","sample":"muwahaha","id":"cd965b01-ea6c-11e7-966b-b13b8d801f06"}');
    });
  });

});
