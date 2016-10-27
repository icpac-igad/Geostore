'use strict';
var logger = require('logger');
var path = require('path');
var config = require('config');
var CartoDB = require('cartodb');
var Mustache = require('mustache');
var JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;

const ISO = `SELECT slug FROM coverage_layers cl, gadm2_countries_simple c where  ST_INTERSECTS(cl.the_geom, c.the_geom) and c.iso = UPPER('{{iso}}')`;

const ID1 = `SELECT slug FROM coverage_layers cl, gadm2_provinces_simple c where ST_INTERSECTS(cl.the_geom, c.the_geom) and c.iso = UPPER('{{iso}}')
          AND c.id_1 = {{id1}}`;

const WDPA = `with p as (SELECT p.the_geom AS the_geom
        FROM (
          SELECT CASE
          WHEN marine::numeric = 2 THEN NULL
            WHEN ST_NPoints(the_geom)<=18000 THEN the_geom
            WHEN ST_NPoints(the_geom) BETWEEN 18000 AND 50000 THEN ST_RemoveRepeatedPoints(the_geom, 0.001)
            ELSE ST_RemoveRepeatedPoints(the_geom, 0.005)
            END AS the_geom
          FROM wdpa_protected_areas
          WHERE wdpaid={{wdpaid}}
      ) p)
        SELECT slug from coverage_layers cl, p where ST_INTERSECTS(cl.the_geom, p.the_geom) `;

const USE = `SELECT slug FROM coverage_layers cl, {{useTable}} c where c.cartodb_id = {{pid}} and ST_INTERSECTS(cl.the_geom, c.the_geom)`;


const COVERAGES = `SELECT ST_AsGeoJSON(the_geom) as geojson, coverage_slug as slug, slug as layerSlug from coverage_layers`;

const WORLD = `SELECT slug FROM coverage_layers where ST_INTERSECTS(the_geom, ST_SetSRID(ST_GeomFromGeoJSON('{{{geojson}}}'), 4326))`;

var executeThunk = function(client, sql, params) {
    return function(callback) {
        logger.debug(Mustache.render(sql, params));
        client.execute(sql, params).done(function(data) {
            callback(null, data);
        }).error(function(err) {
            callback(err, null);
        });
    };
};

var deserializer = function(obj) {
    return function(callback) {
        new JSONAPIDeserializer({keyForAttribute: 'camelCase'}).deserialize(obj, callback);
    };
};


class CartoDBService {

    constructor() {
        this.client = new CartoDB.SQL({
            user: config.get('cartoDB.user')
        });
    }

    * getNational(iso) {
        logger.debug('Obtaining national of iso %s', iso);
        let params = {
            iso: iso
        };

        let data = yield executeThunk(this.client, ISO, params);
        if (data.rows && data.rows.length > 0) {
            return data.rows.map( item => item.slug );
        }
        return [];
    }

    * getSubnational(iso, id1) {
        logger.debug('Obtaining subnational of iso %s and id1', iso, id1);
        let params = {
            iso: iso,
            id1: id1
        };

        let data = yield executeThunk(this.client, ID1, params);
        if (data.rows && data.rows.length > 0) {
            return data.rows.map( item => item.slug );
        }
        return [];
    }

    * getUse(useTable, id) {
        logger.debug('Obtaining use with id %s', id);

        let params = {
            useTable: useTable,
            pid: id
        };

        let data = yield executeThunk(this.client, USE, params);

        if (data.rows && data.rows.length > 0) {
            return data.rows.map( item => item.slug );
        }
        return [];
    }

    * getWdpa(wdpaid) {
        logger.debug('Obtaining wpda of id %s', wdpaid);

        let params = {
            wdpaid: wdpaid
        };

        let data = yield executeThunk(this.client, WDPA, params);
        if (data.rows && data.rows.length > 0) {
            return data.rows.map( item => item.slug );
        }
        return [];
    }

    * getCoverages() {
        logger.info('Getting coverages');

        let data = yield executeThunk(this.client, COVERAGES);
        return data;
    }

    * getWorld(geojson) {
        logger.info('Getting layers that intersect');

        let params = {
            geojson: JSON.stringify(geojson)
        };

        let data = yield executeThunk(this.client, WORLD, params);
        if (data.rows && data.rows.length > 0) {
            return data.rows.map( item => item.slug );
        }
        return [];
    }

}

module.exports = new CartoDBService();
