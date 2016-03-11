'use strict';
var logger = require('logger');
var geojsonhint = require('geojsonhint');
var koaValidate = require('koa-validate');
var GeoJSONConverter = require('converters/geoJSONConverter');

(function(){

    koaValidate.Validator.prototype.isGEOJSON = function(tip){
        let result = geojsonhint.hint(this.params);
        if(result && result.length > 0){
            this.addError(result[0].message);
        }
        return this;
    };

    koaValidate.Validator.prototype.toGEOJSON = function(tip){
            this.params = GeoJSONConverter(this.params);
            return this;
    };

}());
