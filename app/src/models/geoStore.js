'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GeoStore = new Schema({
    geojson:{
        type: {type: String, required: true, trim: true},
        features: [{
            type: {type: String, required:true, trim: true},
            properties: {type: Schema.Types.Mixed, required: true},
            geometry:{
                type: {type: String, required:true, trim: true},
                coordinates: [Schema.Types.Mixed]
            }
        }],
        crs:{
            type: {type: String, required:false, trim: true},
            properties:{type: Schema.Types.Mixed, required: false }
        }
    },
    hash: {type: String, required: true, trim: true},
    providers:[{
        provider:{type: String, required: true, trim: true},
        table: {type: String, required: true, trim: true},
        user:{type: String, required: true, trim: true}
    }]
});


module.exports = mongoose.model('GeoStore', GeoStore);
