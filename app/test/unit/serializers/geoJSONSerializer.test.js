'use strict';
var logger = require('logger');
var should = require('should');
var assert = require('assert');
var GeoJSONSerializer = require('serializers/geoJSONSerializer');

describe('GeoJSON serializer test', function() {
    var single = {
        hash: '78e731027d8fd50ed642340b7c9a63b3',
        id: 'asdfa',
        geojson: {
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
        }
    };
    var severalFeatures = {
        hash: '78e731027d8fd50ed642340b7c9a63b3',
        id: 'asdfa',
        geojson: {
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
            }, {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [-107.57812499999999,
                                66.51326044311188
                            ],
                            [-107.57812499999999,
                                70.1403642720717
                            ]
                        ]
                    ]
                }
            }]
        }
    };

    before(function*() {

    });

    it('Generate correct jsonapi response (single)', function() {
        let response = GeoJSONSerializer.serialize(single);
        response.should.not.be.a.Array();
        response.should.have.property('data');
        let data = response.data;
        data.should.have.property('type');
        data.should.have.property('attributes');
        data.should.have.property('id');
        data.type.should.equal('geoStore');
        data.id.should.equal(single.hash);
        data.attributes.geojson.should.have.property('type');
        data.attributes.geojson.type.should.be.equal(single.geojson.type);
        data.attributes.geojson.should.have.property('features');
        data.attributes.geojson.features.should.be.a.Array();
        data.attributes.geojson.features.should.length(single.geojson.features.length);
        let feature = data.attributes.geojson.features[0];
        feature.should.have.property('type');
        feature.type.should.be.equal(single.geojson.features[0].type);
        feature.should.have.property('geometry');
        feature.geometry.should.be.a.Object();
        let geometry = feature.geometry;
        geometry.should.have.property('type');
        geometry.type.should.be.equal(single.geojson.features[0].geometry.type);
        geometry.should.have.a.property('coordinates');
        geometry.coordinates.should.be.a.Array();
        geometry.coordinates.should.length(single.geojson.features[0].geometry.coordinates.length);
        geometry.coordinates.should.be.equal(single.geojson.features[0].geometry.coordinates);
    });

    it('Generate correct jsonapi response (several)', function() {
        let response = GeoJSONSerializer.serialize(severalFeatures);
        response.should.not.be.a.Array();
        response.should.have.property('data');
        let data = response.data;
        data.should.have.property('type');
        data.should.have.property('attributes');
        data.should.have.property('id');
        data.type.should.equal('geoStore');
        data.id.should.equal(single.hash);
        data.attributes.geojson.should.have.property('type');
        data.attributes.geojson.type.should.be.equal(severalFeatures.geojson.type);
        data.attributes.geojson.should.have.property('features');
        data.attributes.geojson.features.should.be.a.Array();
        data.attributes.geojson.features.should.length(severalFeatures.geojson.features.length);
        let feature = data.attributes.geojson.features[0];
        feature.should.have.property('type');
        feature.type.should.be.equal(severalFeatures.geojson.features[0].type);
        feature.should.have.property('geometry');
        feature.geometry.should.be.a.Object();
        let geometry = feature.geometry;
        geometry.should.have.property('type');
        geometry.type.should.be.equal(severalFeatures.geojson.features[0].geometry.type);
        geometry.should.have.a.property('coordinates');
        geometry.coordinates.should.be.a.Array();
        geometry.coordinates.should.length(severalFeatures.geojson.features[0].geometry.coordinates.length);
        geometry.coordinates.should.be.equal(severalFeatures.geojson.features[0].geometry.coordinates);
    });

    after(function*() {

    });
});
