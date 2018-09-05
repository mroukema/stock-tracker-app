const _ = require('lodash');
const fs = require('fs');
const csv = require('csv');
const csvParser = csv.parse({columns: true});
const generate = require('csv-generate');
const stringify = require('csv-stringify');

const {paths, columnNames} = require(`${__dirname}/../conf/constants`);
const {averageClosePrice, updateStockData} = require(paths.src.calculations);
const {getQuote, getChart} = require(paths.src.stockApis);

let _stockData;

function initStockData(csvFile = paths.resources.stocksCsv) {
    try {
        let result = [];
        let readStream = fs.createReadStream(csvFile);
        return new Promise((resolve, reject) => {
            readStream
                .pipe(csvParser)
                .on('data', (data) => {
                    result.push(data);
                })
                .on('end', () => {
                    _stockData = result
                    resolve(_stockData);
                })
                .on('error', (error) => {
                    console.error('Error in cvs parser');
                    reject(error);
                });
        }).catch((error) => {
            throw error;
        });
    } catch (error) {
        console.error('Error in initStockData()');
        throw error;
    }
}

function fillCurrentPrices(quotes, stockData = _stockData) {
    _stockData = _.map(stockData, (value, key) => {
        let symbol = value[columnNames.symbol];
        let latestPrice = _.at(quotes, `${symbol}.quote.latestPrice`);
        if(_.isArray(latestPrice) && !_.isEmpty(latestPrice)) {
            value[columnNames.currentPrice] = latestPrice[0];
        }
        return value;
    });
}

function promiseStringify(stockData, options, callback) {
    return new Promise((resolve, reject) => {
        try {
            stringify(stockData, options, (...args) => {
                callback(...args);
                resolve();
            })
        } catch (error) {
            reject(error);
        }
    }).catch((error) => {
        throw error;
    })

}

async function writeStockDataToFile(
    stockData = _stockData,
    filepath = paths.resources.destinationCsv
) {
    if(!_.isArray(stockData) || stockData.length <= 0) {
        console.error('Not writing anything');
        return;
    }
    let columns = _.keys(stockData[0]);
    let numberOfColumns = columns.length;
    let generator = generate({
        objectMode: true,
        headers: numberOfColumns
    });
    await promiseStringify(stockData, { header: true, columns: columns }, (error, result) => {
        if (error) throw error;
        fs.writeFileSync(filepath, result);
    });
}

async function addNewTicker(newSymbol) {
    try {
        let existingEntry = _.find(_stockData, (entry) => entry[columnNames.symbol] === newSymbol)
        if (_.isUndefined(existingEntry)) {
            _stockData.push({[columnNames.symbol]: newSymbol})
        }
        return await updateStockData(def);
    } catch (error) {
        console.error('Error in addNewTicker()')
        throw error;
    }
}

async function deleteTicker(symbol) {
    try {
        symbol = _.toUpper(symbol)
        let removed =
            _.remove(_stockData, (entry) => symbol === _.toUpper(entry[columnNames.symbol]));

        if (removed.length < 1) {
            throw new Error(`Failed to delete symbol ${symbol}; could not find symbol in stock list`);
        }
        return _stockData;
    } catch (error) {
        throw error;
    }
}

let def = {
    get stockData() {
        return _stockData;
    },
    initStockData,
    fillCurrentPrices,
    writeStockDataToFile,
    addNewTicker,
    deleteTicker
};
module.exports = def;
