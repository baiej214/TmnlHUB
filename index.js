var tmnl_server = require('./tmnl/tmnl_server'),
    web_server = require('./web/web_server'),
    broadcast = require('./web/broadcast'),
    admin_server = require('./admin/admin_server'),
    cError = require('./error').Error;

require('./conn');
tmnl_server.start();
web_server.start();
broadcast.start();
admin_server.start();

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});