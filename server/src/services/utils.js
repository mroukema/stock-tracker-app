const _ = require('lodash');
const {columnNames} = require(`${__dirname}/../conf/constants`)

function convertToFloat(value) {
    try {
        if (_.isNumber(value)) {
            return value;
        }
        return parseFloat(value);
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

function convertToFrontendStockDataStructure(stockData) {
    return _.map(stockData, (entry) => ({
        symbol: entry[columnNames.symbol],
        price: convertToFloat(entry[columnNames.currentPrice]),
        average: convertToFloat(entry[columnNames.avgPrice]),
        delta: convertToFloat(entry[columnNames.avgCurrentDelta]),
        deltaPercent: convertToFloat(entry[columnNames.avgCurrentDeltaPercent])
    }));
}

function getSymbolList(stocksArray) {
    let result = _.map(stocksArray, columnNames.symbol);
    return result;
}

function pushAndReturn(array, newValue) {
    if(!_.isArray(array)) {
        throw new Error('First argument to pushAndReturn must been an array.');
    }
    array.push(newValue);
    return array;
}

module.exports = {
    pushAndReturn,
    getSymbolList,
    convertToFrontendStockDataStructure
}
