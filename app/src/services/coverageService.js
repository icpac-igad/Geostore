'use strict';
var logger = require('logger');
var Coverage = require('models/coverage');
var CartoDBService = require('services/cartoDBService');
var CoverageDuplicated = require('errors/coverageDuplicated');
var CoverageNotFound = require('errors/coverageNotFound');

var executeThunk = function(client, sql, params) {
    return function(callback) {
        client.execute(sql, params).done(function(data) {
            callback(null, data);
        }).error(function(err) {
            callback(err[0], null);
        });
    };
};


class GeoStoreService {

    static * createCoverage(body){
        logger.info('Creating coverage');
        let exist = yield Coverage.findOne({slug: body.slug}).exec();
        if(exist) {
            throw new CoverageDuplicated('Coverage duplicated');
        }
        logger.debug('Not exist duplicated');
        const coverage = yield new Coverage(body).save();
        return coverage;
    }

    static * updateCoverage(slug,  body){
        logger.info('Creating coverage');
        let exist = yield Coverage.findOne({slug: body.slug}).exec();
        if(!exist) {
            throw new CoverageNotFound('Coverage not found');
        }
        if(body.layerSlug !== '') {
            exist.layerSlug = body.layerSlug;
        }
        if(body.geojson !== '') {
            exist.geojson = body.geojson;
        }
        yield exist.save();
        return exist;
    }

    static * deleteCoverage(slug){
        logger.info('Delete coverage');
        let exist = yield Coverage.findOne({slug: slug}).exec();
        if(!exist) {
            throw new CoverageNotFound('Coverage not found');
        }
        yield exist.remove();
        return exist;
    }

    static * getCoveragesByIntersect(geojson){
        // logger.debug('Calculating intersect', geojson);
        let results = yield CartoDBService.getLayersIntersect(geojson);
        logger.debug(results);
        if (results && results.rows) {
            return results.rows.map( item => item.slug );
        }
        return [];
    }


    static * populateCoverages(data){
        logger.info('Populating coverags');
        if(!data) {
            logger.error('Data is empty');
            return;
        }
        let features = data.features;
        for(let i =0, length = features.length; i < length; i++) {
            logger.debug('Saving coverage', features[i].properties.slug);
            let properties = features[i].properties;
            delete features[i].properties;
            
            yield new Coverage({
                slug: properties.coverage_slug.replace('\n', '').replace('\t', ''),
                layerSlug: properties.slug,
                geojson:features[i].geometry
            }).save();
            logger.debug('Saved correctly', properties.slug);
        }
    }
}

module.exports = GeoStoreService;
