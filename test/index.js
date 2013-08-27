/**
 * @overview
 * @author Matthew Caruana Galizia <m@m.cg>
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 * @license MIT
 * @preserve
 */

'use strict';

/*jshint node:true*/
/*global test, suite*/

var assert = require('assert');
var https = require('../');

var version = process.version.substr(1).split('.');
var readableStreams = version[0] > 0 || version[1] > 8;

suite('socks5-https-client tests', function() {
	this.timeout(5000);

	test('simple request', function(done) {
		https.request({
			socksPort: 9050, // Tor
			port: 443,
			hostname: 'en.wikipedia.org',
			protocol: 'https:',
			path: '/wiki/SOCKS'
		}, function(res) {
			var data = '';

			assert.equal(res.statusCode, 200);
			res.setEncoding('utf8');

			if (readableStreams) {
				res.on('readable', function() {
					data += res.read();
				});
			} else {
				res.on('data', function(chunk) {
					data += chunk;
				});
			}

			res.on('end', function() {
				assert(-1 !== data.indexOf('<html'));
				assert(-1 !== data.indexOf('</html>'));

				done();
			});
		}).on('error', function(err) {
			assert.ifError(err);
		}).end();
	});
});
