var _ = require('underscore'),
    cError = require('../error').Error,
    tools = require('../tools').tools,
    BitMap = require('./bitmap').BitMap;

var format_data = function (data) {
    var json = {},
    //由于在电表返回的报文中，0xfe的数量不固定，所以需要先判断出报文中第一个0x68的位置
    //68 00 90 78 56 34 12 68 11 04 【33 36 34 33】 59 16
        first_0x68_position = data.indexOf(0x68),
        data_field_length = data[first_0x68_position + 9],//数据域长度
        data_length = first_0x68_position + 12 + data_field_length,//所转发的645报文长度
        arr = data.splice(0, data_length).splice(first_0x68_position),//得到的arr是不包含0xFE的报文
    //=======================================
        meter_comm_addr = tools.get_meter_comm_addr(arr.slice(1, 7)),//电表地址
        control_code = arr[8],//控制码
    //data_field_length = arr[9],//数据域长度
        data_field = arr.slice(10, arr.length - 2),//数据域
        cs = arr[arr.length - 2],//校验和
    //=======================================
        data_without_cs = arr.slice(0, arr.length - 2);

    if (data_field_length == 0) {
        json = {
            error: true,
            message: 'DATA FILED IS EMPTY.'
        };
    } else if (data_field_length != data_field.length) {
        json = {
            error: true,
            message: 'DATA FIELD LENGTH ERROR'
        };
    } else if (cs != tools.set_cs(data_without_cs)) {
        json = {
            error: true,
            message: 'CHECKSUM ERROR'
        };
    } else {
        json.meter_comm_addr = meter_comm_addr;
        json.C = control_code;
        json.L = data_field_length;
        json.CS = cs;
        //减0x33处理
        json.data = _.map(data_field, function (item) {
            return item - 0x33;
        });
    }

    return json;
};

var _07 = {
        json_hex: function (data) {

        },

        hex_json: function (data) {
            var json = format_data(data), SDID = '';
            if (json.error == true) return json;
            //FE FE FE FE 68 00 90 78 56 34 12 68 11 04 【33 36 34 33】 59 16
            _.each(json.data.splice(0, 4).reverse(), function (item) {
                SDID += tools.zerofill(item.toString(16), 2);
            });
            json.SDID = SDID;
            json.data = _07decode[SDID](json.data);
            return json;
        }
    },

    _97 = {
        json_hex: function (data) {

        },

        hex_json: function (data) {
            var json = format_data(data), SDID = '';
            if (json.error == true) return json;
            //FE FE FE FE 68 00 90 78 56 34 12 68 01 02 【46 C3】 80 16
            _.each(json.data.splice(0, 2).reverse(), function (item) {
                SDID += tools.zerofill(item.toString(16), 2);
            });
            json.SDID = SDID;
            json.data = _97decode[SDID](json.data);
            return json;
        }
    },

    _07encode = {},

    _07decode = {
        '00010000': function (data) {
            return tools.getDFA11(data.shift(), data.shift(), data.shift(), data.shift());
        },
        '00010300': function (data) {
            return tools.getDFA11(data.shift(), data.shift(), data.shift(), data.shift());
        }
    },

    _97encode = {},

    _97decode = {
        '9010': function (data) {
            return tools.getDFA11(data.shift(), data.shift(), data.shift(), data.shift());
        }
    },

    _water = function (data) {
        var bitmap = new BitMap();
        bitmap.create(128, 32, 0xffffff);
        var arr = [];
        for (var i = 0; i < 5; i++) {
            var w = data[2], h = data[3], len = ((w * h) % 8 == 0 ? w * h / 8 : w * h / 8 + 1) + 4;
            arr.push(data.splice(0, len));
        }
        _.each(arr, function (item) {
            var x = item[0], y = item[1], w = item[2], h = item[3] + 1,
                len = (w * h) % 8 == 0 ? w * h / 8 : w * h / 8 + 1,
                pixs = item.slice(4, item.length), index = 0, pix = 1, bit = 7;
            _.times(h, function (i) {
                _.times(w, function (j) {
                    if (bit < 0) {
                        index++;
                        bit = 7;
                    }
                    if (pixs[index] !== undefined) {
                        pix = (pixs[index] >> bit) & 1;
                        if (pix === 0) {
                            bitmap.setPixel(x + j, y + i, 0x000000);
                        }
                        bit--;
                    }
                });
            });
        });
        return bitmap.toBase64();
    };

var handler = function (data) {
    var first_0x68_position = data.indexOf(0x68),
        arr = data.slice(first_0x68_position);
    //水表
    if (arr[0] == 0x68 && arr[1] == 0x10 && arr[6] != 0x68) {
        //FE FE FE 68 10 01 00 00 00 00 00 00 81 63 2F 90 04 00 12 00 00 04 00 08 11 E3 FF FF FF FF 81 19 3C 7E 7E 7E 7E 7C 3C 3D 81 E3 14 04 08 0D C3 81 38 3C 7C 7C 7E 7E 3C 3C 81 C3 E7 24 03 08 11 83 99 3C 7C 7C 7C 7C 7C 3C 38 81 C3 FF FF FF FF E7 35 04 04 0C CC 08 CC CC CC CE 45 02 08 13 81 39 7C 7C FC F9 E3 CF 9F 3F 01 00 FF FF FF FF 83 31 FF 08 16
        var meter_comm_addr = arr.slice(2, 9),
            value = arr.slice(14, 18),
            img = arr.slice(18, arr.length - 2);

        if (_.find(value, function (v) {
                return v > 9
            }) != undefined) {
            value = -1;
        }

        //6位整数，2位小数
        value = tools.getDFA11(value[0], value[1], value[2], value[3]);
        return {
            meter_comm_addr: meter_comm_addr,
            value: value,
            img: _water(img)
        };
    } else {
        //其他，电表等
    }
};

exports._07 = _07;
exports.handler = handler;

////========= test ==============
//
//var data = [0xFE, 0xFE, 0xFE, 0x68, 0x86, 0x11, 0x00, 0x00, 0x00, 0x00, 0x68, 0x81, 0x06, 0x43, 0xC3, 0x3A, 0x97, 0x67, 0x33, 0x5F, 0x16];
//console.log(_97.hex_json(data));
//
////========= test ==============