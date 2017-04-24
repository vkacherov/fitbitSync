'use strict';

var configMap = Object.freeze({
    production: {
        fitbitClientKey: process.env.FITBIT_DATA_EXPORT_CLIENT_KEY,
        fitbitClientSecret: process.env.FITBIT_DATA_EXPORT_CLIENT_SECRET,
        host: 'telemetrysyncservice.azurewebsites.net',
        sessionSecret: process.env.FITBIT_DATA_EXPORT_SESSION_SECRET,
        port: process.env.PORT || 3001
    },
    development: {
        fitbitClientKey: process.env.FITBIT_DATA_EXPORT_DEV_CLIENT_KEY,
        fitbitClientSecret: process.env.FITBIT_DATA_EXPORT_DEV_CLIENT_SECRET,
        host: 'telemetrysyncservice.azurewebsites.net',
        sessionSecret: process.env.FITBIT_DATA_EXPORT_DEV_SESSION_SECRET,
        port: process.env.PORT || 3001
    }
});

function getConfig(app) {
    return configMap[app.get('env')];
}

module.exports = getConfig;

