/**
 * @overview
 * @author Matthew Caruana Galizia <m@m.cg>
 * @license Creative Commons Attribution 3.0 Unported (CC BY 3.0)
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 * @preserve
 */

'use strict';

/*jshint node:true*/

var tls = require('tls');
var crypto = require('crypto');
var http = require('http');
var inherits = require('util').inherits;

var socksClient = require('socks5-client');

// StartTLS from https://gist.github.com/TooTallNate/848444 and https://github.com/andris9/rai/blob/master/lib/starttls.js
function startTls(socket) {
	var credentials, securePair, clearTextStream;

	credentials = crypto.createCredentials();
	securePair = tls.createSecurePair(credentials, false);

	clearTextStream = pipe(securePair, socket);

	securePair.on('secure', function() {
console.log('got secure');
		var verifyError = securePair.ssl.verifyError();

		if (verifyError) {
			clearTextStream.authorized = false;
			clearTextStream.authorizationError = verifyError;
		} else {
			clearTextStream.authorized = true;
		}
	});

	clearTextStream._controlReleased = true;
}

function pipe(securePair, socket) {
	var clearTextStream, onError, onClose;

	securePair.encrypted.pipe(socket);
	socket.pipe(securePair.encrypted);
console.log('piped');
	securePair.fd = socket.fd;

	clearTextStream = securePair.cleartext;
	clearTextStream.socket = socket;
	clearTextStream.encrypted = securePair.encrypted;
	clearTextStream.authorized = false;

	onError = function(e) {
console.log('socks error', e);
		if (clearTextStream._controlReleased) {
			clearTextStream.emit('error', e);
		}
	};

	onClose = function() {
		socket.removeListener('error', onError);
		socket.removeListener('close', onClose);
	};

	socket.on('error', onError);
	socket.on('close', onClose);

	return clearTextStream;
}

function createConnection(options) {
	var socksSocket;
console.log('creating https');
	socksSocket = socksClient.createConnection(options);
	socksSocket.on('connect', function() {
console.log('starting tls');
		startTls(socksSocket.socket);
	});

	return socksSocket; //securePair.cleartext;
}

function Socks5ClientHttpsAgent(options) {
	http.Agent.call(this, options);

	this.socksHost = options.socksHost || 'localhost';
	this.socksPort = options.socksPort || 1080;
	this.createConnection = createConnection;
}

inherits(Socks5ClientHttpsAgent, http.Agent);

module.exports = Socks5ClientHttpsAgent;
