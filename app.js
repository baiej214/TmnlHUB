'use strict';

const debug = require('debug')('WebService:');
const config = require('./config');

if (!global.TCPServer) global.TCPServer = require('./src/TCPServer');
if (!global.WebService) global.WebService = require('./src/WebService');

function onListening() {
    let addr = this.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

let app = {};
app.start = function () {
    TCPServer.listen(config.tmnlPort);
    WebService.listen(config.webPort, onListening);
};


module.exports = app;