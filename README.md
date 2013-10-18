# SOCKS5 HTTPS Client #

[![Build Status](https://travis-ci.org/mattcg/socks5-https-client.png?branch=master)](https://travis-ci.org/mattcg/socks5-https-client)

SOCKS v5 HTTPS client implementation in JavaScript for Node.js.

```js
var shttps = require('socks5-https-client');

shttps.get({
	hostname: 'encrypted.google.com',
	path: '/',
	rejectUnauthorized: false // True by default.
}, function(res) {
	res.setEncoding('utf8');
	res.on('readable', function() {
		console.log(res.read()); // Log response to console.
	});
});
```

Specify the `socksHost` and `socksPort` options if your SOCKS server isn't running on `localhost:1080`. Tor runs its SOCKS server on port `9050` by default, for example.

You may also pass a URL as the first argument to `get` or `request`, which will be parsed using `url.parse`.

## Using with Tor ##

Works great for making HTTPS requests through [Tor](https://www.torproject.org/) (see bundled example).

## HTTP ##

This client only provides support for making HTTPS requests. See [socks5-http-client](https://github.com/mattcg/socks5-http-client) for an HTTP implementation.

## License ##

Copyright © 2013 [Matthew Caruana Galizia](http://twitter.com/mcaruanagalizia), licensed under an [MIT license](http://mattcg.mit-license.org/).
