Ext.define('js.deviceSelector', {
    extend: 'Ext.panel.Panel',
    layout: 'fit',
    initComponent: function () {

        this.tbar = [
            {text: '刷新', handler: this.refresh, scope: this},
            '-',
            {text: '全选', handler: this.selectAll, scope: this},
            {text: '反选', handler: this.inverse, scope: this}
            //{
            //    xtype: 'textfield',
            //    fieldLabel: '过滤',
            //    emptyText: '过滤',
            //    listeners: {
            //        scope: this,
            //        buffer: 200,
            //        change: this.filter
            //    }
            //}
        ];

        this.items = {
            xtype: 'checkboxgroup',
            layout: 'column',
            listeners: {
                scope: this,
                render: this.loadCheckbox
            }
        };

        this.callParent(arguments);
    },

    loadCheckbox: function () {
        var group = this.down('checkboxgroup');
        Ext.each(Ext.global.tmnlMgr, function (item) {
            group.add({boxLabel: item.sid, name: item.sid, inputValue: item.sid, width: 100});
        });
    },

    refresh: function () {
        if (Ext.global.tmnlMgr.length <= 0) {
            notice('没有已连接的设备。');
        }else{
            var group = this.down('checkboxgroup');
            group.removeAll();
            this.loadCheckbox();
        }
    },

    selectAll: function () {
        var group = this.down('checkboxgroup');
        Ext.each(group.items.items, function (checkbox) {
            checkbox.setValue(1);
        });
    },

    inverse: function () {
        var group = this.down('checkboxgroup');
        Ext.each(group.items.items, function (checkbox) {
            checkbox.setValue(!checkbox.getValue());
        });
    },

    getValue: function () {
        var group = this.down('checkboxgroup');
        return Ext.Object.getValues(group.getValue());
    },

    filter: function (field, newValue, oldValue) {

    }
});