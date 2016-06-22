'use strict';
const thunkify = require('thunkify');

const TIMEOUT = 1000;

function timeout(ms = TIMEOUT, next) {
    return setTimeout(() => {
        return next.call(null, null, {message: 'timeout'});
    }, ms);
}

function webReq() {
    let timer = yield thunkify(timeout)(TIMEOUT * 5);
}