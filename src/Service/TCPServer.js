'use strict';

const net = require('net');
const debug = require('debug')('TCPServer:');
const log4js = require('log4js');
const logger = log4js.getLogger();
const _ = require('underscore');
const TCPClient = require('./TCPClient');
const config = require('../../config');

let socketList = {};
let server = new net.Server();

//监听Server关闭
function serverOnClose(had_error) {
    socketList = undefined;
    throw 'had_error' + had_error;
}

//监听socket连接Server
function serverOnConnection(socket) {
    let client = TCPClient(socket);
    socket.on('named', () => listAppend(client));
}

//监听Server报错
function serverOnError(error) {
    debug(error)
}

//监听Server启动
function serverOnListening() {
    socketList = {};
    let addr = this.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

//返回socketList的总长度
function listConut() {
    return _.size(socketList);
}

//返回socketList映射数组
function listMap() {
    return _.map(socketList, (item, index) => {
        return index;
    });
}

//临时测试用
function list() {
    return socketList;
}

//socketList新增socket
function listAppend(socket) {
    try {
        let name = socket.A1 + ':' + socket.A2;
        socketList[name] = socket;
        server.emit('server::append', socket);
    } catch (error) {
        throw error;
    }
}

//删除对应的socketList
function listRemove(socket) {
    try {
        let name = socket.remoteAddress + ':' + socket.remotePort;
        delete socketList[name];
        server.emit('server::remove', socket);
    } catch (error) {
        throw error;
    }
}

//启动TCPServer
function start(port, e) {
    server.listen(port, e);
}

server.on('close', serverOnClose)
    .on('connection', serverOnConnection)
    .on('error', serverOnError)
    .on('listening', serverOnListening)
    .on('server::append', (socket) => {
        debug(`Socket [${socket.A1}#${socket.A2}] connected.`);
    })
    .on('server::remove', (socket) => {
        debug(`Socket [${socket.A1}#${socket.A2}] removed.`);
    });

exports.listen = start;
exports.listConut = listConut;
exports.listMap = listMap;
exports.listAppend = listAppend;
exports.listRemove = listRemove;