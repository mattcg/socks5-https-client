/**
 * @overview
 * @author Matthew Caruana Galizia <m@m.cg>
 * @license MIT
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

'use strict';

/*jshint node:true*/

var https = require('https');
var url = require('url');

var Socks5ClientHttpsAgent = require('./lib/Agent');

exports.request = function(options, cb) {
	var agent, version;

	if (typeof options === 'string') {
		options = url.parse(options);
	}

	// Node v0.12.0 needs 'http:' for some reason.
	version = process.version.substr(1).split('.');
	if (version[0] === '0' && version[1] === '12') {
		options.protocol = 'http:';
	} else {
		options.protocol = 'https:';
	}

	// It also requires the port to be specified.
	if (!options.port) {
		options.port = 443;
	}

	agent = new Socks5ClientHttpsAgent(options);
	options.agent = agent;

	return https.request(options, cb);
};

exports.get = function(options, cb) {
	var req = exports.request(options, cb);

	req.end();

	return req;
};
