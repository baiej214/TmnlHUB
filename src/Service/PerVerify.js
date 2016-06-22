'use strict';

const stream = require('stream');
const Pact = require('../../pact/2013-376.1');

const SIZEWITHOUTL1 = Pact.buffLength();
const HEADLENGTH = 6;// Pact.headLength();

/**
 * 验证报文是否合法
 */
class PerVerify extends stream.Transform {
    constructor(Client) {
        super();
        this.buff = new Buffer(0);
    }

    //清除缓存
    clearPool(buff = new Buffer(0)) {
        this.buff = buff;
    }

    editPool() {
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

    _transform(chunk, encoding, next) {
        this.buff = Buffer.concat([this.buff, chunk]);
        this.editPool();
        next();
    }
}

module.exports = PerVerify;