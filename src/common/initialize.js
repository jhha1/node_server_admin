const fs = require('fs');
const path = require("path");
const morgan = require("morgan");
const logger = require('../utils/logger');
const db = require("../database/pool");

function initializeAppServer(app) {
    _loadConfig();
    _initializeLogger(app);

    db.connect();
}

function _loadConfig() {
    const args = process.argv.slice(2);

    // 실행 시 인자가 없으면 라이브
    if (args.length === 0) {
        global.ENV = "dev";
    }
    // 실행 시 인자가 있으면 해당 서버환경 (dev, stage, live)
    else {
        global.ENV = args[0];
    }

    global.CONFIG  = JSON.parse(fs.readFileSync(path.join(__dirname, `../../config/config_${ENV}.json`), 'utf8'));
}

function _initializeLogger(app) {
    logger.initialize();

    global.logger = logger.logger;
    global.httpLogger = logger.httpLogger;

    app.use(morgan('combined', { stream: logger.httpLogger }));
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error',
        });
    });
}

exports.initializeAppServer = initializeAppServer;