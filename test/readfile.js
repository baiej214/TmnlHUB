var fs = require('fs');
fs.open('./MAING-malin.UPG', 'r', function (err, fd) {
    if (err) {
        console.error(err);
        return;
    }
    var i = 0;
    while (i < 100) {
        fs.read(fd, new Buffer(10), 0, 10, null, function (err, bytesRead, buffer) {
            if (err) {
                console.error(err);
                return;
            }
            console.log('bytesRead: ' + bytesRead);
            console.log(buffer);
        });
        i++;
    }
});