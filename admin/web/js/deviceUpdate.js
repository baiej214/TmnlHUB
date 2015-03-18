Ext.define('js.deviceUpdate', {
    extend: 'Ext.panel.Panel',
    requires: ['js.deviceSelector'],
    deviceDialog: Ext.create('Ext.window.Window', {
        closeAction: 'hide', width: 500, height: 300, layotu: 'border', modal: true,
        items: [{
            id: 'rangeType', xtype: 'radiogroup', region: 'north', fieldLabel: '范围类型',
            items: [
                {boxLabel: '全部', name: 'deviceSelectorType', inputValue: '1', checked: true},
                {boxLabel: '选择', name: 'deviceSelectorType', inputValue: '2'}
            ]
        }, {
            region: 'center', items: Ext.create('js.deviceSelector', {id: 'deviceUpdate::deviceSelector'})
        }],
        buttons: [
            {
                text: '确定',
                handler: function () {
                    var rangeType = Ext.getCmp('rangeType').getValue().deviceSelectorType,
                        updateRange = Ext.getCmp('updateRange'),
                        updateRangeText = Ext.getCmp('updateRangeText'),
                        deviceSelector = Ext.getCmp('deviceUpdate::deviceSelector');
                    if (rangeType == 1) {
                        updateRange.setValue('all');
                        updateRangeText.setValue('全部');
                    } else {
                        updateRange.setValue(deviceSelector.getValue());
                        updateRangeText.setValue(deviceSelector.getValue());
                    }
                    this.up('window').close();
                }
            },
            {
                text: '取消',
                handler: function () {
                    this.up('window').close();
                }
            }
        ]
    }),

    initComponent: function () {
        var _self = this,
            ipregex = /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/,//:\d{0,5}$
        //升级方式
            updateType = {
                id: 'updateType',
                name: 'updateType',
                xtype: 'radiogroup',
                fieldLabel: '升级方式',
                labelWidth: 56,
                width: 140,
                columns: 2,
                vertical: true,
                items: [
                    {boxLabel: '09', name: 'updateType', inputValue: '09'},
                    {boxLabel: '13', name: 'updateType', inputValue: '13', checked: true}
                ]
            },
        //设备范围
            updateRangeText = {
                id: 'updateRangeText', name: 'updateRangeText', xtype: 'textfield', emptyText: '设备范围', editable: false,
                triggers: {
                    clear: {
                        cls: 'x-form-clear-trigger', hidden: true,
                        handler: function () {
                            this.setValue();
                        }
                    },
                    search: {
                        cls: 'x-form-search-trigger',
                        handler: function () {
                            _self.deviceDialog.show();
                        }
                    }
                },
                listeners: {
                    change: function (field, newValue, oldValue) {
                        if (newValue == false) {
                            this.getTrigger('clear').hide();
                        } else {
                            this.getTrigger('clear').show();

                        }
                        var arr = newValue.split(','), str = '';
                        if (arr.length > 5) {
                            str = arr.slice(0, 4).concat('...').join(', ');
                            field.setValue(str);
                        }
                    }
                }
            },
        //升级文件
            updateFile = {
                id: 'updateFile', name: 'updateFile', xtype: 'filefield', emptyText: '升级文件', allowBlank: false,
                width: 300, buttonText: '浏览'
            },
        //升级成功后配置通讯参数
            updateChangeIP = {
                id: 'updateChangeIP', name: 'updateChangeIP', xtype: 'checkbox',
                boxLabel: '升级成功后配置通讯参数', chekced: true
            },
        //IP
            updateIP = {
                id: 'updateIP', name: 'updateIP', xtype: 'textfield',
                emptyText: '0.0.0.0', width: 120, regex: ipregex
            },
        //端口
            updatePort = {
                id: 'updatePort', name: 'updatePort', xtype: 'numberfield', mouseWheelEnabled: false,
                allowDecimals: false, hideTrigger: true, emptyText: '端口',
                maxValue: 65535, minValue: 0, width: 50
            },
        //APN
            updateAPN = {id: 'updateAPN', name: 'updateAPN', xtype: 'textfield', emptyText: 'APN', width: 90},
        //终端范围提交值
            updateRange = {id: 'updateRange', name: 'updateRange', xtype: 'hidden'},
        //提交按钮
            updateSubmit = {
                id: 'updateSubmit',
                xtype: 'button',
                text: '升级',
                scope: _self,
                handler: _self.submit,
                padding: '3 4'
            },

            store = Ext.create('Ext.data.Store', {
                fields: ['sid', 'A1', 'A2', {
                    name: 'progress',
                    calculate: function (data) {
                        return Math.random();
                    }
                }, 'status', 'result', 'begin', 'end']
            }),

            columns = [
                {text: '行政区划码', dataIndex: 'A1'},
                {text: '终端地址', dataIndex: 'A2'},
                {
                    text: '进度', dataIndex: 'progress', flex: 1, xtype: 'widgetcolumn',
                    widget: {xtype: 'progressbarwidget', textTpl: ['{percent:number("0")}%']}
                },
                {text: '状态', dataIndex: 'status'},
                {text: '结果', dataIndex: 'result'},
                {text: '开始时间', dataIndex: 'begin', width: 150},
                {text: '结束时间', dataIndex: 'end', width: 150}
            ];

        this.form = Ext.create('Ext.form.Panel', {
            defaults: {padding: '0 10 0 0'}, layout: 'column', region: 'north', height: 30,
            items: [updateType, updateRangeText, updateFile, updateChangeIP, updateIP, updatePort, updateAPN, updateRange, updateSubmit]
        });

        this.gridpanel = Ext.create('Ext.grid.Panel', {
            id: 'fuck', disableSelection: true,
            region: 'center', store: [], columns: columns
        });

        this.items = [this.form, this.gridpanel];

        this.callParent(arguments);
    },

    config: {
        layout: 'border', padding: 5
    },

    submit: function () {
        var _self = this;
        this.form.getForm().submit({
            url: 'server/deviceUpdate/device_update',
            params: {action: 'count'},
            success: function (form, action) {
                var json = action.result;
                _self.confirm(json);
            }
        });
    },

    update: function (json) {
        var _self = this, store = _self.gridpanel.store;
        Ext.getCmp('updateSubmit').setDisabled(true);
        Ext.global.socket.emit('device_update', json);
        Ext.global.socket.on('update::end', function (sid, endTotal) {
            if (endTotal.err) {
                store.findRecord('sid', sid).set('result', '失败。' + endTotal.err.message);
            } else {
                store.findRecord('sid', sid).set('result', '成功');
            }
            store.findRecord('sid', sid).set('status', '完成');
            store.findRecord('sid', sid).set('end', Ext.Date.format(new Date(), 'Y-m-d H:i:s'));
            Ext.getCmp('updateSubmit').setDisabled(false);
        }).on('update::step', function (sid, progress) {
            store.findRecord('sid', sid).set('status', '正在升级');
            store.findRecord('sid', sid).set('progress', progress);
        });

        var tmnlList = [], data = [];
        if (json.updateRange == 'all') {
            tmnlList = Ext.Array.map(Ext.global.tmnlMgr, function (item) {
                return item.sid
            });
        } else {
            tmnlList = json.updateRange.split(',');
        }
        data = Ext.Array.map(tmnlList, function (sid) {
            return {
                sid: sid,
                A1: parseInt(sid.split('@')[0]),
                A2: parseInt(sid.split('@')[1]),
                progress: 0,
                status: '准备升级',
                result: '-',
                begin: Ext.Date.format(new Date(), 'Y-m-d H:i:s'),
                end: '-'
            }
        });
        this.gridpanel.store.loadData(data);
    },

    confirm: function (json) {
        var _self = this;
        Ext.Msg.confirm('升级提示',
            '当前升级文件总共' + json.size +
            '字节，共分为' + json.part +
            '段，每段' + json.perLen + '字节。<br>' +
            '是否升级？点击“否”可以重新配置每段数据的长度。', function (isOK) {
                if (isOK === 'yes') {
                    json.action = 'update';
                    _self.update(json);
                } else if (isOK == 'no') {
                    _self.prompt(json);
                }
            });
    },
    prompt: function (json) {
        var _self = this;
        Ext.Msg.prompt('升级提示 - 重新配置数据长度',
            '请重新配置数据长度。点击“取消”放弃升级',
            function (isOK, perLen) {
                if (isOK === 'ok') {
                    json.perLen = perLen;
                    json.part = Math.ceil(json.size / json.perLen);
                    _self.confirm(json);
                }
            });
    },
    framepanel: function () {
        return Ext.create('Ext.panel.Panel', {
            region: 'center', title: 'FramePanel'
        });
    }
});