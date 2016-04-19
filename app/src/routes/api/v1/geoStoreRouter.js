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
        if(hash.length > 24){
            logger.debug('Is a ndb id (old id). Searching new id');
            let idCon = yield IdConnection.findOne({oldId: hash}).exec();
            if(!idCon){
                throw new Error('Old Id not found');
            }
            return idCon.newId;
        }
        logger.debug('Is a new id');
        return hash;
    }

    static * getGeoStoreById() {
        this.assert(this.params.id, 400, 'Hash param not found');
        logger.debug('Getting geostore by hash %s', this.params.hash);
        var geoStore = null;

        try {
            let hash = yield GeoStoreRouter.getNewHash(this.params.hash);
            geoStore = yield GeoStore.findOne({hash: hash}, {'geojson._id': 0, 'geojson.features._id': 0});
            logger.debug('GeoStore found. Returning...');
        } catch(e) {
            logger.error(e);
        } finally {
            if(!geoStore) {
                this.throw(404, 'GeoStore not found');
                return;
            }
            this.body = GeoJSONSerializer.serialize(geoStore);
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

        var geoIns = yield new GeoStore(geoStore).save();
        logger.debug('Save correct');
        this.body = GeoJSONSerializer.serialize(geoIns);
    }

}

router.get('/:id', GeoStoreRouter.getGeoStoreById);
router.post('/', GeoStoreValidator.create, GeoStoreRouter.createGeoStore);

module.exports = router;
