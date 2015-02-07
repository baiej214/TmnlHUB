Ext.define('js.deviceUpdate', {
    formpanel: function () {
        var _self = this,
            ipregex = /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/;//:\d{0,5}$
        return Ext.create('Ext.form.Panel', {
            id: 'deviceUpdateFrompanel', region: 'north', height: 300, fieldDefaults: {labelWidth: 60},
            items: [
                {
                    layout: 'column', padding: '0 0 10 0',
                    items: [
                        {
                            xtype: 'radiogroup',
                            fieldLabel: '升级方式',
                            width: 200,
                            columns: 2,
                            vertical: true,
                            items: [
                                {boxLabel: '09', name: 'selectType', inputValue: '09'},
                                {boxLabel: '13', name: 'selectType', inputValue: '13', checked: true}
                            ]
                        },
                        {
                            xtype: 'fieldcontainer', fieldLabel: '设备范围', layout: 'hbox',
                            items: [
                                {
                                    xtype: 'textfield',
                                    name: 'range',
                                    id: 'deviceUpdateRange',
                                    readOnly: true,
                                    padding: '0 3 0 0',
                                    listeners: {
                                        change: function (field, newValue, oldValue) {
                                            var arr = newValue.split(','), str = '';
                                            if (arr.length > 5) {
                                                str = arr.slice(0, 4).concat('...').join(', ');
                                                field.setValue(str);
                                            }
                                            //Ext.getCmp('deviceUpdateRangeRaw').setValue(newValue);
                                        }
                                    }
                                },
                                {
                                    xtype: 'button', text: '选择',
                                    handler: function () {
                                        //var range = Ext.getCmp('deviceUpdateRange');
                                        //range.setValue('1,2,3,4,5,6,7,8,9,0');
                                        var selector = Ext.create('js.deviceSelector');
                                        Ext.create('Ext.window.Window', {
                                            width: 500, height: 300, layotu: 'border', modal: true,
                                            items: [{
                                                id: 'selectType',
                                                xtype: 'radiogroup', region: 'north',
                                                fieldLabel: 'Two Columns',
                                                columns: 2,
                                                vertical: true,
                                                items: [
                                                    {
                                                        boxLabel: '全部',
                                                        name: 'selectType',
                                                        inputValue: '1',
                                                        checked: true
                                                    },
                                                    {boxLabel: '选择', name: 'selectType', inputValue: '2'}
                                                ]
                                            }, {
                                                region: 'center', items: selector
                                            }],
                                            buttons: [{
                                                text: 'OK',
                                                handler: function () {
                                                    var selectType = Ext.getCmp('selectType').getValue().selectType,
                                                        deviceRange = Ext.getCmp('deviceRange'),
                                                        deviceUpdateRange = Ext.getCmp('deviceUpdateRange');
                                                    if (selectType == 1) {
                                                        deviceRange.setValue('all');
                                                        deviceUpdateRange.setValue('全部');
                                                    } else {
                                                        deviceRange.setValue(selector.getValue());
                                                        deviceUpdateRange.setValue(selector.getValue());
                                                    }
                                                    this.up('window').close();
                                                }
                                            }]
                                        }).show();
                                    }
                                }]
                        },
                        {
                            xtype: 'filefield', padding: '0 0 0 10',
                            name: 'UPG',
                            fieldLabel: '升级文件',
                            allowBlank: false,
                            width: 300,
                            buttonText: '浏览'
                        }
                    ]
                },
                {
                    layout: 'column',
                    items: [
                    //    {
                    //    xtype: 'fieldset', border: false,
                    //    checkboxToggle: true,
                    //    title: '重启后配置通讯参数',
                    //    items: []
                    //},
                        {
                            xtype: 'checkbox', boxLabel: '重启后配置通讯参数', chekced: true,
                        },
                        {
                            xtype: 'fieldcontainer',
                            fieldLabel: '主IP',
                            layout: 'hbox',
                            items: [
                                {xtype: 'textfield', name: 'mainip', emptyText: '0.0.0.0', regex: ipregex},
                                {
                                    name: 'mainport',
                                    xtype: 'numberfield',
                                    mouseWheelEnabled: false,
                                    allowDecimals: false,
                                    hideTrigger: true,
                                    emptyText: '端口',
                                    maxValue: 65535,
                                    minValue: 0,
                                    padding: '0 5',
                                    width: 50
                                }
                            ]
                        },
                        {xtype: 'textfield', name: 'apn', fieldLabel: 'APN'}]
                },
                {xtype: 'hidden', name: 'deviceRange', id: 'deviceRange'},
                {
                    xtype: 'button',
                    id: 'deviceUpdateSubmit',
                    text: '确定',
                    handler: function (btn, e, perLen) {
                        var form = this.up('form').getForm();
                        form.submit({
                            url: 'server/deviceUpdate/device_update',
                            params: {action: 'count'},
                            success: function (form, action) {
                                var json = action.result;
                                _self.confirm(json);
                            }
                        });
                    }
                }
            ]
        });
    },

    update: function (json) {
        Ext.Ajax.request({
            url: 'server/deviceUpdate/device_update',
            params: json,
            success: function (response, opts) {
                alert('fuck');
            }
        });
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
            '请重新配置数据长度，最大不能超过200。点击“取消”放弃升级',
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
    },
    constructor: function () {
        var panel = {
            xtype: 'panel', layout: 'border', padding: 5,
            items: [this.formpanel(), this.framepanel()]
        };
        return panel;
    }
});