'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GeoStore = new Schema({
    geojson:{
        type: {type: String,  trim: true},
        features: [{
            type: {type: String,  trim: true},
            properties: {type: Schema.Types.Mixed},
            geometry:{
                type: {type: String, trim: true},
                coordinates: [Schema.Types.Mixed]
            }
        }],
        crs:{
            type: {type: String, required:false, trim: true},
            properties:{type: Schema.Types.Mixed, required: false }
        }
    },
    areaHa: {type: Number, required: false},
    bbox: {type: Schema.Types.Mixed, required: false},
    hash: {type: String, required: true, trim: true},
    provider:{
        type:{type: String, trim: true},
        table: {type: String, trim: true},
        user:{type: String, trim: true},
        filter: {type: String, trim: true}
    }
});


module.exports = mongoose.model('GeoStore', GeoStore);
