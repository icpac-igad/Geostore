'use strict';
var logger = require('logger');
var should = require('should');
var assert = require('assert');
var GeoJSONConverter = require('converters/geoJSONConverter');


describe('Error serializer test', function () {
    var featureCollectionExample = {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-130.078125,
                            52.05249047600099
                        ]
                    ]
                ]
            }
        }]
    };
    var featureExample = {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [-130.078125,
                        52.05249047600099
                    ]
                ]
            ]

        }
    };
    var geometryExample = {
        type: 'Polygon',
        coordinates: [
            [
                [-130.078125,
                    52.05249047600099
                ]
            ]
        ]
    };

    before(function* () {

    });

    it('Create correct geojson from geometry', function () {
        let converted = GeoJSONConverter.makeFeatureCollection(geometryExample);
        converted.should.have.property('type');
        converted.type.should.be.equal(featureCollectionExample.type);
        converted.should.have.property('features');
        converted.features.should.be.a.Array();
        converted.features.should.length(featureCollectionExample.features.length);
       
	let feature = converted.features[0];
        feature.should.have.property('type');
        feature.type.should.be.equal(featureCollectionExample.features[0].type);
        feature.should.have.property('geometry');
        feature.geometry.should.be.a.Object();
        
	let geometry = feature.geometry;
        geometry.should.have.property('type');
        geometry.type.should.be.equal(featureCollectionExample.features[0].geometry.type);
        geometry.should.have.a.property('coordinates');
        geometry.coordinates.should.be.a.Array();
        geometry.coordinates.should.length(featureCollectionExample.features[0].geometry.coordinates.length);
    });

    it('Create correct geojson from feature', function () {
        let converted = GeoJSONConverter.makeFeatureCollection(featureExample);
        converted.should.have.property('type');
        converted.type.should.be.equal(featureCollectionExample.type);
        converted.should.have.property('features');
        converted.features.should.be.a.Array();
        converted.features.should.length(featureCollectionExample.features.length);
        
	let feature = converted.features[0];
        feature.should.have.property('type');
        feature.type.should.be.equal(featureCollectionExample.features[0].type);
        feature.should.have.property('geometry');
        feature.geometry.should.be.a.Object();
        
	let geometry = feature.geometry;
        geometry.should.have.property('type');
        geometry.type.should.be.equal(featureCollectionExample.features[0].geometry.type);
        geometry.should.have.a.property('coordinates');
        geometry.coordinates.should.be.a.Array();
        geometry.coordinates.should.length(featureCollectionExample.features[0].geometry.coordinates.length);
    });

    it('Create correct geojson from feature collection', function () {
        let converted = GeoJSONConverter.makeFeatureCollection(featureCollectionExample);
        converted.should.have.property('type');
        converted.type.should.be.equal(featureCollectionExample.type);
        converted.should.have.property('features');
        converted.features.should.be.a.Array();
        converted.features.should.length(featureCollectionExample.features.length);

        let feature = converted.features[0];
        feature.should.have.property('type');
        feature.type.should.be.equal(featureCollectionExample.features[0].type);
        feature.should.have.property('geometry');
        feature.geometry.should.be.a.Object();

        let geometry = feature.geometry;
        geometry.should.have.property('type');
        geometry.type.should.be.equal(featureCollectionExample.features[0].geometry.type);
        geometry.should.have.a.property('coordinates');
        geometry.coordinates.should.be.a.Array();
        geometry.coordinates.should.length(featureCollectionExample.features[0].geometry.coordinates.length);
    });

    it('Get geometry from from feature collection', function () {
        let geometry = GeoJSONConverter.getGeometry(featureCollectionExample);
	geometry.should.have.property('type');
        geometry.type.should.be.equal(geometryExample.type);
        geometry.should.have.a.property('coordinates');
        geometry.coordinates.should.be.a.Array();
        geometry.coordinates.should.length(geometryExample.coordinates.length);
    });

    it('Get geometry from from feature collection', function () {
        let geometry = GeoJSONConverter.getGeometry(featureExample);
	geometry.should.have.property('type');
        geometry.type.should.be.equal(geometryExample.type);
        geometry.should.have.a.property('coordinates');
        geometry.coordinates.should.be.a.Array();
        geometry.coordinates.should.length(geometryExample.coordinates.length);
    });

    it('Get geometry from from feature collection', function () {
        let geometry = GeoJSONConverter.getGeometry(geometryExample);
	geometry.should.have.property('type');
        geometry.type.should.be.equal(geometryExample.type);
        geometry.should.have.a.property('coordinates');
        geometry.coordinates.should.be.a.Array();
        geometry.coordinates.should.length(geometryExample.coordinates.length);
    });

    after(function* () {

    });
});

