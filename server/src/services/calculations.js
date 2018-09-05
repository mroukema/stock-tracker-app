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
    calulatePurchasedValues(stockDataStore.stockData);
    calulateCurrentValues(stockDataStore.stockData);
    //fillAvgPriceForRange(charts, stockDataStore.stockData);
    calculateDeltas(stockDataStore.stockData);
    //await stockDataStore.writeStockDataToFile();
    return stockDataStore.stockData;
}

function calculateStockEntryPurchaseValue(value) {
    try {
        let purchasePrice = value[columnNames.purchasePrice];
        let purchasedQuantity = value[columnNames.quantity];

        if (_.isString(purchasePrice)) {
            purchasePrice = parseFloat(purchasePrice);
        }

        if (_.isString(purchasedQuantity)) {
            purchasedQuantity = parseFloat(purchasedQuantity);
        }

        if (_.isNumber(purchasePrice) &&
            _.isNumber(purchasedQuantity)) {

            value[columnNames.purchasedValue] = (purchasePrice * purchasedQuantity).toFixed(2);
        }
        return value;
    } catch (error) {
        throw error;
    }
}

function calculateStockEntryCurrentValue(value) {
    try {
        let currentPrice = value[columnNames.currentPrice];
        let purchasedQuantity = value[columnNames.quantity];
        if (_.isString(currentPrice)) {
            currentPrice = parseFloat(currentPrice);
        }

        if (_.isString(purchasedQuantity)) {
            purchasedQuantity = parseFloat(purchasedQuantity);
        }

        if (_.isNumber(currentPrice) &&
            _.isNumber(purchasedQuantity)) {

            value[columnNames.currentValue] = (currentPrice * purchasedQuantity).toFixed(2);
            //console.log(`${value['Symbol']}: ${value[columnNames.currentValue]} = ${currentPrice * purchasedQuantity} = ${currentPrice} * ${purchasedQuantity}`)
        }
        return value;
    } catch (error) {
        throw error;
    }

}

function calulatePurchasedValues(stockData) {
    return _.map(stockData, calculateStockEntryPurchaseValue);
}

function calulateCurrentValues(stockData) {
    return _.map(stockData, calculateStockEntryCurrentValue);
}

function findInDateRange(startDate, endDate, rangeData, stockData) {
    if(!(startDate instanceof Date)) {
        startDate = new Date(startDate);
    }
    if(!(endDate instanceof Date)) {
        endDate = new Date(endDate);
    }

    if(endDate.valueOf() < startDate.valueOf()) {
        let temp = endDate;
        endDate = startDate;
        startDate = temp;
    }

    let entriesInRange = _.filter(rangeData, (data) => {
        let entryDate = new Date(data.date);
        return (entryDate.valueOf() >= startDate.valueOf()) &&
            (entryDate.valueOf() <= endDate.valueOf());
    });

    return entriesInRange;
}

function fillAvgPriceForRange(charts, stockData) {
    stockData = _.map(stockData, (value, key) => {
        let symbol = value[columnNames.symbol];
        let rangeData = _.at(charts, `${symbol}.chart`);

        let currentAveragePrice = value[columnNames.avgPrice];
        if(!_.isUndefined(currentAveragePrice && currentAveragePrice != 0)) {
            return value;
        } else if (_.isUndefined(rangeData) || _.isEmpty(rangeData)) {
            console.log('No range data');
            return value;
        }

        rangeData = rangeData[0];
        let entriesInRange = findInDateRange(
            new Date('July 30 2018'),
            new Date('Aug 10 2018'),
            rangeData,
            value
        );
        let averagePrice = averageClosePrice(entriesInRange);
        if(_.isNumber(averagePrice)) {
            value[columnNames.avgPrice] = averagePrice.toFixed(2);
        }
        return value;
    });
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
