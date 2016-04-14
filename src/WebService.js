'use strict';

const _ = require('underscore');
const koa = require('koa');
const router = require('koa-router')();
const koaBody = require('koa-body')();
const app = koa();

const Server = require('./TCPServer');

app.on('error', function(err){
    console.error('server error', err);
});

app.use(router.routes());
//app.use(koaBody({formidable:{uploadDir: './upload'}}));

//召测
router.get('/get', function *(next) {
    try {
        let json = JSON.stringify(this.request.query);
        this.body = 123;
    } catch (error) {
        throw error;
    }
});

//下发
router.post('/set', koaBody, function *(next) {
    //let list = Server.list();
    //_.each(list, function (item) {
    //    console.log(item.A1, item.A2);
    //});
    this.body = {"error":true,"A1":123,"A2":123,"message":"无法找到对应的设备"};
});


module.exports = app;