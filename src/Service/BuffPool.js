'use strict';

const path = require('path');
const stream = require('stream');
const Pact = require('../../pact/2013-376.1');

class BuffPool extends stream.Transform {
    constructor(Client) {
        super();
        this._client = Client;
        this._first = true;
        this.buffArr = [];
    }

    _transform(chunk, encoding, next) {
        this.buffArr.push(chunk);
        if (this._first) {
            this._client.A1 = Pact.getA1(chunk);
            this._client.A2 = Pact.getA2(chunk);
            this._first = false;
            this._client.emit('named');
        }
        // ***********************************************************

        if (Pact.getDIR(chunk) === 1 && Pact.getPRM(chunk) === 0) {// 设备端发出的响应报文
            // 先找到对应的请求报文
        } else if (Pact.getDIR(chunk) === 1 && Pact.getPRM(chunk) === 1) {// 设备端发出的请求报文
            // 是否需要返回确认
            if (Pact.getCON(chunk)) {
                // 先查看chunk能否解析，如果不能，直接返回否认报文
            } else {
            }

        } else {
            // 这里不接收浏览器端发送的主站请求，所以不会出现这种可能
        }
        // ***********************************************************

        this.push(chunk);
        next();
    }

    _flush(next) {
        // 当连接断开或者客户端发送FIN包的时候会执行这个方法，并触发finish事件
        next();
    }
}

module.exports = BuffPool;