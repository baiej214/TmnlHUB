var ftpd = require('ftpd');
var fs = require('fs');

var options = {
    user: 'admin',
    pass: 'admin',
    //pasvPortRangeStart: 1000,
    //pasvPortRangeEnd: 5000,
    getInitialCwd: function (connection, callback) {
        var userPath = process.cwd() + '/' + connection.username;
        fs.exists(userPath, function (exists) {
            exists ? callback(null, userPath) : callback('path does not exist', userPath);
        });
    },
    getRoot: function (user) {
        return '.';
    }
};

var host = '127.0.0.1';

var server = new ftpd.FtpServer(host, options);

server.on('client:connected', function (conn) {
    var username;
    console.log('Client connected from ' + conn.socket.remoteAddress);
    conn.on('command:user', function (user, success, failure) {
        username = user;
        (user == 'admin') ? success() : failure();
    });
    conn.on('command:pass', function (pass, success, failure) {
        // check the password
        (pass == 'admin') ? success(username) : failure();
    });
});

server.listen(5804);
console.log('FTPD listening on port 5804');