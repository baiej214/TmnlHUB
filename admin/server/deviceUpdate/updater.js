var path = require('path'),
    util = require('util'),
    events = require('events'),
    _ = require('underscore'),
    moment = require('moment'),
    cError = require('../../../error').Error,
    tools = require('../../../tools').tools,
    tmnl_mgr = require('../../../tmnl/tmnl_manager');

/**
 * 清除已接受文件
 * @param tmnl
 * @param steps
 * @param cb
 */
var clearRecvFile = function (tmnl, steps, cb) {
        var _self = this, json = {
            'A1': tmnl.A1, 'A2': tmnl.A2, 'AFN': 15, 'retry': 3,
            'DU': [{
                'pn': 0,
                'DT': [{
                    'Fn': 1,
                    'DATA': {
                        'fileid': 0, 'attr': 0, 'order': 0, 'steps': steps, 'step': 0, 'perLen': 0, 'filedata': []
                    }
                }]
            }]
        };
        tmnl.pkt_mgr.req(tools.format_json(json), function (err, data) {
            cb.call(_self, err, data);
        });
    },

    /**
     * 检查未接收段
     * @param tmnl
     * @param steps
     * @param cb
     */
    checkUnrecv = function (tmnl, steps, cb) {
        var _self = this;
        tmnl.pkt_mgr.req(tools.format_json(tmnl.A1, tmnl.A2, 12, 14, 0, 3), function (err, data) {
            if (!err) {
                var obj = data.RES.json.DU[0].DT[0].DATA,
                    unrecv = obj.unrecv.splice(0, Math.ceil(steps / 8)),
                    index = 0, result = [];
                _.each(unrecv, function (item, i) {
                    _.times(8, function (j) {
                        index = i * 8 + j;
                        if (index >= steps) return;
                        if ((item >> j) % 2 == 1) result.push(index);
                    });
                });
                result = _.sortBy(result);
            }
            cb.call(_self, err, result);
        });
    },

    /**
     * 发送文件段
     * @param tmnl
     * @param steps
     * @param step
     * @param data
     * @param attr
     */
    send = function (tmnl, steps, step, data, attr) {
        var _self = this,
            json = {
                A1: tmnl.A1, A2: tmnl.A2, A3: 0, AFN: 15,
                DU: [{
                    pn: 0,
                    DT: [{
                        Fn: 1,
                        DATA: {
                            fileid: 1, attr: attr || 0, order: 0,
                            steps: steps, step: step, perLen: data.length,
                            filedata: data
                        }
                    }]
                }],
                AUX: {}, retry: 5
            };
        tmnl.pkt_mgr.req(tools.format_json(json), function (err, data) {
            if (err) {
                _self.emit('error', err, tmnl);
            } else {
                var recvStep = data.RES.json.DU[0].DT[0].DATA.recvStep;
                if (recvStep > 1024) {
                    _self.emit('error', cError('升级文件接收错误。'), tmnl);
                } else if (recvStep != step) {
                    _self.emit('error', cError('升级文件接收错误。分段号不匹配。'), tmnl);
                } else if (recvStep == steps - 1) {
                    _self.emit('end');
                } else {
                    _self.emit('next', tmnl, step + 1);
                }
            }
        });
    };

/**
 * @constructor
 * @param opts 终端地址 行政区划码 sid 文件数组
 */
var updater = function (opts) {
    if (!(this instanceof updater)) return new updater(opts);
    events.EventEmitter.call(this);

    var _self = this,
        a1 = opts.A1, a2 = opts.A2, sid = opts.sid,
        file = opts.filedata, steps = file.length,
        unrecv = [],
        init = true,//初始超时标志
        updateDone = false,//升级完成标志
        timer = null,//升级超时计时器
        timeout = 1000 * 60 * 5;//升级超时时间5分钟

    this.on('start', function () {
        var tmnl = tmnl_mgr.get(sid);
        if (!tmnl) throw cError('设备不在线');
        if (init == true) {
            clearRecvFile.apply(this, [tmnl, steps, function (err) {
                init = false;
                this.emit('next', tmnl, 0);
            }]);
        } else {
            checkUnrecv.apply(this, [tmnl, steps, function (err, result) {
                unrecv = result;
                this.emit('next', tmnl);
            }]);
        }
    }).on('next', function (tmnl, step) {
        if (unrecv.length > 0) step = unrecv.shift();
        if (step == steps - 1) {
            var attr = 1;
            /*
                TODO 如果设备接收文件后不能返回分段号进行匹配，则使用下面的代码进行检查未接收段
                checkUnrecv.apply(_self, [tmnl, steps, function (err, result) {
                    unrecv = result;
                    _self.emit('next', tmnl);
                }]);
                }
            */
        }
        send.apply(this, [tmnl, steps, step, file[step], attr]);
    }).on('error', function (err, tmnl) {
        console.log('update error', err);
        //开始计时
        timer = setTimeout(function () {
            updateDone = true;
            _self.emit('end', cError('升级超时（' + timeout + 'ms）'));
        }, timeout);
        //添加tmnlMgr一次性事件，升级超时前，如果终端再次登录则继续升级
        tmnl_mgr.event.once('new', function (newTmnl) {
            console.log('tmnl_mgr.event.new');
            if (updateDone == false) {
                clearTimeout(timer);
                if (newTmnl.A1 == a1 && newTmnl.A2 == a2) {
                    _self.start();
                }
            }
        });
        tmnl.destroy();
    });
};

util.inherits(updater, events.EventEmitter);

updater.prototype.start = function () {
    try {
        this.emit('start');
    } catch (err) {
        this.emit('end', err);
    }
};

exports.Updater = updater;
//test