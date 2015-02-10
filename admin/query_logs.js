var path = require('path'),
    _ = require('underscore'),
    moment = require('moment'),
    db = require('../conn').pool,
    cError = require('../error').Error;

/**
 * action = [Y, M, D];
 */
exports.handler = function (req, res) {
    try {
        var action = req.body.action || req.query.action, value = new Date(req.body.value),
            a1 = req.body.A1, a2 = req.body.A2;
        switch (action.toLowerCase()) {
            case 'all':
                db.query('SELECT DATE_FORMAT(dts,"%Y年") AS name, "y" AS mark, DATE_FORMAT(dts,"%Y") as value ' +
                'from frames group by value;', function (err, rec) {
                    res.send(cError(err) || rec);
                });
                break;
            case 'y':
                db.query('select DATE_FORMAT(dts, "%Y年%m月") as name, "m" as mark, DATE_FORMAT(dts, "%Y-%m") as value from frames ' +
                    'where DATE_FORMAT(dts, "%Y") = "' + moment(value).format('YYYY') + '" group by value;',
                    function (err, rec) {
                        res.send(cError(err) || rec);
                    });
                break;
            case 'm':
                db.query('select DATE_FORMAT(dts, "%Y年%m月%d日") as name, "d" as mark, DATE_FORMAT(dts, "%Y-%m-%d") as value from frames ' +
                    'where DATE_FORMAT(dts, "%Y-%m") = "' + moment(value).format('YYYY-MM') + '" group by value;',
                    function (err, rec) {
                        res.send(cError(err) || rec);
                    });
                break;
            case 'd':
                db.query('select A1, A2, CONCAT(A1,"@",A2) as name, "f" as mark from frames ' +
                    'where DATE_FORMAT(dts, "%Y-%m-%d") = "' + moment(value).format('YYYY-MM-DD') + '" ' +
                    'group by name order by A1, A2;',
                    function (err, rec) {
                        res.send(cError(err) || rec);
                    });
                break;
            case 'f':
                db.query('select * from frames where A1 = ' + a1 + ' and A2 = ' + a2 + ' and ' +
                    'DATE_FORMAT(dts, "%Y-%m-%d") = "' + moment(value).format('YYYY-MM-DD') + '" order by id;',
                    function (err, rec) {
                        res.send(cError(err) || rec);
                    });
                break;
            case 'download':
                value = new Date(req.query.value);
                a1 = req.query.A1;
                a2 = req.query.A2;
                db.query('select * from frames where A1 = ' + a1 + ' and A2 = ' + a2 + ' and ' +
                    'DATE_FORMAT(dts, "%Y-%m-%d") = "' + moment(value).format('YYYY-MM-DD') + '" order by id;',
                    function (err, rec) {
                        if (err) {
                            res.send(cError(err))
                        } else {
                            var str = '', name = moment(value).format('YYYY-MM-DD') + ' ' + a1 + '@' + a2;
                            _.each(rec, function (item) {
                                str += item.req_date + '  REQ: ' + item.req_buff + '\r\n' +
                                item.res_date + '  RES: ' + item.res_buff + '\r\n\r\n';
                            });
                            res.attachment(name + '.log');
                            res.send(str);
                        }
                    });
                break;
        }
    } catch (err) {
        res.send(cError(err));
    }
};