'use strict';

/*jshint node:true*/

var https = require('./index');

var options = {
	socksPort: 9050, // Tor
	port: 443,
	hostname: 'www.google.com',
	protocol: 'https:',
	path: '/'
};

var req = https.request(options, function(res) {
	console.log('STATUS: ' + res.statusCode);
	console.log('HEADERS: ' + JSON.stringify(res.headers));
	res.setEncoding('utf8');
	res.on('data', function (chunk) {
		console.log('BODY: ' + chunk);
	});
});

req.on('error', function(e) {
	console.log('problem with request: ' + e.message);
});

// write data to request body
req.end();
