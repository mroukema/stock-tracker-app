const paths = require('./paths');

const port = 8787;
const constants = {
    paths,
    port,
    stockApiRoot: 'https://api.iextrading.com/1.0',
    columnNames: {
        symbol: 'Symbol',
        currentPrice: 'Price Today',
        avgPrice: 'Avg Price (July 30 2018 - Aug 10 2018)',
        avgCurrentDelta: 'Delta #',
        avgCurrentDeltaPercent: 'Delta %',
        buyPrice: 'Buy Price',
        quantity: 'Qty',
        currentValue: 'Current Value',
        purchaseTimeValue: 'Value at Purchase Time'
    },
    loggingOptions: {
        type: 'condensed'
    },
    defaultWebserverConfig: {
        port,
        bindAddress: undefined
    }
};

module.exports = constants;
