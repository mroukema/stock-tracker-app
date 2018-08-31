const _ = require('lodash');
const express = require('express');
const session = require('express-session');
const http = require('http');
const bodyParser = require('body-parser');

const {paths} = require('./conf/constants');
const stockData = require(paths.src.stockData);
const {updateStockData} = require(paths.src.calculations);
const router = require(paths.src.routes);


async function initAppData() {
    await stockData.initStockData();
    await updateStockData(stockData);
}

function createExpressApp() {
    const app = express();
    app.set('paths', paths);
    app.use((req,res,next) => {
        console.log(`Request ${req.method}: ${req.originalUrl}`);
        next();
    })
    app.use(express.static(paths.directories.client));
    app.use(bodyParser.json());
    app.use(router);

    app.use((error, req, res, next) => {
        let status = error.status || error.statusCode || 500
        console.error(error);
        res.status(status)
        res.json(error);
    });
    return app;
}

module.exports = (async function appInit() {
    console.log('Start app.js init');
    let app;

    try {
        await initAppData();
    } catch (error) {
        console.error('Error initializing app data: ' + error.message);
        throw error;
    }

    try {
        app = createExpressApp();
    } catch (error) {
        console.error('Error creating express app: ' + error.message);
        throw error;
    }

    console.log('Finish app.js init');
    return app;

});
