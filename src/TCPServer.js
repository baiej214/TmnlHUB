'use strict';

const net = require('net');
const _ = require('underscore');
const TCPClient = require('./TCPClient');
const config = require('../config');

let socketList = {};

function serverOnClose(had_error) {
    socketList = undefined;
    throw 'had_error' + had_error;
}

function serverOnConnection(socket) {
    Server.listAppend(TCPClient(socket));
}

function serverOnError(error) {
    throw error;
}

function serverOnListening() {
    socketList = {};
}

class Server extends net.Server {

    constructor() {
        super();

        this.on('close', serverOnClose)
            .on('connection', serverOnConnection)
            .on('error', serverOnError)
            .on('listening', serverOnListening);
    }

    listen(port) {
        return super.listen(port);
    }

//static

    //返回socketList的总长度
    static listConut() {
        return _.size(socketList);
    }

    //返回socketList映射数组
    static listMap() {
        return _.map(socketList, (item, index)=> {
            return index;
        });
    }

    //临时测试用
    static list() {
        return socketList;
    }

    //socketList新增socket
    static listAppend(socket) {
        try {
            let name = socket.remoteAddress + ':' + socket.remotePort;
            socketList[name] = socket;
        } catch (error) {
            throw error;
        }
    }

    //删除对应的socketList
    static listRemove(socket) {
        try {
            let name = socket.remoteAddress + ':' + socket.remotePort;
            delete socketList[name];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Server;
exports.listConut = Server.listConut;
exports.listMap = Server.listMap;
exports.listAppend = Server.listAppend;
exports.listRemove = Server.listRemove;