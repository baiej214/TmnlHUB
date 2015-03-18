Ext.define('js.dash', {
    extend: 'Ext.container.Container',
    config: {
        layout: {
            type: 'vbox',
            align: 'stretch'
        }
    },
    initComponent: function () {
        var _self = this,
            dataSysData = {
                nodeVersion: 'v0.12.0',
                sysStartTime: '2015-05-05',
                sysRunTime: 's',
                nodeRSS: 123,
                frameSize: 321
            },
            dataSysConfig = {
                tmnlServer: 5805,
                webServer: 2355,
                broadcast: 2356,
                adminServer: 13887
            },
            tplSysData = new Ext.XTemplate(
                '<p>',
                '<span class="dash-item"><label>系统启动时间：</label>{sysStartTime}</span>',
                '<span class="dash-item"><label>系统运行时间：</label>{sysRunTime}</span>',
                '</p>',
                '<p><span class="dash-item"><label>日志大小：</label>{frameSize}</span></p>',
                '<p>',
                '<span class="dash-item"><label>服务器内存：</label>{frameSize}</span>',
                '<span class="dash-item"><label>已占用：</label>{frameSize}</span>',
                '<span class="dash-item"><label>空闲：</label>{frameSize}</span>',
                '</p>',
                '<p>',
                '<span class="dash-item"><label>node版本：</label>{nodeVersion}</span>',
                '<span class="dash-item"><label>node占用内存：</label>{nodeRSS}</span>',
                '</p>'
            ),
            tplSysConfig = new Ext.XTemplate(
                '<p><span class="dash-item"><label>设备服务端口：</label>{tmnlServer}</span></p>',
                '<p><span class="dash-item"><label>WebService端口：</label>{webServer}</span></p>',
                '<p><span class="dash-item"><label>广播端口：</label>{broadcast}</span></p>',
                '<p><span class="dash-item"><label>管理界面端口：</label>{adminServer}</span></p>'
            );
        this.items = [{
            layout: {type: 'hbox'},
            defaults: {flex: 1, scrollable: true, padding: 15},
            items: [{
                tpl: tplSysData, data: dataSysData
            }, {
                tpl: tplSysConfig, data: dataSysConfig
            }]
        }, {
            html: ''
        }];
        //this.method();
        this.callParent(arguments);
    },
    getSysData: function () {

    },
    getSocketData: function () {

    },
    getFramesData: function () {

    }
});