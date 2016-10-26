'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Coverage = new Schema({
    geojson:{
        // type: {type: String,  trim: true},
        // features: [{
            // type: {type: String,  trim: true},
            // properties: {type: Schema.Types.Mixed},
            // geometry:{
                type: {type: String, trim: true},
                coordinates: [Schema.Types.Mixed]
            // }
        // }],
        // crs:{
        //     type: {type: String, required:false, trim: true},
        //     properties:{type: Schema.Types.Mixed, required: false }
        // }
    },
    slug: {type: String, required: true, trim: true},
    layerSlug: {type: String, required: true, trim: true}
});

Coverage.index({'geojson': '2dsphere'});
module.exports = mongoose.model('Coverage', Coverage);
