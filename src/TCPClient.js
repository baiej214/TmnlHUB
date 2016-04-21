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
}

function onConnect() {
}

/**
 * 当收到报文后，将报文
 * @param data
 */
function onData(data) {
    debug(data);
}

function onDrain() {
    console.log('onDrain');
}

function onEnd() {
}

function onError(error) {
    console.error(error);
}

function onLookup() {
    console.log('onLookup');
}

function onTimeout() {
    this.destroy();
}

function ClientExtend(socket) {
    socket.A1 = undefined;//行政区划码
    socket.A2 = undefined;//通讯地址
    socket.setTimeout(0);//通讯超时时间
    socket
        .on('close', onClose)
        .on('connect', onConnect)
        .on('data', onData)
        .on('drain', onDrain)
        .on('end', onEnd)
        .on('error', onError)
        .on('lookup', onLookup)
        .on('timeout', onTimeout)
        .pipe(new BuffPool(socket))
        .pipe(socket);
    return socket;
}

module.exports = ClientExtend;