const {paths} = require('./src/conf/constants.js')
const {startStockApp} = require(paths.src.index);

(async function main() {
    console.log('Start main()');
    await startStockApp();
    console.log('End main()');
})();
