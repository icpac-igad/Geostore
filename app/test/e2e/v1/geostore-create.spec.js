/* eslint-disable no-unused-vars,no-undef */
const nock = require('nock');
const chai = require('chai');

const { getTestServer } = require('../test-server');
const { getUUID } = require('../utils');

const should = chai.should();

let requester;

describe('Geostore v1 tests - Create geostores', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();

        nock.cleanAll();
    });

    it('Create a geostore with points should be successful', async () => {
        const response = await requester
            .post(`/api/v1/geostore`)
            .send({
                "geojson": {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "properties": {},
                            "geometry": {
                                "type": "Point",
                                "coordinates": [
                                    -1.6596221923828125,
                                    50.91255835156951
                                ]
                            }
                        },
                        {
                            "type": "Feature",
                            "properties": {},
                            "geometry": {
                                "type": "Point",
                                "coordinates": [
                                    4.39453125,
                                    46.195042108660154
                                ]
                            }
                        },
                        {
                            "type": "Feature",
                            "properties": {},
                            "geometry": {
                                "type": "Point",
                                "coordinates": [
                                    -4.130859375,
                                    40.04443758460856
                                ]
                            }
                        },
                        {
                            "type": "Feature",
                            "properties": {},
                            "geometry": {
                                "type": "Point",
                                "coordinates": [
                                    1.40625,
                                    30.06909396443887
                                ]
                            }
                        }
                    ]
                }
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        response.body.data.should.have.property('type').and.equal('geoStore');
        response.body.data.should.have.property('attributes').and.be.an('object');
        response.body.data.attributes.should.have.property('geojson').and.be.an('object');
        response.body.data.attributes.should.have.property('hash').and.be.a('string');
        response.body.data.attributes.should.have.property('provider').and.be.an('object');
        response.body.data.attributes.should.have.property('bbox').and.be.an('array');
        response.body.data.attributes.should.have.property('areaHa').and.be.an('number');
        response.body.data.attributes.should.have.property('lock').and.be.a('boolean');
        response.body.data.attributes.should.have.property('info').and.be.an('object');

        response.body.data.attributes.geojson.should.have.property('features').and.be.an('array').and.length(4);
        response.body.data.attributes.geojson.should.have.property('crs').and.be.an('object');
        response.body.data.attributes.geojson.should.have.property('type').and.equal('FeatureCollection');

        response.body.data.attributes.geojson.features[0].should.have.property('properties');
        response.body.data.attributes.geojson.features[0].should.have.property('type').and.equal('Feature');
        response.body.data.attributes.geojson.features[0].should.have.property('geometry').and.be.an('object');

        response.body.data.attributes.geojson.features[0].geometry.should.have.property('type').and.be.a('string');
        response.body.data.attributes.geojson.features[0].geometry.should.have.property('coordinates').and.be.an('array').and.not.length(0);
    });

    afterEach(() => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });

    after(() => {
    });
});
