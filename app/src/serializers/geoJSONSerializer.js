'use strict';

var logger = require('logger');
var JSONAPISerializer = require('jsonapi-serializer').Serializer;
var geoStoreSerializer = new JSONAPISerializer('geoStore', {
    attributes: ['geojson', 'hash', 'provider', 'areaHa', 'bbox'],
    id: 'hash',

    geojson:{
        attributes:['type', 'features', 'crs']
    },
    provider:{
        attributes: ['type', 'table', 'user', 'filter']
    },
    typeForAttribute: function (attribute, record) {
        return attribute;
    },
    keyForAttribute: 'camelCase'
});

class GeoStoreSerializer {

  static serialize(data) {
    return geoStoreSerializer.serialize(data);
  }
}

module.exports = GeoStoreSerializer;
