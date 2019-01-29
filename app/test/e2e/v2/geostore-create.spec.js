/* eslint-disable no-unused-vars,no-undef */
const nock = require('nock');
const chai = require('chai');
const config = require('config');

const { getTestServer } = require('../test-server');

const should = chai.should();

let requester;
nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('Geostore v2 tests - Create geostores', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }
        if (config.get('cartoDB.user') === null) {
            throw Error(`Carto user not set - please specify a CARTODB_USER env var with it.`);
        }

        requester = await getTestServer();

        nock.cleanAll();
    });

    it('Create a geostore with points should be successful', async () => {
        nock(`https://${config.get('cartoDB.user')}.cartodb.com:443`)
            .get('/api/v2/sql')
            .query(
                { q: "SELECT ST_AsGeoJson(ST_CollectionExtract(st_MakeValid(ST_GeomFromGeoJSON('{\"type\":\"Point\",\"coordinates\":[-1.6596221923828125,50.91255835156951]}')),1)) as geojson" }
            )
            .reply(200, {
                "rows": [{ "geojson": "{\"type\":\"Point\",\"coordinates\":[-1.65962219238281,50.9125583515695]}" }],
                "time": 0.09,
                "fields": { "geojson": { "type": "string" } },
                "total_rows": 1
            });

        const response = await requester
            .post(`/api/v2/geostore`)
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
