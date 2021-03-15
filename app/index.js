const logger = require("logger");
const dotenv = require("dotenv")

dotenv.config();

require("app")().then(
    () => {
        logger.info("Server running");
    },
    (err) => {
        logger.error("Error running server", err);
    }
);
