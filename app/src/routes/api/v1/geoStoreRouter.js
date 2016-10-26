'use strict';

var Router = require('koa-router');
var logger = require('logger');
var GeoStoreValidator = require('validators/geoStoreValidator');
var GeoJSONSerializer = require('serializers/geoJSONSerializer');
var GeoStore = require('models/geoStore');
var IdConnection = require('models/idConnection');
var GeoStoreService = require('services/geoStoreService');
var ProviderNotFound = require('errors/providerNotFound');
var GeoJSONNotFound = require('errors/geoJSONNotFound');

var router = new Router({
    prefix: '/geostore'
});


class GeoStoreRouter {



    static * getGeoStoreById() {
        this.assert(this.params.hash, 400, 'Hash param not found');
        logger.debug('Getting geostore by hash %s', this.params.hash);
        var geoStore = null;

        try {

            geoStore = yield GeoStoreService.getGeostoreById(this.params.hash);
            
            logger.debug('GeoStore found. Returning...');

            if(!geoStore) {
                this.throw(404, 'GeoStore not found');
                return;
            }
            if(!geoStore.bbox) {
                geoStore = yield GeoStoreService.calculateBBox(geoStore);
            }
            this.body = GeoJSONSerializer.serialize(geoStore);

        } catch(e) {
            logger.error(e);
            throw e;
        }
    }

    static * createGeoStore() {
        logger.info('Saving GeoStore');
        try{
            let geostore = yield GeoStoreService.saveGeostore(this.request.body.geojson, this.request.body.provider);
            this.body = GeoJSONSerializer.serialize(geostore);
        }catch(err){
            if (err instanceof ProviderNotFound || err instanceof GeoJSONNotFound){
                this.throw(400, err.message);
                return ;
            }
            throw err;
        }

    }


}

router.get('/:hash', GeoStoreRouter.getGeoStoreById);
router.post('/', GeoStoreValidator.create, GeoStoreRouter.createGeoStore);

module.exports = router;
