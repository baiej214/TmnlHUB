'use strict';

const fs = require('fs');
const thunkify = require('thunkify');

const readfile = thunkify(fs.readFile);

function signIn(next) {
    this.type = 'text/html';
    this.body = yield readfile('src/web/html/signIn.html');
    //yield next;
}
module.exports = signIn;