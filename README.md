v6dns
------
A DNS Server which lets IPv4-prioritized devices to use IPv6 first.

### Installation

Run the following command:

```
npm -g install v6dns
```

### Usage

```
v6dns [host] [port] [server] [serverport]
```
The command above will run a DNS relay listening on host:port, forwarding to server:serverport and treating type A queries specially as mentioned below.

By default, the address is 127.0.0.1, the port is 53, and the server is 8.8.8.8, port of which is also 53. Configuration file can be used to change that default settings as well. For details on that, please see the next section.

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
```

### Procedure

Here's how it works:

 * If it's a type A query, send an AAAA query to Google's server
 * If there's an AAAA record, forward it to client; if not, send the A query
 * For other types of queries, redirect to Google's server as well
 * Send the result to client
