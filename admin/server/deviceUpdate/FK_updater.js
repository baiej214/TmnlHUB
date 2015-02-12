//FKGA42-YJ01型专变终端升级
var util = require('util'),
    events = require('events'),
    _ = require('underscore'),
    moment = require('moment'),
    cError = require('../../../error').Error,
    tools = require('../../../tools').tools,
    tmnl_mgr = require('../../../tmnl/tmnl_manager');

/**
 * 类型匹配
 */
var typeMatch = function (tmnl) {
        var _self = this, json = {
            'A1': tmnl.A1, 'A2': tmnl.A2, 'AFN': 15, 'retry': 3,
            'DU': [{'pn': 'OK', 'DT': [{'Fn': [249, 0x90, 0x1e], 'DATA': {typeMatch: 'CM3-STM32-KM101G-1'}}]}]
        };
        tmnl.pkt_mgr.req(tools.format_json(json), function (err) {
            if (err) {
                _self.emit('error', err);
            } else {
                setFileLength.call(_self, tmnl, function (err) {
                    if (err) {
                        _self.emit('error', err);
                    } else {
                        _self.emit('sendFile', tmnl, 0);
                    }
                });
            }
        });
    },

    /**
     * 设置文件长度
     */
    setFileLength = function (tmnl, cb) {
        var _self = this,
            size = this.get('size'),
            json = {
                'A1': tmnl.A1, 'A2': tmnl.A2, 'AFN': 15, 'retry': 3,
                'DU': [{'pn': 'OK', 'DT': [{'Fn': [250, 0x91, 0x1e], 'DATA': {size: size}}]}]
            };
        tmnl.pkt_mgr.req(tools.format_json(json), cb);
    },

    /**
     * 发送文件
     */
    sendFile = function (tmnl, offset) {
        var _self = this,
            size = this.get('size'),
            step = this.get('step'),
            steps = this.get('steps'),
            file = this.get('file')[step],
            offsetLen = file.length,
            updateChangeIP = this.get('updateChangeIP'),
            json = {
                'A1': tmnl.A1, 'A2': tmnl.A2, 'AFN': 15, 'retry': 3,
                'DU': [{
                    'pn': 'OK',
                    'DT': [{'Fn': [251, 0x92, 0x1e], 'DATA': {offset: offset, offsetLen: offsetLen, file: file}}]
                }]
            };
        this.recvplus().emit('step', this.get('recv'));
        tmnl.pkt_mgr.req(tools.format_json(json), function (err, data) {
            if (err) {
                _self.emit('error', err);
            } else {
                if (step >= steps - 1) {
                    if (updateChangeIP == 'on') {
                        setIPort.call(_self, tmnl, function (err, data) {
                            if (err) console.log(err);
                            _self.emit('refresh', tmnl);
                        });
                    } else {
                        _self.emit('refresh', tmnl);
                    }
                } else {
                    _self.emit('sendFile', tmnl, offset + offsetLen);
                }
            }
        });
    },

    /**
     * 配置通讯参数
     * @param tmnl
     * @param cb
     */
    setIPort = function (tmnl, cb) {
        var _self = this,
            json = {
                'A1': tmnl.A1, 'A2': tmnl.A2, 'A3': 2, 'AFN': 4, 'retry': 3,
                'DU': [{
                    'pn': 0,
                    'DT': [{
                        'Fn': 3, 'DATA': {
                            master_ip: _self.get('updateIP'),
                            master_port: _self.get('updatePort'),
                            back_ip: _self.get('updateIP'),
                            back_port: _self.get('updatePort'),
                            apn: _self.get('updateAPN')
                        }
                    }]
                }],
                AUX: {
                    PW: 0
                }
            };
        tmnl.pkt_mgr.req(tools.format_json(json), cb);
    },

    /**
     * 刷新程序
     */
    refresh = function (tmnl) {
        var _self = this,
            json = {
                'A1': tmnl.A1, 'A2': tmnl.A2, 'A3': 2, 'AFN': 15, 'retry': 3,
                'DU': [{
                    'pn': 'OK',
                    'DT': [{'Fn': [252, 0x93, 0x1e], 'DATA': []}]
                }]
            };
        tmnl.pkt_mgr.req(tools.format_json(json), function (err, data) {
            if (err) {
                _self.emit('error', err);
            } else {
                _self.emit('end', err, data);
            }
        });
    },

    /**
     * 检查设备当前软件发布日期等信息
     * @param tmnl
     * @param cb
     */
    getVersion = function (tmnl, cb) {
        var _self = this;
        tmnl.pkt_mgr.req(tools.format_json(tmnl.A1, tmnl.A2, 9, 1, 0, 3), function (err, data) {
            if (!err) {
                var obj = data.RES.json.DU[0].DT[0].DATA;
            }
            cb.call(_self, err, obj);
        });
    },

    /**
     * 返回当前升级文件中的软件发布日期等信息
     * @param file
     */
    getFileVersion = function (file) {

    },

    /**
     * 升级错误
     */
    uploadError = function () {
        var _self = this, tmnl = tmnl_mgr.get(this.get('sid'));

        tmnl.destroy();//断开与设备的socket连接，等待重连

        if (this.get('failTimes') >= this.get('allowFailTimes')) {
            this.updateDone().emit('end', cError('升级失败，失败次数过多（' + this.get('failTimes') + '次）'));
            return;
        }
        _self.failTimesplus();

        //开始计时
        this.setTimer();
    },

    start = function () {
        var _self = this,
            sid = this.get('sid'),
        //currentReleaseDate = this.get('currentReleaseDate'),
            tmnl = tmnl_mgr.get(sid);
        this.setBegin();
        if (tmnl) {
            //this.emit('getversion', tmnl, function (err, data) {
            //    var softwareReleaseDate = moment(new Date(data.softwareReleaseDate)).format('YYYY-MM-DD');
            //    if (softwareReleaseDate == currentReleaseDate) {
            //        _self.emit('end', null, '软件版本日期相同，不需要升级');
            //    } else {
            //        _self.emit('typeMatch', tmnl);
            //    }
            //});
            _self.emit('typeMatch', tmnl);
        } else {
            throw '设备不在线';
        }
    };

var FK_updater = function (opts) {
    if (!(this instanceof FK_updater)) return new FK_updater(opts);
    events.EventEmitter.call(this);

    var defaults = {
        //currentReleaseDate: moment(new Date(opts.currentReleaseDate)).format('YYYY-MM-DD'),
        file: opts.filedata,
        step: 0,
        steps: opts.filedata.length,
        size: opts.size,
        recv: 0,
        //unrecv: [],
        //init: true,//初始超时标志
        updateDone: false,//升级完成标志
        timer: null,//升级超时计时器
        timeout: 1000 * 60 * 5,//升级超时时间5分钟
        allowFailTimes: 5,//允许升级失败次数
        failTimes: 0//升级失败次数
    };

    opts = _.defaults(opts, defaults);

    this.get = function (key) {
        return opts[key];
    };

    this.setBegin = function () {
        opts.recv = 0;
        opts.step = 0;
        return this;
    };

    this.recvplus = function () {
        opts.recv++;
        opts.step++;
        return this;
    };

    this.failTimesplus = function () {
        opts.failTimes++;
        return this;
    };

    this.updateDone = function () {
        opts.updateDone = true;
        return this;
    };

    this.setTimer = function () {
        var _self = this;
        opts.timer = setTimeout(function () {
            _self.updateDone().emit('end', cError('升级超时（' + opts.timeout + 'ms）'));
        }, opts.timeout);
        //TODO 这里报错，不能事件嵌套，容易溢出，抓紧优化
        //添加tmnlMgr一次性事件，升级超时前，如果终端再次登录则继续升级
        tmnl_mgr.event.once('new', function (newTmnl) {
            console.log('tmnl_mgr.event.new');
            if (_self.get('updateDone') == false && newTmnl.A1 == opts.A1 && newTmnl.A2 == opts.A2) {
                clearTimeout(opts.timer);
                _self.start();
            }
        });
    };

    this.on('start', start)
        .on('getversion', getVersion)
        .on('typeMatch', typeMatch)
        .on('sendFile', sendFile)
        .on('refresh', refresh)
        .on('error', uploadError)
        .on('end', function () {
            opts.updateDone = true;
        });
};
util.inherits(FK_updater, events.EventEmitter);

FK_updater.prototype.start = function () {
    try {
        this.emit('start');
    } catch (err) {
        this.emit('end', err);
    }
};

exports.Updater = FK_updater;
