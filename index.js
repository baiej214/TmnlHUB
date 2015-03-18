var moment = require('moment'),
    tmnl_server = require('./tmnl/tmnl_server'),
    web_server = require('./web/web_server'),
    broadcast = require('./web/broadcast'),
    admin_server = require('./admin/admin_server'),
    cError = require('./error').Error,
    conn = require('./conn').pool;

tmnl_server.start();
web_server.start();
broadcast.start();
admin_server.start();

conn.query('insert into sys_start_time set time = ?', moment().format('YYYY-MM-DD HH:mm:ss'));

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});