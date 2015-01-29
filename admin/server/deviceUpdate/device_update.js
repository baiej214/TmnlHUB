var path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    moment = require('moment'),
    cError = require('../../../error').Error,
    tools = require('../../../tools').tools,
    tmnl_mgr = require('../../../tmnl/tmnl_manager'),
    Updater = require('./updater').Updater;

var split = function (buff, perLen) {
        var buffArr = buff.toJSON(),
            times = Math.ceil(buffArr.length / perLen),
            arr = [];
        _.times(times, function () {
            arr.push(buffArr.splice(0, perLen));
        });
        return arr;
    },

    update = function (tmnl, file, steps, attr, step, perLen) {
        var json = {
            A1: tmnl.A1, A2: tmnl.A2, A3: 0, AFN: 15,
            DU: [{
                pn: 0,
                DT: [{
                    Fn: 1,
                    DATA: {
                        fileid: 1, attr: attr, order: 0,
                        steps: steps, step: step, perLen: perLen,
                        filedata: file
                    }
                }]
            }],
            AUX: {},
            retry: 5
        };
        tmnl.pkt_mgr.req(tools.format_json(json), function (err, data) {
            console.log(steps, attr, step, perLen);
            console.log(err, data);
            console.log('=========================================================');
        });
    };

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
        fs.readFile(req.body.path, function (err, data) {
            var filedata = split(data, req.body.perLen || 200), steps = filedata.length;
            _.each(tmnl_mgr.list, function (tmnl) {
                var tmnlUpdate = new Updater({
                    A1: tmnl.A1, A2: tmnl.A2, sid: tmnl.sid,
                    steps: steps, filedata: filedata
                });
                tmnlUpdate.on('end', function (err, data) {
                    console.log(err, data);
                }).start();
                //tmnlUpdate.on('end', function (err) {
                //    if (err) console.log(err);
                //}).on('error', function (err) {
                //    console.log(err);
                //    var _self = this;
                //    _self.timer = setTimeout(function () {
                //        console.log('开始计时');
                //        _self.over = true;
                //    }, 1000 * 60 * 5);
                //});
                //_.each(arr, function (item, step) {
                //    var attr = 0;
                //    if (step == len - 1) attr = 1;
                //    update(tmnl, item, len, attr, step, item.length);
                //});
            });
        });
    }
};

//fs.readFile('../upload/3b0a0c46cac743b7d408158d02615448.UPG', function (err, data) {
//    console.log(split(data, 200));
//});
//A1 = json.A1, A2 = json.A2, sid = A1 + '@' + A2, tmnl = tmnl_mgr.get(sid);