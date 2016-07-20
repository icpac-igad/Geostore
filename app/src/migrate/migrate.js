'use strict';
var config = require('config');
var sleep = require('co-sleep');
var request = require('co-request');
var logger = require('logger');
var co = require('co');
var md5 = require('md5');
var mongoose = require('mongoose');
var GeoJSONConverter = require('converters/geoJSONConverter');
var geojsonhint = require('geojsonhint');
var uriMigrate = process.env.MIGRATE_URI || config.get('migrate.uri');
var mongoUri = process.env.MONGO_URI || 'mongodb://' + config.get('mongodb.host') + ':' + config.get('mongodb.port') + '/' + config.get('mongodb.database');

let GeoStore = require('models/geoStore');
let IdConnection = require('models/idConnection');

var obtainData = function*(cursor) {
    let url = uriMigrate;
    if (cursor) {
        url += '?cursor=' + cursor;
    }
    logger.debug('Doing request to ', url);
    var response = yield request({
        url: url,
        method: 'GET',
        json: true
    });
    if(response.statusCode !== 200){
        logger.error(response);
        logger.info('Waiting 5 seconds and trying');
        yield sleep(5000);
        response = yield request({
            url: url,
            method: 'GET',
            json: true
        });
    }
    return response.body;
};

var completeGeoJSON = function *(el, list) {
    logger.debug('Complete geojson');
    let found = null;
    let numRequest = 0;
    let firstTime = true;
    while(!found){
        for (let i = 0, length = list.length; i < length; i++) {
            if (list[i] === el.next_id) {
                found = list[i];
                // if (found.next_id) {
                //     found = yield completeGeoJSON(found, list);
                // }
                el.geojson += found.geojson;
            }
        }
        if (!found) {
            if(!firstTime){
                logger.error('Not found parts');
                throw new Error('Not found parts');
            }
            firstTime = false
            logger.info('Obtaining next data');
            let data = yield obtainData(nextCursor);
            nextCursor = data.cursor;
            list.concatmigrate(data.geostore);

        }
    }
    return el;
}
var checkIfExist = function*(id) {
    var result = yield IdConnection.find({
        oldId: id
    }).exec();
    if (result && result.length > 0) {
        return true;
    }
    return false;
};

var saveData = function*(element) {
    logger.debug('Saving element');
    try {
        logger.debug('Checking if exist id', element.id);
        let exist = yield checkIfExist(element.id);
        if (!exist) {
            var model = yield new GeoStore({
                geojson: element.geojson,
                hash: md5(JSON.stringify(element.geojson))
            }).save();

            yield new IdConnection({
                hash: model.hash,
                oldId: element.id
            }).save();
        } else {
            logger.error('Geostore duplicated');
        }
    } catch (e) {
        logger.error(e);
    }
    logger.debug('Saved');
};

var transformAndSaveData = function*(data) {
    logger.debug('Transforming data with data', data);
    let newData = [];
    let geojson, result, geoData = null;
    let length = data.length;
    for (let i = 0; i < length; i++) {
        logger.debug('Transforming element');
        result = null;
        geoData = data[i];
        if(geoData){
            try {
                if (data[i].next_id) {
                    logger.debug('Contain next_id');
                    // geoData = yield completeGeoJSON(geoData, data);
                }
                if (geoData.geojson) {
                    logger.debug('checking');
                    geojson = geoData.geojson;
                    logger.debug('Correct JSON');
                    let result = geojsonhint.hint(geojson);
                    if (!result || result.length === 0) {
                        yield saveData({
                            id: geoData.id,
                            geojson: GeoJSONConverter.convert(geojson)
                        });
                    }
                }
            } catch (e) {
                logger.error('JSON not valid', e);
            }
        }

        logger.debug('Percentage %', parseInt((i / length) * 100, 10));
    }
    logger.debug('Finished converting data');
    return newData;
};


var migrate = function*() {
    logger.debug('Connecting to database');
    var data = yield obtainData();

    while (data) {
        logger.debug('Obtained data');

        let element = null;
        let model, idConn = null;
        yield transformAndSaveData(data.geostore);
        if(data.cursor){
            data = yield obtainData(data.cursor);
        } else {
            data = null;
        }
    }

    logger.debug('Finished migration');
};
var onDbReady = function() {
    co(function*() {
        logger.info('Starting migration');

        yield migrate();
        process.exit();
    });
};
mongoose.connect(mongoUri, onDbReady);
