'use strict';

var Router = require('koa-router');
var logger = require('logger');
var GeoStoreValidator = require('validators/geoStoreValidator');
var GeoJSONSerializer = require('serializers/geoJSONSerializer');
var GeoJSONConverter = require('converters/geoJSONConverter');
var GeoStore = require('models/geoStore');
var IdConnection = require('models/idConnection');
var md5 = require('md5');


var router = new Router({
    prefix: '/geostore'
});


class GeoStoreRouter {

    static * getNewHash(hash){
        let idCon = yield IdConnection.findOne({oldId: hash}).exec();
        if(!idCon){
            return hash;
        }
        return idCon.hash;
    }

    static * getGeoStoreById() {
        this.assert(this.params.hash, 400, 'Hash param not found');
        logger.debug('Getting geostore by hash %s', this.params.hash);
        var geoStore = null;

        try {
            let hash = yield GeoStoreRouter.getNewHash(this.params.hash);
            logger.debug('hash',hash);
            geoStore = yield GeoStore.findOne({hash: hash}, {'geojson._id': 0, 'geojson.features._id': 0});
            logger.debug('GeoStore found. Returning...');

            if(!geoStore) {
                this.throw(404, 'GeoStore not found');
                return;
            }
            this.body = GeoJSONSerializer.serialize(geoStore);

        } catch(e) {
            logger.error(e);
            throw e;
        }
    }

    static * createGeoStore() {
        logger.info('Saving GeoStore');

        let geoStore = {};
        if(this.request.body.geojson){
            logger.debug('Contain a geojson');
            logger.debug('Converting geojson');
            geoStore.geojson = GeoJSONConverter.convert(this.request.body.geojson);
            logger.debug('Creating hash from geojson md5');
            geoStore.hash = md5(JSON.stringify(this.request.body.geojson));
        }
        try{
            logger.debug('hash', geoStore.hash);
            var geoIns = yield new GeoStore(geoStore).save();
            this.body = GeoJSONSerializer.serialize(geoIns);
            logger.debug('Save correct');
        } catch(err){
            logger.error(err);
            throw err;
        }
    }

}

router.get('/:hash', GeoStoreRouter.getGeoStoreById);
router.post('/', GeoStoreValidator.create, GeoStoreRouter.createGeoStore);

module.exports = router;
