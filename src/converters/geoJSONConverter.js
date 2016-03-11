'use strict';

let logger = require('logger');

module.exports.convert = function(data){
    if(data.coordinates){
        logger.debug('is a geometry');
        return {
            type: 'FeatureCollection',
            features:[{
                type: 'Feature',
                geometry: data
            }]
        };
    } else if(data.geometry){
        logger.debug('Is a feature');
        return {
            type: 'FeatureCollection',
            features:[data]
        };
    } else{
        logger.debug('Is a featureCollection');
        return data;
    }
};
