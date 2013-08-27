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

suite('socks5-https-client tests', function() {
	this.timeout(10000);

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

			res.on('readable', function() {
				data += res.read();
			});

			res.on('end', function() {
				assert(-1 !== data.indexOf('<html'));
				assert(-1 !== data.indexOf('</html>'));

				done();
			});
		}).end();
	});
});
