'use strict';

const path = require('path');
const stream = require('stream');
const Pact = require('../pact/2013-376.1');

const SIZEWITHOUTL1 = Pact.buffLength();

class BuffPool extends stream.Transform {
    constructor(Client) {
        super();
        this._client = Client;
        this._first = true;
        this.buff = new Buffer(0);
    }

    //清除缓存
    clearPool(buff = new Buffer(0)) {
        this.buff = buff;
    }

    //编辑缓冲
    editPool(chunk) {
        //TODO 是不是应该逐个字符的检查？？？
        console.log(this.buff.length, SIZEWITHOUTL1);
        if (Pact.verifyFrame(chunk)) {
            this.push(chunk);
            this.clearPool();
        } else {
            if (this.buff.length !== 0 && Pact.verifyHead(this.buff) === false)
                this.clearPool();

            let b4Len = this.buff.length;//concat之前的长度
            this.buff = Buffer.concat([this.buff, chunk]);
            if (Pact.verifyFrame(this.buff)) {
                this.push(this.buff);
                this.clearPool();
            } else {
                let len = Pact.getL1(this.buff) + SIZEWITHOUTL1;
                if (this.buff.length >= len) {
                    let tmpBuff = this.buff.slice(0, len);
                    if (Pact.verifyFrame(tmpBuff)) {
                        this.buff.copy(tmpBuff, 0, 0, len);
                        this.push(tmpBuff);
                        this.clearPool();
                    } else {
                        this.clearPool(this.buff.slice(len));
                    }
                } else {
                    // this.buff.length < len
                    // 继续等Buffer.concat
                }
                console.log('------------------------');
            }
        }
    }

    _transform(chunk, encoding, next) {
        if (this._first) {
            //首次接收报文，从报文里拿行政区划码和终端地址
            if (Pact.verifyFrame(chunk)) {
                this._client.A1 = Pact.getA1(chunk);
                this._client.A2 = Pact.getA2(chunk);
                this.editPool(chunk);
                this._first = false;
            } else {
                this._client.close();
            }
        } else {
            this.editPool(chunk);
        }
        next();
    }

    _flush(next) {
        //let a = 1;
        //next();
    }
}

module.exports = BuffPool;