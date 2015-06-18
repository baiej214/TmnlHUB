Ext.require([
    'Ext.ux.statusbar.StatusBar',
    'Ext.ux.statusbar.ValidationStatus',
    'js.notice'
]);
Ext.global.socket = io();
Ext.onReady(function () {

    //不支持IE
    if (Ext.isIE) {
        location.href = 'browser';
        return false;
    }

    Ext.global.tmnlMgr = '';
    socket.on('tmnlListChange', function (tmnls, offlineTmnl) {
        Ext.global.tmnlMgr = tmnls;
        Ext.getCmp('link_total').update('设备连接总数：' + tmnls.length || 0);
        if (offlineTmnl) {
            var panel = Ext.getCmp(offlineTmnl.sid);
            if (panel) {
                panel.offline();
            }
        }
    }).on('tmnl_message', function (A1, A2, date, dir, buffstr) {
        var panel = Ext.getCmp(A1 + '@' + A2);
        if (panel) {
            panel.addFrame(date + dir + buffstr);
        }
    });

    Ext.BLANK_IMAGE_URL = 'sdk/ext/build/blank.gif';

    Ext.create('Ext.container.Viewport', {
        layout: 'border',
        items: [{
            region: 'west', collapsible: false, border: true,
            width: 300, layout: 'fit', items: Ext.create('js.maintree')
        }, {
            region: 'center', xtype: 'tabpanel', activeTab: 0, id: 'main_tabpanel',
            defaults: {layout: 'fit'},
            items: [{
                title: 'Dashboard', closable: false, items: Ext.create('js.dash')
            }]
        }, {
            region: 'south', xtype: 'statusbar', statusAlign: 'right', border: true,
            items: [
                Ext.create('Ext.toolbar.TextItem', {id: 'link_total', text: '设备连接总数：0'}),
                {
                    text: 'Button One',
                    handler: function () {
                        socket.emit('testClick', 123);
                        //68 4E 00 4E 00 68 4B 03 41 31 D4 20 0D 67 01 01 04 11 15 01 11 06 15 01 01 83 16
                        //68 4D 00 4D 00 68 4B 03 41 31 D4 00 0D 62 01 01 04 11 15 01 11 06 95 01 01 DE 16
                        //68 4D 00 4D 00 68 4B 03 41 31 D4 00 0D 61 01 01 04 11 00 00 11 06 95 01 01 C7 16

                        //68 CE 00 CE 00 68 C8 03 41 31 D4 00 0D 75 01 01 04 11 15 11 11 06 15 01 01 01 03 11 01 01 01 01 01 01 01 02 02 02 02 02 02 02 02 02 02 03 03 03 03 03 03 03 03 03 03 04 04 54 16
                    }
                }
            ],
            listeners: {
                render: function () {
                    socket.emit('getTmnlList');
                }
            }
        }]
    });
});