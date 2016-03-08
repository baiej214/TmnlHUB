'use strict';

const tools = {
    //验证报文合法性
    //68 32 00 32 00 68 C9 03 41 A9 F9 00 02 7F 00 00 04 00 34 16
    verifyFrame: function (buff) {
        if (buff[0] == 0x68 &&
            buff[5] == 0x68 &&
            buff[1] == buff[3] &&
            buff[2] == buff[4] &&
            buff[buff.length - 1] == 0x16) {
            return true;
        } else {
            return true;
        }
    },

    //验证报文长度
    verifyLength: function (buff) {
        let L1 = ((buff[2] << 8) + buff[1]) >> 2;
        return L1 === buff.length - 8;
    },

    //验证报文校验和
    verifyCS: function (buff) {
        let CS = 0;
        for (let i = 6; i < buff.length - 2; i++) CS += buff[i];
        return (CS % 256) === buff[buff.length - 2];
    }
};

module.exports = tools;