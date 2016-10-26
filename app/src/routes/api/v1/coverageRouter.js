'use strict';

var Router = require('koa-router');
var logger = require('logger');
var CoverageSerializer = require('serializers/coverageSerializer');
var CoverageValidator = require('validators/coverageValidator');
var GeoStore = require('models/geoStore');
var IdConnection = require('models/idConnection');
var CoverageService = require('services/coverageService');
var CartoDBService = require('services/cartoDBService');
var GeoStoreService = require('services/geoStoreService');
var CoverageDuplicated = require('errors/coverageDuplicated');
var CoverageNotFound = require('errors/coverageNotFound');
var GeoJSONNotFound = require('errors/geoJSONNotFound');

var router = new Router({
    prefix: '/coverage'
});


class CoverageRouter {

    static * createCoverage() {
        logger.info('Creating coverage');
        logger.debug('coverage', this.body);
        try {
            let coverage = yield CoverageService.createCoverage(this.request.body);
            this.body = coverage;
        } catch(err){
            if (err instanceof CoverageDuplicated ){
                this.throw(400, err.message);
                return ;
            }
            throw err;
        }

    }

    static * updateCoverage() {
        logger.info('Creating coverage');
        logger.debug('coverage', this.body);
        try {
            let coverage = yield CoverageService.updateCoverage(this.params.slug, this.request.body);
            this.body = coverage;
        } catch(err){
            if (err instanceof CoverageNotFound ){
                this.throw(404, err.message);
                return ;
            }
            throw err;
        }

    }

    static * deleteCoverage() {
        logger.info('Delete coverage');
        try {
            let coverage = yield CoverageService.deleteCoverage(this.params.slug);
            this.body = coverage;
        } catch(err){
            if (err instanceof CoverageNotFound ){
                this.throw(404, err.message);
                return ;
            }
            throw err;
        }
    }



    static * intersectUse(){
        logger.info(`Calculating intersect with use ${this.params.name} and id ${this.params.id}`);
        let useTable = null;
        switch (this.params.name) {
            case 'mining':
                useTable = 'gfw_mining';
                break;
            case 'oilpalm':
                useTable = 'gfw_oil_palm';
                break;
            case 'fiber':
                useTable = 'gfw_wood_fiber';
                break;
            case 'logging':
                useTable = 'gfw_logging';
                break;
            default:
                this.throw(400, 'Name param invalid');
        }
        let result = yield CartoDBService.getUse(useTable, this.params.id);
        this.body = CoverageSerializer.serialize({layers: result});
    }

    static * intersectIsoRegion(){
        logger.info(`Calculating intersect with iso ${this.params.iso} and region ${this.params.id1}`);
        let result = null;
        if(!this.params.id1) {
            result = yield CartoDBService.getNational(this.params.iso);
        } else {
            result = yield CartoDBService.getSubnational(this.params.iso, this.params.id1);
        }
        this.body = CoverageSerializer.serialize({layers: result});
    }

    static * intersectWdpa() {
        logger.info(`Calculating intersect with wdpa ${this.params.id}`);
        let result = yield CartoDBService.getWdpa(this.params.id);

        this.body = CoverageSerializer.serialize({layers: result});

    }

    static * intersectGeo(){
        logger.info(`Calculating intersect with geostore ${this.query.geostore}`);
        this.assert(this.query.geostore, 400, 'GeoJSON param required');
        let geoStore = yield GeoStoreService.getGeostoreById(this.query.geostore);


        if (!geoStore || !geoStore.geojson) {
            this.throw(404, 'Use not found');
        }
        let result = yield CartoDBService.getWorld(geoStore.geojson.features[0].geometry);
        this.body = CoverageSerializer.serialize({layers: result});
    }

}

router.post('/', CoverageValidator.create, CoverageRouter.createCoverage);
router.patch('/:slug', CoverageValidator.update, CoverageRouter.updateCoverage);
router.put('/:slug', CoverageValidator.update, CoverageRouter.updateCoverage);
router.delete('/:slug', CoverageRouter.deleteCoverage);
router.get('/intersect', CoverageRouter.intersectGeo);
router.get('/intersect/admin/:iso', CoverageRouter.intersectIsoRegion);
router.get('/intersect/admin/:iso/:id1', CoverageRouter.intersectIsoRegion);
router.get('/intersect/use/:name/:id', CoverageRouter.intersectUse);
router.get('/intersect/wdpa/:id', CoverageRouter.intersectWdpa);

module.exports = router;
