'use strict';

var http = require('http');
var querystring = require('querystring');
//var _ = require('underscore');

var postData = querystring.stringify({
    json: '{"A1":123,"A2":123,"AFN":12,"retry":3,"DU":[{"pn":0,"DT":[{"Fn":14,"DATA":{}}]}]}'
});

var options = {
    hostname: '192.168.1.178',
    port: 3000,
    path: '/set',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
    }
};

function req(i) {
    var req = http.request(options, function (res) {
        //console.log(`STATUS: ${res.statusCode}`);
        //console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log(`${i}BODY: ${chunk}`);
        });
        res.on('end', function () {
            //console.log('No more data in response.')
        });
    });

    req.on('error', function (e) {
        console.error(`problem with request: ${e.message}`);
    });

// write data to request body
    req.write(postData);
    req.end();
}

for (var i = 1; i <= 3; i++) {
    req(i);
}