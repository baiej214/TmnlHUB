var path = require('path'),
    fs = require('fs'),
    util = require("util"),
    events = require("events"),
    _ = require('underscore'),
    moment = require('moment'),
    cError = require('../../../error').Error,
    tools = require('../../../tools').tools,
    tmnl_mgr = require('../../../tmnl/tmnl_manager');

var getTmnl = function (sid) {
    return tmnl_mgr.get(sid);
};

var updater = function (opts) {
    this.over = false;
    this.timer = null;
    this.timeout = 1000 * 60 * 5;
    this.init = true;
    this.opts = opts;

    events.EventEmitter.call(this);

};

util.inherits(updater, events.EventEmitter);

/**
 * 清除
 * @param tmnl {Object}
 * @param cb {Function}
 */
updater.prototype.clearfile = function (tmnl, cb) {
    var json = {
        "A1": tmnl.A1, "A2": tmnl.A2, "AFN": 15, "retry": 3,
        "DU": [{
            "pn": 0,
            "DT": [{
                "Fn": 1,
                "DATA": {
                    "fileid": 0, "attr": 0, "order": 0,
                    "steps": this.opts.steps,
                    "step": 0, "perLen": 0, "filedata": []
                }
            }]
        }]
    };
    tmnl.pkt_mgr.req(tools.format_json(json), function (err, data) {
        if (!err) {
            var obj = data.RES.json.DU[0].DT[0].DATA;
        }
        cb.call(null, err, obj);
    });
};

/**
 * 检查接收文件段
 * @param tmnl {Object}
 * @param cb {Function}
 */
updater.prototype.checkfile = function (tmnl, cb) {
    var _self = this;
    tmnl.pkt_mgr.req(tools.format_json(tmnl.A1, tmnl.A2, 12, 14, 0, 3), function (err, data) {
        if (!err) {
            var obj = data.RES.json.DU[0].DT[0].DATA,
                steps = _self.opts.steps,
                unrecv = obj.unrecv.splice(0, Math.ceil(steps / 8)),
                index = 0, result = [];
            _.each(unrecv, function (item, i) {
                _.times(8, function (j) {
                    index = i * 8 + j;
                    if (index >= steps) return;
                    if ((item >> j) % 2 == 1) result.push(index);
                });
            });
        }
        cb.call(null, err, result);
    });
};

updater.prototype.send = function (tmnl, filedata, stepArr, attr) {
    var _self = this,
        steps = filedata.length,
        step = _.isArray(stepArr) ? stepArr.shift() : stepArr,
        perLen = filedata[step].length,
        json = {
            A1: tmnl.A1, A2: tmnl.A2, A3: 0, AFN: 15,
            DU: [{
                pn: 0,
                DT: [{
                    Fn: 1,
                    DATA: {
                        fileid: 1, attr: attr || 0, order: 0,
                        steps: steps, step: step, perLen: perLen,
                        filedata: filedata[step]
                    }
                }]
            }],
            AUX: {}, retry: 5
        };

    console.log('=============', step, '================');

    tmnl.pkt_mgr.req(tools.format_json(json), function (err, data) {
        if (!err) {
            var recvStep = data.RES.json.DU[0].DT[0].DATA.recvStep;
            if (recvStep > 1024) {
                _self.emit('end', cError('升级文件接收错误。'));
            } else if (step == steps - 2 || stepArr.length <= 0) {
                //检查，如果所缺段数是最后一段，就直接发送最后一段报文
                _self.checkfile(tmnl, function (err, unrecv) {
                    console.log('final checkfile');
                    if (unrecv && unrecv.length > 1) {
                        console.log('补发');
                        _self.send(tmnl, filedata, unrecv);
                    } else if (unrecv && unrecv.length == 1 && unrecv[0] == steps - 1) {
                        console.log('发送最后一帧');
                        _self.send(tmnl, filedata, filedata.length - 1, 1);
                    } else {
                        _self.emit('end', '不知道咋回事');
                    }
                });
            } else if (recvStep == steps - 1) {
                //发送完成
                _self.emit('end', null, '发送完成');
            } else {
                //发送下一段
                var nextStep = _.isArray(stepArr) ? stepArr : ++step;
                _self.send(tmnl, filedata, nextStep, attr);
            }
        } else {
            //比如终端掉线、重发多次都超时之类的错误
            //计时开始，如果超时将不再升级
            console.log('设备升级超时');
            tmnl.destroy();
            //TODO _self.emit('error', '设备升级超时');
        }
    });
};

updater.prototype.update = function (tmnl, unrecv) {
    this.init = false;
    var _self = this, step = 0, filedata = this.opts.filedata;
    if (unrecv && unrecv.length > 0) {
        step = unrecv;
    }
    tmnl.once('close', function () {
        _self.emit('error', '设备升级超时-掉线');
    });

    tmnl_mgr.event.once('new', function (newTmnl) {
        console.log('tmnl_mgr.event.new');
        if (_self.over == false) {
            clearTimeout(_self.timer);
            console.log('over==false');
            if (newTmnl.A1 == tmnl.A1 && newTmnl.A2 == tmnl.A2) {
                console.log('reStart');
                _self.start();
            }
        }
    });

    this.send(tmnl, filedata, step);
};

/**
 * 开始
 */
updater.prototype.start = function () {
    var tmnl = getTmnl(this.opts.sid), _self = this;
    if (!tmnl) {
        this.emit('end', cError('设备不在线。'));
    } else {
        if (this.init) {
            this.clearfile(tmnl, function (err, data) {
                if (!err) {
                    console.log('clearfile OK');
                    _self.update(tmnl);
                } else {
                    _self.emit('end', err);
                }
            });
        } else {
            this.checkfile(tmnl, function (err, unrecv) {
                if (!err) {
                    console.log('checkfile OK');
                    _self.update(tmnl, unrecv);
                } else {
                    _self.emit('end', err);
                }
            });
        }
    }
};

exports.Updater = updater;