require("dotenv").config();

module.exports = {
    mongodb: {
        host: "MONGO_PORT_27017_TCP_ADDR",
        port: "MONGO_PORT_27017_TCP_PORT",
        database: "MONGO_PORT_27017_TCP_DATABASE",
    },
    logger: {
        type: "LOGGER_TYPE",
        level: "LOGGER_LEVEL",
    },
    service: {
        port: "PORT",
    },
    migrate: {
        uri: "MIGRATE_URI",
    },
    cartoDB: {
        user: "CARTODB_USER",
    },
    pgFeatureServ: {
        url: "PG_FEATURE_SERV_URL",
    },
};
