import chai = require("chai");
import { AssertionError } from "assert";

export default function catchChaiAssertionFailures <T>(p: Promise<T>): Promise<T | AssertionError> {
    return p.catch((reason: AssertionError) => {
        chai.assert.fail(JSON.stringify(reason.actual), JSON.stringify(reason.expected), reason.message, reason.operator);
        return reason;
    });
}