/**
 * 采集，下发
 * ----------------------------------------------------------------------------------------
 * var packet = {
 *    A1: 4103,                        //行政区划码
 *    A2: 123,                         //终端地址
 *    A3: 0,                           //主站地址和组地址标志
 *    AFN: 3,                          //AFN
 *    DU: [{                           //数据单元
 *        pn: 0,                       //pn
 *        DT: [{                       //信息类
 *            Fn: 10,                  //Fn
 *            DATA: []                 //数据，具体格式参考协议规定，可赋值为各种数据类型
 *        }]
 *    }],
 *    AUX: {                           //附加信息域
 *        PW: 0,                       //消息认证码字段（下行）
 *        EC: 1,                       //事件计数器（上行）
 *        Tp: '2014-10-10 10:10:10'    //时间标签
 *    },
 *    retry: 1                         //重发次数
 * };
 * ----------------------------------------------------------------------------------------
 */
var _ = require('underscore'),
    tmnl_mgr = require('../tmnl/tmnl_manager'),
    cError = require('../error').Error,
    tools = require('../tools').tools;

exports.handler = function (req, res) {
    try {
        var json = tools.format_json(req.body.json),
            A1 = json.A1, A2 = json.A2, sid = A1 + '@' + A2, tmnl = tmnl_mgr.get(sid);
        if (!tmnl) {
            res.json({error: true, A1: A1, A2: A2, message: 'CAN NOT FIND THE DEVICE'});
        } else {
            try {
                tmnl.pkt_mgr.req(json, function (err, data) {
                    res.send(err || data);
                });
            } catch (err) {
                err.A1 = A1;
                err.A2 = A2;
                res.send(cError(err));
            }
        }
    } catch (err) {
        res.send(cError(err));
    }

    /** TODO
     * JSON转成HEX
     * 发送，等待回调结果
     * 返回结果
     * 错误信息必须自定义成一套完善的结构
     */
};