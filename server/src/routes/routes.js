const _ = require('lodash');
const express = require('express');
const {paths} = require(`${__dirname}/../conf/constants`);
const {updateStockData} = require(paths.src.calculations);
const stockDataStore = require(paths.src.stockData);
const {convertToFrontendStockDataStructure} = require(paths.src.utils);
const {checkSymbolExists} = require(paths.src.stockApis);

/**
 * Express router to mount user related functions on.
 * @type {Object}
 * @namespace gatewayServiceRouter
 */
let router = express.Router({ // eslint-disable-line new-cap
    // '/Foo' different from '/foo'
    caseSensitive: true,
    // '/foo' and '/foo/' treated the same
    strict: false
});

async function updateStockDataRoute(req, res, next) {
    try {
        let stockData = await updateStockData(stockDataStore);
        stockData = convertToFrontendStockDataStructure(stockData);
        res.json(stockData);
    } catch (error) {
        next(error);
    }
    next();
}

async function addNewTicker(req, res, next) {
    try {
        if (_.isUndefined(req.body) ||  !_.isString(req.body.symbol) || _.isEmpty(req.body.symbol)) {
            console.error('req.body');
            console.error(req.body);
            throw new Error(`addNewTicker() requires a request body with property 'symbol'`);
        }
        let symbol = _.toUpper(req.body.symbol);
        try {
            await checkSymbolExists(symbol);
        } catch (error) {
            error.message = `Invalid Symbol '${symbol}'`;
            throw error;
        }

        let stockData = await stockDataStore.addNewTicker(symbol);
        stockData = convertToFrontendStockDataStructure(stockData);
        res.json(stockData);
    } catch (error) {
        next(error);
    }
}

async function deleteTicker(req, res, next) {
    try {
        if (_.isUndefined(req.body) ||  !_.isString(req.body.symbol) || _.isEmpty(req.body.symbol)) {
            console.error('req.body');
            console.error(req.body);
            throw new Error(`deleteTicker() requires a request body with property 'symbol'`);
        }
        let symbol = _.toUpper(req.body.symbol);
        let stockData = stockDataStore.deleteTicker(symbol);
        stockData = convertToFrontendStockDataStructure(stockDataStore.stockData);
        res.json(stockData);
    } catch (error) {
        next(error);
    }
}

router.get('/stockList', updateStockDataRoute);
router.post('/newTicker', addNewTicker);
router.delete('/deleteTicker', deleteTicker)

module.exports = router;
