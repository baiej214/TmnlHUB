var path = require('path'),
    fs = require('fs'),
    util = require('util'),
    events = require('events'),
    _ = require('underscore'),
    moment = require('moment'),
    cError = require('../../../error').Error,
    tools = require('../../../tools').tools,
    tmnl_mgr = require('../../../tmnl/tmnl_manager'),
    updater = require('./updater').Updater,
    FK_updater = require('./FK_updater').Updater;

var event = new events.EventEmitter(),

    split = function (buff, perLen) {
        var buffArr = buff.toJSON().data,
            times = Math.ceil(buffArr.length / perLen),
            arr = [];
        _.times(times, function () {
            arr.push(buffArr.splice(0, perLen));
        });
        return arr;
    },

    update = function (json, socket) {
        var updateRange = json.updateRange,
            updateType = json.updateType,
            tmnlList = [],
            Updater = updateType == '09' ? FK_updater : updater,
            updateEnd = [];
        if (updateRange != 'all') {
            updateRange = updateRange.split(',');
            _.each(updateRange, function (sid) {
                var tmnl = tmnl_mgr.get(sid);
                if (tmnl) tmnlList.push(tmnl);
            });
        } else {
            tmnlList = tmnl_mgr.list;
        }

        fs.readFile(json.path, function (err, data) {
            var filedata = split(data, json.perLen || 500), steps = filedata.length;
            _.each(tmnlList, function (tmnl) {
                var tmnlUpdate = new Updater({
                    A1: tmnl.A1, A2: tmnl.A2, sid: tmnl.sid, size: json.size,
                    steps: steps, filedata: filedata,
                    updateChangeIP: json.updateChangeIP,
                    updateIP: json.updateIP,
                    updatePort: json.updatePort,
                    updateAPN: json.updateAPN
                });
                tmnlUpdate.on('step', function (recv) {
                    var progress = parseFloat((recv / steps).toFixed(2));
                    event.emit('update::step', socket, tmnl.sid, progress);
                }).on('end', function (err, data) {
                    event.emit('update::end', socket, tmnl.sid, {err: err, data: data});
                }).start();
            });
        });
    };

event.on('update::end', function (client, sid, endTotal) {
    //client.emit('update::end', endTotal);
    //if (tmnlListLen == endTotal.length) {
    //    //socket//
    //}
    client.emit('update::end', sid, endTotal);
}).on('update::step', function (client, sid, progress) {
    client.emit('update::step', sid, progress);
});

exports.handler = function (req, res) {
    var action = req.body.action;
    if (action == 'count') {
        var field = _.keys(req.files)[0],
            size = req.files[field].size,
            perLen = 500,
            part = Math.ceil(size / perLen),
            path = req.files[field].path;
        res.send({
            success: true, size: size, perLen: perLen, part: part, path: path,
            updateAPN: req.body.updateAPN, updateChangeIP: req.body.updateChangeIP,
            updateIP: req.body.updateIP, updatePort: req.body.updatePort,
            updateRange: req.body.updateRange, updateType: req.body.updateType || '13'
        });
    } else {
        res.send({success: true, error: cError('参数错误')});
    }
};

exports.update = update;