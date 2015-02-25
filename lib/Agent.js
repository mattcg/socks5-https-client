/**
 * @overview
 * @author Matthew Caruana Galizia <m@m.cg>
 * @license MIT
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

'use strict';

/*jshint node:true*/

var http = require('http');
var inherits = require('util').inherits;

var socksClient = require('socks5-client');
var starttls = require('starttls');

function createConnection(options) {
	var socksSocket, handleSocksConnectToHost;

	socksSocket = socksClient.createConnection(options);

	handleSocksConnectToHost = socksSocket.handleSocksConnectToHost;
	socksSocket.handleSocksConnectToHost = function() {
		var verifyHost, securePair;

		if (options.rejectUnauthorized !== false) {
			verifyHost = options.hostname;
		}

		securePair = starttls({
			socket: socksSocket.socket,
			host: verifyHost
		}, function(err) {
			var clearText;

			// Add authorization properties to the client object as libraries like 'request' expect them there.
			clearText = this.cleartext;
			socksSocket.authorized = clearText.authorized;
			socksSocket.authorizationError = clearText.authorizationError;

			if (err) {
				return socksSocket.emit('error', err);
			}

			socksSocket.socket = clearText;

			handleSocksConnectToHost.call(socksSocket);
		});

		// The Socks5ClientSocket constructor adds an 'error' event listener to the original socket.
		// That behaviour needs to be mimicked by adding a similar listener to the cleartext stream, which replaces the original socket.
		securePair.cleartext.on('error', function(err) {
			socksSocket.emit('error', err);
		});
	};

	return socksSocket;
}

function Agent(options) {
	http.Agent.call(this, options);

	this.socksHost = options.socksHost || 'localhost';
	this.socksPort = options.socksPort || 1080;

	this.defaultPort = 443;
	this.protocol = 'https:';

	this.createConnection = createConnection;
}

inherits(Agent, http.Agent);

module.exports = Agent;
