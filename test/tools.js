var tools = require('../tools').tools;

var buff = new Buffer([0,0]);
buff.writeUInt16LE('1034', 0);
console.log(buff);