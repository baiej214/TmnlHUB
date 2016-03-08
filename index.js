'use strict';

const Server = require('./src/TCPServer');
const TCPClient = require('./src/TCPClient');

let server = new Server();
server.listen(1234);