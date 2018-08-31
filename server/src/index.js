const _ = require('lodash');
const {paths} = require('./conf/constants');
const app = require(paths.src.app);
const www = require(paths.src.www);

async function startStockApp(options = { webserverOptions:{}, applicationOptions: {}}) {
    try {
        if (!_.isObject(options)) {
            throw new Error('Options parameter must be an object');
        }
        let expressApp = await app(options.applicationOptions);
        await www(expressApp, options.webserverOptions);
        console.log('Stock App Startup Completed Successfully');
    } catch (error) {
        console.error('Error in Stock App Startup');
        throw error;
    }
}

module.exports = {
    startStockApp
}
