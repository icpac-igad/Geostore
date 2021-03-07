const request = require("co-request");
const logger = require("logger");
const GeoStoreServiceV2 = require("services/geoStoreServiceV2");

const getFeature = function* (base_url, table_name, featureId, precision) {
    let url = `${base_url}/collections/${table_name}/items/${featureId}.json`;

    if (precision) {
        url = `${url}?precision=${precision}`;
    }

    logger.debug("Doing request to ", url);

    try {
        let response = yield request({
            url,
            method: "GET",
            json: true,
        });

        if (response.statusCode === 200) {
            return response.body;
        }

        if (response.statusCode === 404) {
            const message = response.body || "Feature Not Found";

            throw { status: 404, message: message };
        }

        throw { status: 500, message: response.body };
    } catch (error) {
        throw error;
    }
};

class PgFeatureService {
    *getUse(url, use, id, simplify) {
        logger.debug("Obtaining use with id %s", id);

        const params = {
            use,
            id: parseInt(id, 10),
        };

        const precision = 4;

        const info = {
            use: params,
            simplify: !!simplify,
            simplifyThresh: !!simplify && precision,
        };

        const query = {
            "info.use.use": params.use,
            "info.use.id": params.id,
            "info.simplify": info.simplify,
            "info.simplifyThresh": info.simplifyThresh,
        };

        logger.debug("Checking existing use geo", query);

        let existingGeo = yield GeoStoreServiceV2.getGeostoreByInfoProps(query);

        logger.debug("Existed geo");

        if (existingGeo) {
            logger.debug("Return use geojson stored");
            return existingGeo;
        }

        logger.debug("Request use to carto");

        let data;

        if (simplify) {
            data = yield getFeature(url, params.use, params.id, precision);
        } else {
            data = yield getFeature(url, params.use, params.id);
        }

        if (data) {
            logger.debug("Saving use geostore");

            const geoData = {
                info,
            };

            existingGeo = yield GeoStoreServiceV2.saveGeostore(data, geoData);

            logger.debug("Return use geojson from pg featureserv");

            return existingGeo;
        }
        return null;
    }
}

module.exports = new PgFeatureService();
