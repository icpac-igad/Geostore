'use strict';

var logger = require('logger');
var JSONAPISerializer = require('jsonapi-serializer').Serializer;
var coverageSerializer = new JSONAPISerializer('coverages', {
    attributes: ['layers'],
    typeForAttribute: function (attribute, record) {
        return attribute;
    },
    keyForAttribute: 'camelCase'
});

class CoverageSerializer {

  static serialize(data) {
    return coverageSerializer.serialize(data);
  }
}

module.exports = CoverageSerializer;
