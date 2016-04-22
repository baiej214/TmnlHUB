'use strict';

const net = require('net');
const fs = require('fs');
const debug = require('debug')('Socket:');
const Server = require('./TCPServer');
const BuffPool = require('./BuffPool');
const stream = require('stream');

/*
TODO
用Server的静态方法操作socketList
*/

function onClose(had_error) {
    Server.listRemove(this);
    if (!had_error) debug(`[ ${getAddr(this)} ]已断连接（0）`);
}

function onConnect() {
    debug('fuck');
}

/**
 * 当收到报文后，将报文
 * @param data
 * // 登录 68 49 00 49 00 68 c9 01 35 01 00 00 02 f5 00 00 01 00 05 56 32 15 22 00 bc 16
 */
function onData(data) {
}

function onDrain() {
    console.log('onDrain');
}

function onEnd() {
}

function onError(error) {
    switch (error.code) {
        case 'ECONNRESET':
            debug(`[ ${getAddr(this)} ]已断连接（ECONNRESET）`);
            this.close();
            break;
        default:
            debug(error.stack);
    }
}

function onLookup() {
    console.log('onLookup');
}

function onTimeout() {
    this.destroy();
}

function getAddr(socket) {
    let addr = '未知';
    if (socket.A1 && socket.A2) addr = socket.A1 + '#' + socket.A2;
    return addr;
}

function ClientExtend(socket) {
    socket.A1 = undefined;//行政区划码
    socket.A2 = undefined;//通讯地址
    socket.setTimeout(0);//通讯超时时间
    socket.buffPool = new BuffPool(socket);
    socket.close = socket.destroy;
    socket
        .on('close', onClose)
        .on('connect', onConnect)
        .on('data', onData)
        .on('drain', onDrain)
        .on('end', onEnd)
        .on('error', onError)
        .on('lookup', onLookup)
        .on('timeout', onTimeout)
        .pipe(socket.buffPool)
        .pipe(socket);
    return socket;
}

module.exports = ClientExtend;