const _ = require('lodash');
const request = require('request-promise-native');
const {paths, stockApiRoot} = require(`${__dirname}/../conf/constants`);

getSingleQuoteApi = (symbol) =>
    `${stockApiRoot}/stock/${symbol}/quote`;
getBatchQuoteApi = (symbols) =>
    `${stockApiRoot}/stock/market/batch/?types=quote&symbols=${_.join(symbols, ',')}`;
getSingleChartApi = (symbol) => `${stockApiRoot}/stock/${symbol}/chart`;
getBatchChartApi = (symbols) =>
    `${stockApiRoot}/stock/market/batch/?types=chart&symbols=${_.join(symbols, ',')}&range=1m`;

async function getQuote(...symbols) {
    try {
        if(symbols.length === 0) {
            throw new Error('No symbol(s) provided to getQuote()')
        }

        let requestString;
        if(symbols.length === 1) {
            requestString = getSingleQuoteApi(symbols[0]);
        } else {
            requestString = getBatchQuoteApi(symbols);
        }

        console.log(`Requesting: ${requestString}`)
        let requestResult = await request(requestString);
        return JSON.parse(requestResult);
    } catch(error) {
        console.error('Error in getQuote()');
        throw error;
    }
}

async function getChart(...symbols) {
    try {
        if(symbols.length === 0) {
            throw new Error('No symbol(s) provided to getChart()')
        }

        let requestString;
        if(symbols.length === 1) {
            requestString = getSingleChartApi(symbols[0]);
        } else {
            requestString = getBatchChartApi(symbols);
        }

        let requestResult = await request(requestString);
        return JSON.parse(requestResult);
    } catch(error) {
        console.error('Error in getChart()');
        throw error;
    }
}

async function checkSymbolExists(symbol) {
    console.log(`Start checkSymbolExists(${symbol})`)
    try {
        let result = await getQuote(symbol);
        return true;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getQuote,
    getChart,
    checkSymbolExists
}
