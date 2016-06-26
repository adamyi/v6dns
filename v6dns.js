#! /usr/bin/env node

"use strict";

var ver = "1.0.4";

var dns = require('native-dns'),
  async = require('async'),
  tcpserver = dns.createTCPServer(),
  server = dns.createServer(),
  etc = require('etc'),
  yml = require('etc-yaml');

var onMessage = function (request, response) {
  //console.log('request from:', request.address);

  var f = [];
  request.question.forEach( function(question) {
    if ( conf.get('priority') == 6 && question.type == dns.consts.NAME_TO_QTYPE.A )
      f.push(function(cb){ testAAAA(question, f, response, cb)});
    else if ( conf.get('priority') == 4 && question.type == dns.consts.NAME_TO_QTYPE.AAAA )
      f.push(function(cb){ testAAAA(question, f, response, cb)});
    else
      f.push(function(cb){ proxy(question, response, cb)});
  });

  async.series(f, function() { response.send(); });
};

var onError = function (err, buff, req, res) {
  console.log(err.stack);
};

var onListening = function () {
  console.log('server listening on', this.address());
  //this.close();
};

var onSocketError = function (err, socket) {
  console.log(err);
};

var onClose = function () {
  console.log('server closed', this.address());
};

/*var onTimeout = function() {
  console.log('Time out');
};*/

var proxy = function(question, response, cb) {
  //console.log('proxying', question.name);
  var request = dns.Request({
    question: question,
    server: authority,
    timeout: 3000
  });

  request.on('message', function(err, msg) {
    //console.log(msg);
    msg.answer.forEach(function(a){ response.answer.push(a)});
  });
  
  request.on('error', onError);
  //request.on('timeout', onTimeout);

  request.on('end', cb);
  request.send();
}

var testAAAA = function(question, f, response, cb) {
  //console.log('Testing AAAA for', question.name);
  var request = dns.Request({
    question: question,
    server: authority,
    timeout: 3000
  });
  if (conf.get('priority') == 6)
    request.question.type = dns.consts.NAME_TO_QTYPE.AAAA;
  else
    request.question.type = dns.consts.NAME_TO_QTYPE.A;

  request.on('message', function(err, msg) {
    //console.log(msg.answer.length);
    if (conf.get('priority') == 6)
      question.type = dns.consts.NAME_TO_QTYPE.A;
    else
      question.type = dns.consts.NAME_TO_QTYPE.AAAA;
    var t = true;
    msg.answer.forEach(function(a) {
      if ( conf.get('priority') == 6 && a.type == dns.consts.NAME_TO_QTYPE.AAAA ) //To Solve the other type of protocol Only CNAME Case
        t = false;
      else if ( conf.get('priority') == 4 && a.type == dns.consts.NAME_TO_QTYPE.A )
        t = false;
    });
    if (t)
      proxy(question, response, cb);
    else
      cb();
  });

  request.on('error', onError);
  //request.on('timeout', onTimeout);

  request.send();

  //question.type = dns.consts.NAME_TO_QTYPE.A;
}

var conf = etc().use(yml);
conf.argv();
if (typeof conf.get('_')[0] != 'undefined')
  conf.set('host', conf.get('_')[0]);
if (typeof conf.get('_')[1] != 'undefined')
  conf.set('port', conf.get('_')[1]);
if (typeof conf.get('_')[2] != 'undefined')
  conf.set('server', conf.get('_')[2]);
if (typeof conf.get('_')[3] != 'undefined')
  conf.set('serverport', conf.get('_')[3]);
if (typeof conf.get('_')[4] != 'undefined')
  conf.set('priority', conf.get('_')[4]);

conf.file('/etc/v6dns.yaml');
conf.add({
  host: '127.0.0.1',
  port: 53,
  server: '8.8.8.8',
  serverport: 53,
  priority: 6
});

conf.clear('_');
conf.clear('$0');

if (conf.get('priority') != 4 && conf.get('priority') != 6) {
  console.error('Priority must be 4 or 6!');
  process.exit();
}

console.log('v6dns', ver, '\nLovely presented by adamyi. Under MIT License.\nUsing configuration: \n', conf.toJSON());

var authority = { address: conf.get('server') , port: conf.get('serverport'), type: 'udp' };

server.on('request', onMessage);
server.on('error', onError);
server.on('listening', onListening);
server.on('socketError', onSocketError);
server.on('close', onClose);

server.serve(conf.get('port'), conf.get('host'));

tcpserver.on('request', onMessage);
tcpserver.on('error', onError);
tcpserver.on('listening', onListening);
tcpserver.on('socketError', onSocketError);
tcpserver.on('close', onClose);

tcpserver.serve(conf.get('port'), conf.get('host'));
