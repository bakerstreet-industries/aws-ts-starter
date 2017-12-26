import chai = require("chai");
import { APIGatewayEvent } from "aws-lambda";
import wrapModule from "../wrapper";
import { LambdaError } from "../errors";

let sampleModule = {
    sampleSuccess: (event: APIGatewayEvent): Promise<string> => {
        return Promise.resolve("Sweet test, bruh.");
    },
    sampleLambdaErr: (event: APIGatewayEvent): Promise<string> => {
        return Promise.reject(LambdaError.notFound('SampleErr'));
    },
    sampleInternalErr: (event: APIGatewayEvent): Promise<string> => {
        return Promise.reject(new Error("SampleErr"));
    },
    sampleLambdaThrow: (event: APIGatewayEvent): Promise<string> => {
        throw LambdaError.notFound('ThrowTime');
    },
    sampleInternalThrow: (event: APIGatewayEvent): Promise<string> => {
        throw new Error("Got ya!");
    }
}

let wrappedModule: any = wrapModule(sampleModule);

describe('API Gateway Wrapper', () => {

    it("Should wrap an entire module", () => {
        chai.expect(sampleModule.sampleSuccess).to.not.equal(wrappedModule.sampleSuccess);
        chai.expect(sampleModule.sampleLambdaErr).to.not.equal(wrappedModule.sampleLambdaErr);
        chai.expect(sampleModule.sampleInternalErr).to.not.equal(wrappedModule.sampleInternalErr);
    });

    it("Should return a success 200 lambda response wrapper", (done) => {
        wrappedModule.sampleSuccess(null, null, (error?: Error | null, result?: any) => {
            chai.expect(result).contains.all.keys("statusCode", "body");
            chai.expect(result.statusCode).to.equal(200);
            chai.expect(result.body).to.equal('"Sweet test, bruh."');
            done();
        });
    });

    it("Should return a fail 500 lambda error wrapper", (done) => {
        wrappedModule.sampleLambdaErr(null, null, (error?: Error | null, result?: any) => {
            chai.expect(result).contains.all.keys("statusCode", "body");
            chai.expect(result.statusCode).to.equal(404);
            chai.expect(result.body).to.equal('{"message":"The object SampleErr is not found","type":"notFound"}');
            done();
        });
    });

    it("Should return a fail 500 internal error wrapper", (done) => {
        wrappedModule.sampleInternalErr(null, null, (error?: Error | null, result?: any) => {
            chai.expect(result).contains.all.keys("statusCode", "body");
            chai.expect(result.statusCode).to.equal(500);
            chai.expect(result.body).to.equal('{"message":"An internal error occurred","type":"internalError"}');
            done();
        });
    });

    it("Should catch and return a fail 500 lambda error wrapper", (done) => {
        wrappedModule.sampleLambdaThrow(null, null, (error?: Error | null, result?: any) => {
            chai.expect(result).contains.all.keys("statusCode", "body");
            chai.expect(result.statusCode).to.equal(404);
            chai.expect(result.body).to.equal('{"message":"The object ThrowTime is not found","type":"notFound"}');
            done();
        });
    });

    it("Should catch and return a fail 500 internal error wrapper", (done) => {
        wrappedModule.sampleInternalThrow(null, null, (error?: Error | null, result?: any) => {
            chai.expect(result).contains.all.keys("statusCode", "body");
            chai.expect(result.statusCode).to.equal(500);
            chai.expect(result.body).to.equal('{"message":"An internal error occurred","type":"internalError"}');
            done();
        });
    });

});