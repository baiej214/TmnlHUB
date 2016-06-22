'use strict';

const router = require('koa-router')();
const Worker = require('../SocketWorker');

const fs = require('fs');
const thunkify = require('thunkify');
const readfile = thunkify(fs.readFile);

// const webReq = require('../WebRequest');

router.post('/', function *(next) {
    try {
        let jobArr = JSON.parse(this.request.body.json);
        if (jobArr.length === undefined && typeof jobArr === 'object') {
            jobArr = [jobArr];
        }

        /*
                for (let job of jobArr) {
                    let worker = new Worker(job);
                    worker.fun();
                }
        */

        let a = yield thunkify(Worker)(1500);
        // let aa = yield a(function(err, data) {
        //     return 'fuck';
        // });
        this.body = a;
        // this.body = yield readfile(__dirname + '/remote.js');
    } catch (err) {
        // TODO 是否需要修改http的status？？？
        this.body = {error: true, message: error.message};
        // this.throw(error);
    }
});

module.exports = router;