const nock = require('nock');
const chai = require('chai');
const config = require('config');
const GeoStore = require('models/geoStore');
const { createRequest } = require('../utils/test-server');
const { createGeostore, ensureCorrectError } = require('../utils/utils');
const { DEFAULT_GEOJSON } = require('../utils/test.constants');

const should = chai.should();

const prefix = '/api/v1/geostore';
let geostoreWDPA;

describe('Geostore v1 tests - Getting geodata by wdpa', () => {
    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }
        if (config.get('cartoDB.user') === null) {
            throw Error(`Carto user not set - please specify a CARTODB_USER env var with it.`);
        }

        nock.cleanAll();
        geostoreWDPA = await createRequest(prefix, 'get');
    });

    it('Getting geodata by wdpa when data doens\'t exist into geostore should return not found', async () => {
        const response = await geostoreWDPA.get('/asdsadas/view');
        ensureCorrectError(response, 'GeoStore not found', 404);
    });

    it('Getting geodata by wdpa should return result', async () => {
        const createdGeostore = await createGeostore();
        const response = await geostoreWDPA.get(`/${createdGeostore.hash}/view`);
        response.status.should.equal(200);
        response.body.should.instanceOf(Object).and.have.property('view_link');
        // eslint-disable-next-line camelcase
        const { view_link } = response.body;
        const expectedGEOJSON = {
            features: [{
                properties: null,
                type: DEFAULT_GEOJSON.features[0].type,
                geometry: DEFAULT_GEOJSON.features[0].geometry,
            }],
            crs: {},
            type: DEFAULT_GEOJSON.type
        };

        view_link.should.equal(`http://geojson.io/#data=data:application/json,${encodeURIComponent(
            JSON.stringify(expectedGEOJSON)
        )}`);
    });

    afterEach(async () => {
        GeoStore.remove({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
