'use strict';

class GeoJSONNotFound extends Error{

    constructor(message){
        super(message);
        this.name = 'GeoJSONNotFound';
        this.message = message;
    }
}
module.exports = GeoJSONNotFound;
