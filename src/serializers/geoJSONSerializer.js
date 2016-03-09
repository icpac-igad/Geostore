'use strict';

var logger = require('logger');
var JSONAPISerializer = require('jsonapi-serializer').Serializer;
var geoJSONSerializer = new JSONAPISerializer('geoJSON', {
    attributes: ['type', 'features'],
    features:{
        attributes: ['type', 'geometry']
    },
    typeForAttribute: function (attribute, record) {
        return attribute;
    }
});

class GeoJSONSerializer {

  static serialize(data) {
    return geoJSONSerializer.serialize(data);
  }
}

module.exports = GeoJSONSerializer;
