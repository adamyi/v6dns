v6dns
------
A DNS Server which lets IPv4 first devices to use IPv6 first.

### Installation

First make sure you have a safe and uncensored connection to 8.8.8.8, and then run the following command:

```
npm -g install v6dns
```

### Usage

```
v6dns [port] [address]
```
The command above will run a DNS relay listening on address:port, treating type A queries specially as mentioned below.

By default, the address is 127.0.0.1:53

It works better with cache. (e.g. using dnsmasq to forward)

### Procedure

Here's how it works:

 * If it's a type A query, send an AAAA query to Google's server
 * If there's an AAAA record, forward it to client; if not, send the A query
 * For other types of queries, redirect to Google's server as well
 * Send the result to client
