'use strict';

var Router = require('koa-router');
var logger = require('logger');
var GeoStoreValidator = require('validators/geoStoreValidator');
var GeoJSONSerializer = require('serializers/geoJSONSerializer');
var GeoJSON = require('models/geoJSON');


var router = new Router({
    prefix: '/geostore'
});


class GeoStoreRouter {

    static * getGeoStoreById() {
        logger.debug('Getting geostore by id %s', this.params.id);
        var geoJSON = null;
        try {
            geoJSON = yield GeoJSON.findById(this.params.id, {'features._id': 0});
            logger.debug(geoJSON);
        } catch(e) {
            logger.error(e);
        } finally {
            if(!geoJSON) {
                this.throw(404, 'GeoStore not found');
            }
            this.body = GeoJSONSerializer.serialize(geoJSON);
        }
    }

    static * createGeoStore() {
        logger.info('Saving GeoJSON');
        var geoIns = yield new GeoJSON(this.request.body).save();
        logger.debug('Save correct');
        this.body = GeoJSONSerializer.serialize(geoIns);
    }

}

router.get('/:id', GeoStoreRouter.getGeoStoreById);
router.post('/', GeoStoreValidator.create, GeoStoreRouter.createGeoStore);

module.exports = router;
