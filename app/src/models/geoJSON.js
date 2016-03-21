'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GeoJSON = new Schema({
    type: {type: String, required: true, trim: true},
    features: [{
        type: {type: String, required:true, trim: true},
        properties: {type: Schema.Types.Mixed},
        geometry:{
            type: {type: String, required:true, trim: true},
            coordinates: [Schema.Types.Mixed]
        }
    }],

});

module.exports = mongoose.model('GeoJSON', GeoJSON);
