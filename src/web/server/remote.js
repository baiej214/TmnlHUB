'use strict';

const thunkify = require('thunkify');

//const readfile = thunkify(fs.readFile);

function format() {
}

function *remote() {
    try {
        let jobArr = JSON.parse(this.request.body.json);
        if (jobArr.length === undefined && typeof jobArr === 'object') {
            jobArr = [jobArr];
        }

        for (let job of jobArr) {

        }
        //this.body = 123;
        setInterval(() => this.body = 'fuck', 1000);
    } catch (error) {
        this.throw(error);
    }
}

module.exports = remote;