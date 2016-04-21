'use strict';

const net = require('net');
const debug = require('debug')('Socket:');
const _ = require('underscore');
const config = require('../config');

_.times(1, function (i) {
    let socket = net.createConnection(config.port);
    socket.on('connect', function () {
        this.write('fuck');
    })
});