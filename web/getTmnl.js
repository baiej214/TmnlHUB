var tmnlMgr = require('../tmnl/tmnl_manager');

exports.handler = function (req, res) {
    res.json(tmnlMgr.map());
};