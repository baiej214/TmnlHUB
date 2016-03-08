'use strict';

const net = require('net');
const fs = require('fs');
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
    Server.listAppend(this);
}

/**
 * 当收到报文后，将报文
 * @param data
 */
function onData(data) {
    this.write('fuck');
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

class Client {
    constructor(socket) {
        socket.wrap = this;
        this.socket = socket;

        this.socket.setTimeout(0);
        this.socket.on('close', onClose)
            .on('connect', onConnect)
            .on('data', onData)
            .on('drain', onDrain)
            .on('end', onEnd)
            .on('error', onError)
            .on('lookup', onLookup)
            .on('timeout', onTimeout);

        this.socket
            .pipe(new BuffPool())
            .pipe(this.socket);
    }
}

module.exports = Client;