import chai = require("chai");
import { agent, Request } from "supertest";
import { IModel } from "../../module/models";
import catchChaiAssertionFailures from "../../utils/tests/chai-assertion-catch";

// NOTE: Make sure the URL ends with a trailing slash
// npm run test:e2e
const request = agent("[[ENDPOINT]]");


function createModel(data: IModel): Promise<IModel> {
    return new Promise((resolve, reject) => {
        request
            .post('')
            .send(data)
            .set('accept', 'json')
            .expect(200)
            .end((err, res) => {
                if (err) {
                    console.log(err);
                    reject(err);
                    return;
                }
                resolve(res.body);
            });
    });
}

describe('Model Module CRUD', () => {

    let model1: IModel;
    let model2: IModel;

    before(() => {
        return catchChaiAssertionFailures(createModel({ sampleProp: 'Cool.' }))
            .then(p => {
                model1 = p as IModel;

                chai.expect(model1.sampleProp).to.be.equal("Cool.");
                chai.expect(model1).to.contain.keys("id", "createTime");
                return p;
            })
            .then(() => createModel({ sampleProp: 'Nice' }))
            .then(p => {
                model2 = p;

                chai.expect(model2.sampleProp).to.be.equal("Nice");
                chai.expect(model2).to.contain.keys("id", "createTime");
                return p;
            })
    });


    describe('Reads', () => {

        it('Retrieve valid Model', () => {
            return catchChaiAssertionFailures(Promise.resolve())
                .then(() => request.get(model1.id).send())
                .then(res => {
                    model1 = res.body;
                    chai.expect(res.status).to.be.equal(200);
                    chai.expect(model1.sampleProp).to.be.equal("Cool.");
                    chai.expect(model1).to.contain.keys("id", "createTime");
                    return model1;
                });
        });

        it('Throw 404 not found', () => {
            return catchChaiAssertionFailures(Promise.resolve())
                .then(() => request.get('does-not-exist').send())
                .then(res => {
                    chai.expect(res.status).to.be.equal(404, "Expected Status Code 404 Not Found");
                });
        });

        it('Throw for an invalid Model', () => {
            return catchChaiAssertionFailures(Promise.resolve())
                .then(() => request.get('error').send())
                .then(res => {
                    chai.expect(res.status).to.be.equal(401, "Expected Status Code 401 Not Authorized");
                    chai.expect(JSON.stringify(res.body)).to.be.equal('{"message":"Permission Denied","type":"Access Error"}');
                });
        });
    });

    // describe('Scans', () => {
    //     it('Contains two people', done => {
    //         request
    //             .get('')
    //             .expect(200)
    //             .end((err, res) => {
    //                 res = res.body;
    //                 chai.expect(res).to.be.an("Array").with.lengthOf(2);

    //                 chai.expect(res[0].firstName).to.be.equal("James");
    //                 chai.expect(res[0].lastName).to.be.equal("TheMan");
    //                 chai.expect(res[0].email).to.be.equal("test1@test.com");
    //                 chai.expect(res[0].phone).to.be.equal("123-123-1235");
    //                 chai.expect(res[0]).to.contain.keys("id", "createTime");

    //                 chai.expect(res[1].firstName).to.be.equal("Russell");
    //                 chai.expect(res[1].lastName).to.be.equal("Watson");
    //                 chai.expect(res[1].email).to.be.equal("test@test.com");
    //                 chai.expect(res[1].phone).to.be.equal("123-123-1234");
    //                 chai.expect(res[1]).to.contain.keys("id", "createTime");

    //                 done();
    //             });
    //     });
    // });

    describe('Put Tests', () => {
        it('Updates valid Model', () => {
            model1.sampleProp = "updated";
            return catchChaiAssertionFailures(Promise.resolve())
                .then(() => request.put('').send(model1).set('accept', 'json'))
                .then(res => {
                    model1 = res.body;
                    chai.expect(res.status).to.equal(200, "Expected Status Code 200 OK");
                    chai.expect(model1.sampleProp).to.be.equal("updated");
                    chai.expect(model1).to.contain.keys("id", "createTime", "updateTime");
                });
        });
    });

    describe('Delete Tests', () => {
        it('Deletes valid Model', () => {
            return catchChaiAssertionFailures(Promise.resolve())
                .then(() => request.delete(model1.id))
                .then(res => chai.expect(res.status).to.equal(200, "Expected Status Code 200 OK - Model 1 Del"))
                .then(() => request.delete(model2.id))
                .then(res => chai.expect(res.status).to.equal(200, "Expected Status Code 200 OK - Model 2 Del"))
                .then(() => request.get(model2.id))
                .then(res => chai.expect(res.status).to.equal(404, "Expected Status Code 404 Not Found - Model 1 Get Check"))
                .then(() => request.get(model1.id).send())
                .then(res => chai.expect(res.status).to.equal(404, "Expected Status Code 404 Not Found - Model 2 Get Check"));
        });
    });
});
