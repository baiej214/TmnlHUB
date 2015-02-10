var path = require('path'),
    _ = require('underscore'),
    moment = require('moment'),
    db = require('../conn').pool,
    cError = require('../error').Error,
    tools = require('../tools').tools;

exports.handler = function (req, res) {
    try {
        var a1 = req.body.A1, a2 = req.body.A2, date = new Date(req.body.date);

        db.query('select * from frames where A1 = ' + a1 + ' and A2 = ' + a2 + ' and ' +
            'DATE_FORMAT(dts, "%Y-%m-%d") = "' + moment(date).format('YYYY-MM-DD') + '" order by id;',
            function (err, rec) {
                res.send(cError(err) || rec);
            });
    } catch (err) {
        res.send(cError(err));
    }
};