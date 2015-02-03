var Client = require('ftp');
var fs = require('fs');

var c = new Client();
c.on('ready', function () {
    c.get('MAING-malin.UPG', function (err, stream) {
        if (err) throw err;
        stream.once('close', function () {
            c.end();
        });
        stream.pipe(fs.createWriteStream('MAING-malin-copy.UPG'));
    });
});
// connect to localhost:21 as anonymous
c.connect({
    host: '127.0.0.1',
    user: 'admin',
    password: 'admin',
    port:5804
});//command not implemented