'use strict';

const Server = require('./src/TCPServer');
const TCPClient = require('./src/TCPClient');
const WebService = require('./src/WebService');

const config = require('./config');

let server = new Server();
server.listen(config.tmnlPort);
WebService.listen(config.webPort);