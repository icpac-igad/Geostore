'use strict';
var logger = require('logger');
var should = require('should');
var assert = require('assert');
var GeoStoreService = require('services/geoStoreService');
var UnknownGeometry = require('errors/unknownGeometry');

describe('GeoStore Service test', function() {


    var pointGeometry = {
        type: "Point",
        coordinates: [-1.6596221923828125, 50.91255835156951]
     };


    var polygonGeometry = {
        type: 'Polygon',
        coordinates: [
            [
                [-130.0, 52.0],
                [-131.0, 52.0],
                [-131.0, 53.0],
                [-130.0, 53.0],
                [-130.0, 52.0]
            ]
        ]
    };

    var invalidGeometry = {
        type: "Unknown",
        coordinates: [-1.6596221923828125, 50.91255835156951]
     };

    before(function*() {

    });

    it('Get Point Geometry Type', function () {
     let geometry_type = GeoStoreService.getGeometryType(pointGeometry);
        geometry_type.should.be.exactly(1).and.be.a.Number();
    });

    it('Get Polygon Geometry Type', function () {
     let geometry_type = GeoStoreService.getGeometryType(polygonGeometry);
        geometry_type.should.be.exactly(3).and.be.a.Number();
    });

    it('Test unknown geometry', function () {
     assert.throw(function() { GeoStoreService.getGeometryType(invalidGeometry) }, UnknownGeometry)

    });



    after(function*() {

    });
});
