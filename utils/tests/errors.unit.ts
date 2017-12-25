import { LambdaError } from './../errors';
import chai = require("chai");


describe('LambdaError', () => {

    let le: LambdaError;

    it("Should return an internal error message", () => {
        le = LambdaError.internalError({ message: 'Some Error Message' });
        chai.expect(le.message).to.equal("Some Error Message");
        chai.expect(le.statusCode).to.equal(500);
        chai.expect(le.type).to.equal("internalError");
    });

    it("Should return a Not Found error", () => {
        le = LambdaError.notFound("abc123");
        chai.expect(le.message).to.equal("The object abc123 is not found");
        chai.expect(le.statusCode).to.equal(404);
        chai.expect(le.type).to.equal("notFound");
    });

    it("Should return a Put Data Failure Error", () => {
        let pdf = LambdaError.putDataFailed({ message: "Some Put Error Message" });
        chai.expect(pdf.message).to.equal("Some Put Error Message");
        chai.expect(pdf.statusCode).to.equal(500);
        chai.expect(pdf.type).to.equal("putFailed");
    });

    it("Should return a Delete Data Failure Error", () => {
        le = LambdaError.deleteDataFailed({ message: 'Some Delete Error Message' });
        chai.expect(le.message).to.equal("Some Delete Error Message");
        chai.expect(le.statusCode).to.equal(500);
        chai.expect(le.type).to.equal("deleteFailed");
    });

    it("Should return a Lambda response body", () => {
        let lambda = le.toLambda();
        chai.expect(lambda.body).to.equal('{"message":"Some Delete Error Message","type":"deleteFailed"}');
        chai.expect(lambda.statusCode).to.equal(500);
    });

});