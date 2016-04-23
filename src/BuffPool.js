'use strict';

const path = require('path');
const stream = require('stream');
const Pact = require('../pact/2013-376.1');

const SIZEWITHOUTL1 = Pact.buffLength();
const HEADLENGTH = 6;// Pact.headLength();

class BuffPool extends stream.Transform {
    constructor(Client) {
        super();
        this._client = Client;
        this._first = false;// true
        this.buff = new Buffer(0);
        this.buffArray = [];
    }

    //清除缓存
    clearPool(buff = new Buffer(0)) {
        this.buff = buff;
    }

    test() {
        let sliceIndex = this.buff.length;// 划分的位置
        for (let i = 0; i < this.buff.length; i++) {
            if (this.buff[i] === 0x68) {// 找到第一个68
                let head = this.buff.slice(i, i + HEADLENGTH);// 取固定长度的报文头
                if (Pact.verifyHead(head)) {
                    let L1 = Pact.getL1(head);
                    let len = L1 + SIZEWITHOUTL1;
                    let buff = this.buff.slice(i, i + len);
                    if (Pact.verifyFrame(buff)) {// 如果报文整体通过验证，则push，并buff之前的全部划分掉
                        //TODO 直接push，或者执行其他操作（this.buffArray？？？），buff到这里基本可以判断为无误
                        this.push(buff);
                        sliceIndex = i + len;
                        i += len - 1;// 强制指定i的值
                    } else if (i + len > this.buff.length) {
                        // 报文不完整，长度不够，直接退出循环，等待下次执行，划分位置指定为0x68前一个字符
                        sliceIndex = i;
                        break;
                    } else {
                        // 报文错误
                    }
                } else if (i + HEADLENGTH >= this.buff.length) {
                    // 报文不够长，可能是断帧，头部不完整，直接退出循环，等待下次执行，划分位置指定为0x68前一个字符
                    sliceIndex = i;
                    break;
                } else {
                    // 错误的报文头
                }
            }
        }
        this.clearPool(this.buff.slice(sliceIndex));
    }

    //编辑缓冲
    editPool(chunk) {
        // TODO 是不是应该逐个字符的检查？？？
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
        /*
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
        */
        this.buff = Buffer.concat([this.buff, chunk]);
        this.test();
        next();
    }

    _flush(next) {
        //let a = 1;
        //next();
    }
}

module.exports = BuffPool;