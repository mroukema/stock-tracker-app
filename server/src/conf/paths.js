const path = require('path');

const appRootDir = path.normalize(`${__dirname}/../../..`);
const serverRootDir = `${appRootDir}/server`
const clientDir = `${appRootDir}/client`;
const srcRootDir = `${serverRootDir}/src`;
const confDir = `${srcRootDir}/conf`;
const resourcesDir = `${appRootDir}/resources`;
const servicesDir = `${srcRootDir}/services`;
const routesDir = `${srcRootDir}/routes`

const directories = {
    client: clientDir,
    conf: confDir,
    resources: resourcesDir,
    routes: routesDir,
    serverRoot: serverRootDir,
    services: servicesDir,
    srcRoot: srcRootDir
};

const src = {
    app: `${directories.srcRoot}/app`,
    calculations: `${directories.services}/calculations`,
    constants: `${directories.conf}/constants`,
    index: `${directories.srcRoot}/index`,
    main: `${directories.serverRoot}/main`,
    paths: `${directories.conf}/paths`,
    routes: `${directories.routes}/routes`,
    stockApis: `${directories.services}/stockApis`,
    stockData: `${directories.services}/stockData`,
    stockTracker: `${directories.services}/stockApis`,
    utils: `${directories.services}/utils`,
    www: `${directories.srcRoot}/www`
};

const stockDataFile = `${directories.resources}/stockData.csv`;
const resources = {
    stocksCsv: stockDataFile,
    destinationCsv: stockDataFile
};

const paths = {
    src,
    directories,
    resources
};

module.exports = paths;
