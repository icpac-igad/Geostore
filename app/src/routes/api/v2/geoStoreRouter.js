const Router = require("koa-router");
const logger = require("logger");
const GeoStoreValidator = require("validators/geoStoreValidator");
const GeoJSONSerializer = require("serializers/geoJSONSerializer");
const GeoStoreListSerializer = require("serializers/geoStoreListSerializer");
const AreaSerializer = require("serializers/areaSerializer");
const CountryListSerializer = require("serializers/countryListSerializer");
const CartoServiceV2 = require("services/cartoDBServiceV2");
const GeoStoreServiceV2 = require("services/geoStoreServiceV2");
const PgFeatureService = require("services/pgFeatureService");
const GeoJsonIOService = require("services/geoJsonIOService");
const ProviderNotFound = require("errors/providerNotFound");
const GeoJSONNotFound = require("errors/geoJSONNotFound");
const { geojsonToArcGIS } = require("arcgis-to-geojson-utils");
const { arcgisToGeoJSON } = require("arcgis-to-geojson-utils");
const config = require("config");

const router = new Router({
    prefix: "/geostore",
});

class GeoStoreRouterV2 {
    static *getGeoStoreById() {
        this.assert(this.params.hash, 400, "Hash param not found");
        logger.debug("Getting geostore by hash %s", this.params.hash);

        let geoStore = yield GeoStoreServiceV2.getGeostoreById(
            this.params.hash
        );
        if (!geoStore) {
            this.throw(404, "GeoStore not found");
            return;
        }
        logger.debug("GeoStore found. Returning...");
        if (!geoStore.bbox) {
            geoStore = yield GeoStoreServiceV2.calculateBBox(geoStore);
        }
        if (this.query.format && this.query.format === "esri") {
            logger.debug("esri", geojsonToArcGIS(geoStore.geojson)[0]);
            geoStore.esrijson = geojsonToArcGIS(geoStore.geojson)[0].geometry;
        }

        this.body = GeoJSONSerializer.serialize(geoStore);
    }

    static async getMultipleGeoStores() {
        this.assert(this.request.body.geostores, 400, "Geostores not found");
        const { geostores } = this.request.body;
        // filter duplicates
        if (!geostores || geostores.length === 0) {
            this.throw(404, "No GeoStores in payload");
            return;
        }
        const ids = [...new Set(geostores.map((el) => el.trim()))];

        logger.debug("Getting geostore by hash %s", ids);

        const geoStores = await GeoStoreServiceV2.getMultipleGeostores(ids);
        if (!geoStores || geoStores.length === 0) {
            this.throw(404, "No GeoStores found");
            return;
        }
        const foundGeoStores = geoStores.length;
        logger.debug(
            `Found ${foundGeoStores} matching geostores. Returning ${
                config.get("constants.maxGeostoresFoundById") > foundGeoStores
                    ? foundGeoStores
                    : config.get("constants.maxGeostoresFoundById")
            }.`
        );
        const slicedGeoStores = geoStores.slice(
            0,
            config.get("constants.maxGeostoresFoundById")
        );
        const parsedData = {
            geostores: slicedGeoStores,
            geostoresFound: geoStores.map((el) => el.hash),
            found: foundGeoStores,
            returned: slicedGeoStores.length,
        };
        this.body = GeoStoreListSerializer.serialize(parsedData);
    }

    static *createGeoStore() {
        logger.info("Saving GeoStore");
        try {
            const data = {
                provider: this.request.body.provider,
                info: {},
                lock: this.request.body.lock ? this.request.body.lock : false,
            };
            if (
                !this.request.body.geojson &&
                !this.request.body.esrijson &&
                !this.request.body.provider
            ) {
                this.throw(400, "geojson, esrijson or provider required");
                return;
            }
            if (this.request.body.esrijson) {
                this.request.body.geojson = arcgisToGeoJSON(
                    this.request.body.esrijson
                );
            }

            const geostore = yield GeoStoreServiceV2.saveGeostore(
                this.request.body.geojson,
                data
            );
            if (
                process.env.NODE_ENV !== "test" ||
                geostore.geojson.length < 2000
            ) {
                logger.debug(JSON.stringify(geostore.geojson));
            }
            this.body = GeoJSONSerializer.serialize(geostore);
        } catch (err) {
            if (
                err instanceof ProviderNotFound ||
                err instanceof GeoJSONNotFound
            ) {
                this.throw(400, err.message);
                return;
            }
            throw err;
        }
    }

    static *getArea() {
        logger.info("Retrieving Polygon Area");
        try {
            const data = {
                provider: this.request.body.provider,
                info: {},
                lock: this.request.body.lock ? this.request.body.lock : false,
            };
            if (
                !this.request.body.geojson &&
                !this.request.body.esrijson &&
                !this.request.body.provider
            ) {
                this.throw(400, "geojson, esrijson or provider required");
                return;
            }
            if (this.request.body.esrijson) {
                this.request.body.geojson = arcgisToGeoJSON(
                    this.request.body.esrijson
                );
            }
            const geostore = yield GeoStoreServiceV2.calculateArea(
                this.request.body.geojson,
                data
            );
            if (
                process.env.NODE_ENV !== "test" ||
                geostore.geojson.length < 2000
            ) {
                logger.debug(JSON.stringify(geostore.geojson));
            }
            this.body = AreaSerializer.serialize(geostore);
        } catch (err) {
            if (
                err instanceof ProviderNotFound ||
                err instanceof GeoJSONNotFound
            ) {
                this.throw(400, err.message);
                return;
            }
            throw err;
        }
    }

    static *getNational() {
        logger.info("Obtaining national data geojson (GADM v3.6)");
        const thresh = this.query.simplify
            ? JSON.parse(this.query.simplify.toLowerCase())
            : null;

        if (thresh && typeof thresh === Number && (thresh > 1 || thresh <= 0)) {
            this.throw(
                404,
                "Bad threshold for simplify. Must be in range 0-1."
            );
        } else if (thresh && typeof thresh === Boolean && thresh !== true) {
            this.throw(404, 'Bad syntax for simplify. Must be "true".');
        }
        const data = yield CartoServiceV2.getNational(this.params.iso, thresh);

        if (!data) {
            this.throw(404, "Country not found");
        }
        this.body = GeoJSONSerializer.serialize(data);
    }

    static *getNationalList() {
        logger.info("Obtaining national list (GADM v3.6)");
        const data = yield CartoServiceV2.getNationalList();
        if (!data) {
            this.throw(404, "Empty List");
        }
        this.body = CountryListSerializer.serialize(data);
    }

    static *getSubnational() {
        logger.info("Obtaining subnational data geojson (GADM v3.6)");
        const thresh = this.query.simplify
            ? JSON.parse(this.query.simplify.toLowerCase())
            : null;

        if (thresh && typeof thresh === Number && (thresh > 1 || thresh <= 0)) {
            this.throw(
                404,
                "Bad threshold for simplify. Must be in range 0-1."
            );
        } else if (thresh && typeof thresh === Boolean && thresh !== true) {
            this.throw(404, 'Bad syntax for simplify. Must be "true".');
        }
        const data = yield CartoServiceV2.getSubnational(
            this.params.iso,
            this.params.id1,
            thresh
        );
        if (!data) {
            this.throw(404, "Location does not exist.");
        }
        this.body = GeoJSONSerializer.serialize(data);
    }

    static *getRegional() {
        logger.info("Obtaining Admin2 data geojson (GADM v3.6)");
        const thresh = this.query.simplify
            ? JSON.parse(this.query.simplify.toLowerCase())
            : null;

        if (thresh && typeof thresh === Number && (thresh > 1 || thresh <= 0)) {
            this.throw(
                404,
                "Bad threshold for simplify. Must be in range 0-1."
            );
        } else if (thresh && typeof thresh === Boolean && thresh !== true) {
            this.throw(404, 'Bad syntax for simplify. Must be "true".');
        }
        const data = yield CartoServiceV2.getRegional(
            this.params.iso,
            this.params.id1,
            this.params.id2,
            thresh
        );
        if (!data) {
            this.throw(404, "Location does not exist.");
        }
        this.body = GeoJSONSerializer.serialize(data);
    }

    static *use() {
        logger.info(
            "Obtaining use data with name %s and id %s",
            this.params.name,
            this.params.id
        );
        const simplify = this.query.simplify
            ? JSON.parse(this.query.simplify.toLowerCase())
            : null;

        if (simplify && typeof simplify === Boolean && simplify !== true) {
            this.throw(404, 'Bad syntax for simplify. Must be "true".');
        }

        let useTable = this.params.name;

        let pgFeatureServUrl = config.get("pgFeatureServ.url");

        if (!useTable) {
            this.throw(404, "Name not found");
        }

        if (!pgFeatureServUrl) {
            this.throw(404, "PgFeatureServ not set");
        }

        const data = yield PgFeatureService.getUse(
            pgFeatureServUrl,
            useTable,
            this.params.id,
            simplify
        );

        if (!data) {
            this.throw(404, "Use not found");
        }
        this.body = GeoJSONSerializer.serialize(data);
    }

    static *wdpa() {
        logger.info("Obtaining wpda data with id %s", this.params.id);
        const data = yield CartoServiceV2.getWdpa(this.params.id);
        if (!data) {
            this.throw(404, "Wdpa not found");
        }

        this.body = GeoJSONSerializer.serialize(data);
    }

    static *view() {
        this.assert(this.params.hash, 400, "Hash param not found");
        logger.debug("Getting geostore by hash %s", this.params.hash);

        const geoStore = yield GeoStoreServiceV2.getGeostoreById(
            this.params.hash
        );

        if (!geoStore) {
            this.throw(404, "GeoStore not found");
            return;
        }
        logger.debug("GeoStore found. Returning...");

        const geojsonIoPath = yield GeoJsonIOService.view(geoStore.geojson);
        this.body = { view_link: geojsonIoPath };
    }
}

router.get("/:hash", GeoStoreRouterV2.getGeoStoreById);
router.post("/", GeoStoreValidator.create, GeoStoreRouterV2.createGeoStore);
router.post("/find-by-ids", GeoStoreRouterV2.getMultipleGeoStores);
router.post("/area", GeoStoreValidator.create, GeoStoreRouterV2.getArea);
router.get("/admin/:iso", GeoStoreRouterV2.getNational);
router.get("/admin/list", GeoStoreRouterV2.getNationalList);
router.get("/admin/:iso/:id1", GeoStoreRouterV2.getSubnational);
router.get("/admin/:iso/:id1/:id2", GeoStoreRouterV2.getRegional);
router.get("/use/:name/:id", GeoStoreRouterV2.use);
router.get("/wdpa/:id", GeoStoreRouterV2.wdpa);
router.get("/:hash/view", GeoStoreRouterV2.view);

module.exports = router;
