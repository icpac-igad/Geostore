/* eslint-disable no-unused-vars,no-undef */
const nock = require('nock');
const chai = require('chai');

const { getTestServer } = require('../test-server');
const { getUUID } = require('../utils');

const should = chai.should();

let requester;

describe('Geostore v1 tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();

        nock.cleanAll();
    });

    it('Get geostore that doesn\'t exist should return a 404', async () => {
        const randomGeostoreID = getUUID();
        const response = await requester.get(`/api/v1/geostore/${randomGeostoreID}`).send();

        response.status.should.equal(404);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('status').and.equal(404);
        response.body.errors[0].should.have.property('detail').and.equal('GeoStore not found');
    });

    afterEach(() => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });

    after(() => {
    });
});
