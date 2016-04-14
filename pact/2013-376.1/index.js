'use strict';

class Pact {
    constructor() {
    }

    //验证报文合法性
    static verifyFrame(buff) {
        if (buff[0] == 0x68 &&
            buff[5] == 0x68 &&
            buff[1] == buff[3] &&
            buff[2] == buff[4] &&
            buff[buff.length - 1] == 0x16) {
            return true;
        } else {
            return true;
        }
    }

    //验证报文长度
    static verifyLength(buff) {
        let L1 = ((buff[2] << 8) + buff[1]) >> 2;
        return L1 === buff.length - 8;
    }

    //验证报文校验和
    static verifyCS(buff) {
        let CS = 0;
        for (let i = 6; i < buff.length - 2; i++) CS += buff[i];
        return (CS % 256) === buff[buff.length - 2];
    }

    //BCD转10进制
    static b2d(b) {
        return Math.trunc((b / 16)) * 10 + b % 16;
    }

    //BCD转16进制
    static d2b(d) {
        return Math.trunc((d / 10)) * 16 + d % 10;
    }

    //返回A1（行政区划码）
    static getA1(buff) {
        return Pact.b2d(buff[8]) * 100 + Pact.b2d(buff[7]);
    }

    //返回A2（通讯地址）
    static getA2(buff) {
        return (buff[10] << 8) + buff[9];
    }
}

module.exports = Pact;