'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GeoStore = new Schema({
    geojson:{
        type: {type: String,  trim: true},
        features: [{
            _id: false,
            type: {type: String,  trim: true},
            properties: {type: Schema.Types.Mixed},
            geometry:{
                _id: false,
                type: {type: String, trim: true},
                coordinates: [Schema.Types.Mixed]
            }
        }],
        crs:{
            _id: false,
            type: {type: String, required:false, trim: true},
            properties:{type: Schema.Types.Mixed, required: false }
        }
    },
    areaHa: {type: Number, required: false},
    bbox: {type: Schema.Types.Mixed, required: false},
    hash: {type: String, required: true, trim: true},
    lock: {type: Boolean, required: true, default: false},
    provider: {
        type: {type: String, trim: true},
        table: {type: String, trim: true},
        user: {type: String, trim: true},
        filter: {type: String, trim: true}
    },
    info: {
        iso: {type: String, required: false},
        name: {type: String, required: false},
        id1: {type: Number, required: false},
        wdpaid: {type: Number, required: false},
        use: {
            use:{type: String, required: false},
            id:{type: Number, required: false},
        }
    }
});

GeoStore.index({hash: 1});

module.exports = mongoose.model('GeoStore', GeoStore);
