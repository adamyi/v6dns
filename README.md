v6dns
------
[![NPM version][npm-image]][npm-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/v6dns.svg?style=flat-square
[npm-url]: https://npmjs.org/package/v6dns
[david-image]: https://img.shields.io/david/adamyi/v6dns.svg?style=flat-square
[david-url]: https://david-dm.org/adamyi/v6dns
[snyk-image]: https://snyk.io/test/npm/v6dns/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/v6dns
[download-image]: https://img.shields.io/npm/dt/v6dns.svg?style=flat-square
[download-url]: https://npm-stat.com/charts.html?package=v6dns&from=2016-06-24

A DNS Server which lets IPv4-prioritized devices to use IPv6 first, or lets IPv6-prioritized devices to use IPv4 first.

### Installation

Run the following command:

```
npm -g install v6dns
```

### Usage

```
v6dns [host] [port] [server] [serverport] [priority]
```
The command above will run a DNS relay listening on host:port, forwarding to server:serverport and treating queries specially as mentioned below.

By default, the address is 127.0.0.1, the port is 53, and the server is 8.8.8.8, port of which is also 53. Configuration file can be used to change that default settings as well. For details on that, please see the next section.

Here the priority can only be 4 or 6, standing for IPv4 or IPv6. Do not use words like "IPv4", "IPv6", "ipv4", "ipv6", et cetera in configuration. Just use 4 or 6~

It works better with cache. (e.g. using dnsmasq to forward again)

### Configuration
The configuration file is at /etc/v6dns.yaml

Here's a sample configuration:
```
# v6dns Configuration
# The location of this file should be /etc/v6dns.yaml
host:	127.0.0.1
port:	53
server:	8.8.8.8
serverport:	53
priority:	6
```

### Procedure

Here's how it works (when IPv6 is set as priority. IPv4 is similar):

 * If it's a type A query, send an AAAA query to upstream DNS server
 * If there's an AAAA record, forward it to client; if not, send the A query
 * For other types of queries, redirect to upstream DNS server as well
 * Send the result to client

### License

[MIT](LICENSE)
