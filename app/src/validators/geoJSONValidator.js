'use strict';
var logger = require('logger');
var geojsonhint = require('geojsonhint');
var koaValidate = require('koa-validate');

(function(){

    koaValidate.Validator.prototype.isGEOJSON = function(tip){
        if(!this.value){
            // not required
            return this;
        }
        let result = geojsonhint.hint(this.value);
        if(result && result.length > 0){
            this.addError(result[0].message);
        }
        return this;
    };

}());
