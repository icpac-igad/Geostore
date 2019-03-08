'use strict';
var logger = require('logger');
var should = require('should');
var assert = require('assert');
var expect = require('chai').expect;
var GeoStoreService2 = require('services/geoStoreService');
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
     let geometry_type = GeoStoreService2.getGeometryType(pointGeometry);
        geometry_type.should.be.exactly(1).and.be.a.Number();
    });


    it('Get Polygon Geometry Type', function () {
     let geometry_type = GeoStoreService2.getGeometryType(polygonGeometry);
        geometry_type.should.be.exactly(3).and.be.a.Number();
    });

    it('Test unknown geometry', function () {
     try
        {GeoStoreService2.getGeometryType(invalidGeometry)}
     catch(err) {
        var expected = 'Unknown geometry type'
        assert.equal(err.message, expected)
        }

    });



    after(function*() {

    });
});
