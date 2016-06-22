'use strict';

const TCPServer = require('./TCPServer');

// class Worker {
//     constructor(job) {
//     }
//
//     fun() {
//         console.log(TCPServer.listConut());
//     }
// }

function Worker(ms, next) {
    setTimeout(() => {
        return next.call(null, null, 'abc');
    }, ms);
}

module.exports = Worker;