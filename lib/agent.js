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
function startTls(socket, onSecure) {
	var credentials, securePair, clearTextStream;

	socket.ondata = null;
	socket.removeAllListeners('data');
	credentials = crypto.createCredentials();
	securePair = tls.createSecurePair(credentials, false);

	clearTextStream = pipe(securePair, socket);

	securePair.on('secure', function() {
		var verifyError = securePair.ssl.verifyError();

		if (verifyError) {
			clearTextStream.authorized = false;
			clearTextStream.authorizationError = verifyError;
		} else {
			clearTextStream.authorized = true;
		}

		onSecure();
	});

	clearTextStream._controlReleased = true;

	return securePair;
}

function forwardEvents(events, emitterSource, emitterDestination) {
	var i, l, map = [], name, handler;
	var forwardEvent = function() {
		this.emit.apply(this, arguments);
	};

	for (i = 0, l = events.length; i < l; i++) {
		name = events[i];
		
		handler = forwardEvent.bind(emitterDestination, name);
		
		map.push(name);
		emitterSource.on(name, handler);
	}
	
	return map;
}

function removeEvents(map, emitterSource) {
	for (var i = 0, l = map.length; i < l; i++){
		emitterSource.removeAllListeners(map[i]);
	}
}

function pipe(securePair, socket) {
	var clearTextStream, onError, onClose, eventsMap;

	securePair.encrypted.pipe(socket);
	socket.pipe(securePair.encrypted);

	securePair.fd = socket.fd;

	clearTextStream = securePair.cleartext;

	clearTextStream.socket = socket;
	clearTextStream.encrypted = securePair.encrypted;
	clearTextStream.authorized = false;

	onError = function(e) {
		if (clearTextStream._controlReleased) {
			clearTextStream.emit('error', e);
		}
	};

	eventsMap = forwardEvents(['timeout', 'end', 'close', 'drain', 'error'], socket, clearTextStream);

	onClose = function() {
		socket.removeListener('error', onError);
		socket.removeListener('close', onClose);
		removeEvents(eventsMap, socket);
	};

	socket.on('error', onError);
	socket.on('close', onClose);

	return clearTextStream;
}

function createConnection(options) {
	var socksSocket, handleSocksConnectToHost;

	socksSocket = socksClient.createConnection(options);

	handleSocksConnectToHost = socksSocket.handleSocksConnectToHost;
	socksSocket.handleSocksConnectToHost = function() {
		var securePair = startTls(socksSocket.socket, function() {
			handleSocksConnectToHost.call(socksSocket);
		});

		socksSocket.socket = securePair.cleartext;
	};

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
