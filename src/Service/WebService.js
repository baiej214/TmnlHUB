'use strict';

const fs = require('fs');
const path = require('path');
const co = require('co');
const thunkify = require('thunkify');
const readdir = thunkify(fs.readdir);
const koa = require('koa');
const router = require('koa-router')();
const koaStatic = require('koa-static');
const koaBody = require('koa-body');

const app = koa();
const routePath = path.join(__dirname, '/routes');

//app.use(koaStatic(__dirname + '../src/web/html'));
app.use(koaBody({formidable: {uploadDir: './upload'}}));

co(function *() {
    let routeDir = yield readdir(routePath);
    for (let routeFile of routeDir) {
        let parse = path.parse(routeFile);
        let fileName = parse.ext === '.js' ? parse.name : undefined;
        let action = require(path.join(routePath, fileName));
        router.use(`/${fileName}`, action.routes(), action.allowedMethods());
    }
}).catch(function (err) {
    console.error(err.stack);
});

app.use(router.routes()).on('error', function (err) {
    console.error('WebService:', err);
});

module.exports = app;