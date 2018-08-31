const _ = require('lodash');
const {paths, columnNames} = require(`${__dirname}/../conf/constants`);
const {getSymbolList} = require(paths.src.utils);
const {getQuote, getChart} = require(paths.src.stockApis);

function averageClosePrice(entriesInRange) {
    if (!_.isArray(entriesInRange) || _.isEmpty(entriesInRange)) {
        console.log('noEntries');
        return 0;
    }
    return _.reduce(entriesInRange, (sum, entry) => sum += entry.close,0.0) / entriesInRange.length;
}

async function updateStockData(stockDataStore) {
    let symbols = getSymbolList(stockDataStore.stockData);
    let quotes = await getQuote(...symbols);
    let charts = await getChart(...symbols);
    stockDataStore.fillCurrentPrices(quotes, stockDataStore.stockData);
    stockDataStore.fillAvgPriceForRange(charts, stockDataStore.stockData);
    calculateDeltas(stockDataStore.stockData);
    //await stockDataStore.writeStockDataToFile();
    return stockDataStore.stockData;
}

function calculateDeltas(
    stockData,
    columnOneName = columnNames.avgPrice,
    columnTwoName = columnNames.currentPrice
) {
    _.map(stockData, (current) => {
        current[columnNames.avgCurrentDelta] =
            (current[columnNames.currentPrice] - current[columnNames.avgPrice]).toFixed(2);
        current[columnNames.avgCurrentDeltaPercent] =
            ((current[columnNames.avgCurrentDelta]/current[columnNames.avgPrice]) * 100).toFixed(2);
        return current;
    }, []);
}

module.exports = {
    calculateDeltas,
    updateStockData,
    averageClosePrice
}
