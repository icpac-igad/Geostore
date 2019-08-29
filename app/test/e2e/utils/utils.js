const GeoStore = require('models/geoStore');
const md5 = require('md5');
const { DEFAULT_GEOJSON } = require('./test.constants');

const getUUID = () => Math.random().toString(36).substring(7);

const ensureCorrectError = ({ body, status }, errMessage, expectedStatus) => {
    status.should.equal(expectedStatus);
    body.should.have.property('errors').and.be.an('array');
    body.errors[0].should.have.property('detail').and.equal(errMessage);
    body.errors[0].should.have.property('status').and.equal(expectedStatus);
};

const createGeostore = (additionalData = {}, data = DEFAULT_GEOJSON) => new GeoStore({
    geojson: data,
    hash: md5(JSON.stringify(data) + getUUID()),
    ...additionalData
}).save();

module.exports = {
    getUUID,
    createGeostore,
    ensureCorrectError
};
