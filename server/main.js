const {paths} = require('./src/conf/constants.js')
const {startStockApp} = require(paths.src.index);

(async function main() {
    console.group('--- Start main() ---')
    await startStockApp();
    console.groupEnd();
    console.log('--- End main() ---\n');
})();
