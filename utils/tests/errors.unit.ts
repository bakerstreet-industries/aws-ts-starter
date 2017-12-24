import { LambdaError } from './../errors';
import chai = require("chai");


describe('LambdaError', () => {

    it("Should test something", () => {
        chai.expect(LambdaError.internalError({
            message: 'Some Error Message'
        }).message).to.be.equal("Some Error Message");
    });

});