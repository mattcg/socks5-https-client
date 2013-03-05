/**
 * @overview
 * @author Matthew Caruana Galizia <m@m.cg>
 * @license Creative Commons Attribution 3.0 Unported (CC BY 3.0)
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 * @version 0.1.0
 * @preserve
 */

'use strict';

/*jshint node:true*/

var http = require('http');
var inherits = require('util').inherits;

var socksClient = require('socks5-client');
var startTls = require('starttls').startTls;

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
