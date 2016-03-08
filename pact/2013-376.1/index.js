'use strict';

const tools = require('./tools');

class Pact {
    constructor() {
    }

    //验证报文合法性
    static verifyFrame(frame) {
        return tools.verifyFrame(frame);
    }

    static verifyLength(frame) {
        return tools.verifyLength(frame);
    }

    static verifyCS(frame) {
        return tools.verifyCS(frame);
    }
}

module.exports = Pact;