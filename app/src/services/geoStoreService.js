'use strict';
var logger = require('logger');
var GeoStore = require('models/geoStore');
var GeoJSONConverter = require('converters/geoJSONConverter');
var md5 = require('md5');
var CartoDB = require('cartodb');
var turf = require('turf');
var ProviderNotFound = require('errors/providerNotFound');
var GeoJSONNotFound = require('errors/geoJSONNotFound');

const CARTO_PROVIDER = 'carto';


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

    static * obtainGeoJSONOfCarto(table, user, filter) {
        logger.debug('Obtaining geojson with params: table %s, user %s, filter %s', table, user, filter);
        logger.debug('Generating query');
        let sql = `SELECT ST_AsGeoJson(the_geom) as geojson, (ST_Area(geography(the_geom))/10000) as area_ha FROM ${table} WHERE ${filter}`;
        logger.debug('SQL to obtain geojson: %s', sql);
        let client = new CartoDB.SQL({
            user: user
        });
        let data = yield executeThunk(client, sql, {});
        if (data.rows && data.rows.length === 1) {
            data.rows[0].geojson = JSON.parse(data.rows[0].geojson);
            return data.rows[0];
        }
        throw new GeoJSONNotFound('Geojson not found');
    }

    static * obtainGeoJSON(provider) {
        logger.debug('Obtaining geojson of provider', provider);
        switch (provider.type) {
            case CARTO_PROVIDER:
                return yield GeoStoreService.obtainGeoJSONOfCarto(provider.table, provider.user, provider.filter);
            default:
                logger.error('Provider not found');
                throw new ProviderNotFound(`Provider ${provider.type} not found`);
        }
    }

    static * saveGeostore(geojson, provider) {

        let geoStore = {
            geojson: geojson
        };
        if (provider) {

            let geoJsonObtained = yield GeoStoreService.obtainGeoJSON(provider);
            geoStore.geojson = geoJsonObtained.geojson;
            geoStore.areaHa = geoJsonObtained.area_ha;
            geoStore.provider = {
                type: provider.type,
                table: provider.table,
                user: provider.user,
                filter: provider.filter
            };

        }

        logger.debug('Converting geojson');
        geoStore.geojson = GeoJSONConverter.convert(geoStore.geojson);
        logger.debug('Creating hash from geojson md5');
        geoStore.hash = md5(JSON.stringify(geoStore.geojson));
        if (geoStore.areaHa === undefined) {
            geoStore.areaHa = turf.area(geoStore.geojson) / 10000; // convert to ha2
        }
        let exist = yield GeoStore.findOne({
            hash: geoStore.hash
        });
        if (exist) {
            logger.debug('Updating');
            yield GeoStore.update({
                _id: exist._id
            }, geoStore);
        } else {
            logger.debug('Not exist');
            yield new GeoStore(geoStore).save();
        }
        return yield GeoStore.findOne({
            hash: geoStore.hash
        }, {
            'geojson._id': 0,
            'geojson.features._id': 0
        });
    }

}

module.exports = GeoStoreService;
