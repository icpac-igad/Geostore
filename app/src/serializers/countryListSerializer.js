'use strict';

var logger = require('logger');


class CountryListSerializer {

  static serialize(data) {
    return {
        data: data.map(el => {
            return {
                'geostoreId': el.hash,
                'iso': el.info.iso,
                'name': el.name
            };
        })
    };
  }
}

module.exports = CountryListSerializer;
