'use strict';

const path = require('path');
const stream = require('stream');
const Pact = require('../pact/2013-376.1');

/**
 * 验证报文合法性
 * 循环多种协议，使用统一验证接口验证报文的合法性
 * @param frame
 * @returns {boolean}
 */
function verifyFrame(frame) {
    return Pact.verifyFrame(frame);
}

class BuffPool extends stream.Transform {
    constructor(Client) {
        super();
        this._client = Client;
        this.buff = new Buffer(0);
    }

    _transform(chunk, encoding, next) {
        if (verifyFrame(chunk)) {
            if (!this._client.A1 && !this._client.A2) {
                this._client.A1 = Pact.getA1(chunk);
                this._client.A2 = Pact.getA2(chunk);
            }
            this.push(chunk);
            this.buff = new Buffer(0);
        } else {
            this.buff = Buffer.concat([this.buff, chunk]);
            if (verifyFrame(this.buff)) {
                this.push(this.buff);
                this.buff = new Buffer(0);
            } else {
                console.log('false');
            }
        }
        next();
    }
}

module.exports = BuffPool;