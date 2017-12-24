import chai = require("chai");
import { agent, Request } from "supertest";
import { IModel } from "../../module/models";

// NOTE: Make sure the URL ends with a trailing slash
// npm run e2e
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

    before(done => {
        createModel({
            sampleProp: 'Cool.'
        }).then(p => {
            model1 = p;

            chai.expect(model1.sampleProp).to.be.equal("Cool.");
            chai.expect(model1).to.contain.keys("id", "createTime");

        }).then(() => {
            createModel({
                sampleProp: 'Nice!'
            }).then(p => {
                model2 = p;

                chai.expect(model2.sampleProp).to.be.equal("Nice!");
                chai.expect(model2).to.contain.keys("id", "createTime");

                done();
            });
        });
    });


    describe('Reads', () => {

        it('Retrieve valid Model', (done) => {
            request
                .get(model1.id)
                .expect(200)
                .end((err, res) => {

                    model1 = res.body;

                    chai.expect(model1.sampleProp).to.be.equal("Cool.");
                    chai.expect(model1).to.contain.keys("id", "createTime");

                    done();
                });
        });

        it('Throw 404 not found', (done) => {
            request
                .get('does-not-exist')
                .expect(404)
                .end(done);
        });

        it('Throw for an invalid Model', (done) => {
            request
                .get('error')
                .expect(401, '{"message":"Permission Denied","type":"Access Error"}')
                .end(done);
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
        it('Updates valid Model', (done) => {
            model1.sampleProp = "updated"
            request
                .put('')
                .send(model1)
                .set('accept', 'json')
                .expect(200)
                .end((err, res) => {

                    model1 = res.body;

                    chai.expect(model1.sampleProp).to.be.equal("updated");
                    chai.expect(model1).to.contain.keys("id", "createTime", "updateTime");

                    done();
                });
        });
    });

    describe('Delete Tests', () => {
        it('Deletes valid Model', (done) => {
            Promise.resolve()
                .then(() => request
                    .delete(model1.id)
                    .expect(200)
                )
                .then(() => request
                    .delete(model2.id)
                    .expect(200)
                )
                .then(() => request
                    .get(model2.id)
                    .expect(404)
                )
                .then(() => request
                    .get(model1.id)
                    .expect(404)
                    .send()
                )
                .then(() => done());
        }).timeout(10000);
    });
});
