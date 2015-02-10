var mysql = require('mysql'),
    _ = require('underscore'),
    config = require('./config').config;

var connection = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
        dateStrings: false,
        debug: ['ComQueryPacket']
    }),

    poolConn = mysql.createPool({
        connectionLimit: 10,
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
        dateStrings: false,
        debug: ['ComQueryPacket']
    });

exports.pool = poolConn;