var path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    moment = require('moment'),
    cError = require('../error').Error;

exports.handler = function (req, res) {
    var action = req.body.action;
    if (action == 'count') {
        var field = _.keys(req.files)[0],
            size = req.files[field].size,
            perLen = req.body.perLen || 200,
            part = Math.ceil(size / perLen),
            path = req.files[field].path;
        res.send({
            success: true,
            size: size,
            perLen: perLen,
            part: part,
            path: path
        });
    } else if (action == 'update') {
        var path = req.body.path;
        fs.readFile(path, function (err, data) {
            console.log(data);
        });
    }
};