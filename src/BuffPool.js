'use strict';

const path = require('path');
const stream = require('stream');
const pacts = require('../config').pacts;

/**
 * 验证报文合法性
 * 循环多种协议，使用统一验证接口验证报文的合法性
 * @param frame
 * @returns {boolean}
 */
function verifyFrame(frame) {
    for (let pactPath of pacts) {
        try {
            let pact = require(path.resolve(pactPath));
            if (pact.verifyFrame(frame) == true) {
                return true;
            }
        } catch (error) {
            throw error;
        }
    }
    return false;
}

class BuffPool extends stream.Transform {
    constructor() {
        super();
        this.buff = new Buffer(0);
    }

    _transform(chunk, encoding, next) {
        this.buff = Buffer.concat([this.buff, chunk]);
        if (verifyFrame(this.buff)) {
            this.push(this.buff);
            this.buff = new Buffer(0);
        } else {
            console.log('false');
        }
        next();
    }
}

module.exports = BuffPool;