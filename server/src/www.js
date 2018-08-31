const _ = require('lodash');
const http = require('http');
const {defaultWebserverConfig} = require('./conf/constants');

// Normalize a port into a number, string, or false.
// @returns {Number|String|Boolean} Normalized port as a string (named pipe), number
//   (port), or `false` (invalid/unknown).
function normalizePort(val) {
    let normPort = parseInt(val, 10);
    if (isNaN(normPort)) {
        // named pipe
        return val;
    } else if (normPort >= 0) {
        // port number
        return normPort;
    }
    return false;
}

function getOnListeningHandler(server, resolve) {
    // Event listener for HTTP server 'listening' event.
    return function onListening() {
        try {
            let addr = server.address();
            let bind = _.isString(addr) ? ('pipe ' + addr) : ('port ' + addr.port);
            console.log('listening on ' + bind);
        } finally {
            resolve();
        }
    };
}

function getOnErrorHandler(port, reject) {
    // Event listener for HTTP server 'error' event.
    // @param {Node/http.error} error
    return function onError(error) {
        try {
            let bind = _.isString(port) ? ('pipe ' + port) : ('port ' + port);

            if (error.syscall !== 'listen') {
                console.error('onError caught an exception not from \'listen\' call; rethrowing', {
                    error
                });
                throw error;
            }

            // handle specific listen errors with friendly messages
            switch (error.code) {
            case 'EACCES':
                console.error(bind + ' Permission denied or requires elevated previleges');
                break;

            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                break;

            case 'EPERM':
                console.error(bind + ' requires elevated privileges');
                break;

            case 'ETIMEDOUT':
                console.error(bind + ' Operation timed out');
                break;

            default:
                console.error('Unhandled error event!', {error});
                throw error;
            }
        } finally {
            reject(error)
        }
    };
}

async function createAndStartServer(app, options) {
    return new Promise((resolve, reject) => {
        try {
            let serverPort = normalizePort(options.port);
            app.set('port', serverPort);
            // {Node/http}
            let server = http.createServer(app);

            // listen on provided port localhost only
            server.listen(serverPort, options.bindAddress);
            server.on('error', getOnErrorHandler(serverPort, reject));
            server.on('listening', getOnListeningHandler(server, resolve));
        } catch (error) {
            reject(error);
        }
    }).catch((error) => {
        throw error;
    });
}

module.exports = (async function serverInit(app, options = {}) {
    //Merge defaults with provided options
    options = {
        ...defaultWebserverConfig,
        ...options
    };
    try {
        console.log('Start www.js : create server and listen on port');
        await createAndStartServer(app, options);
        console.log('Finish www.js : server is created and listening');
    } catch (error) {
        console.error('Error in www.js init')
        throw error;
    }
});
