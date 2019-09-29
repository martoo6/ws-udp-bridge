// const OSC = require('osc-js');

// const [
//   wsHost = 'localhost',
//   wsPort = 8080,
//   udpClientHost = 'localhost',
//   udpClientPort = 41235,
//   udpServerHost = 'localhost',
//   udpServerPort = 41234
// ] = process.argv.slice(2);

var osc = require('osc'),
  WebSocket = require('ws');

var getIPAddresses = function() {
  var os = require('os'),
    interfaces = os.networkInterfaces(),
    ipAddresses = [];

  for (var deviceName in interfaces) {
    var addresses = interfaces[deviceName];

    for (var i = 0; i < addresses.length; i++) {
      var addressInfo = addresses[i];

      if (addressInfo.family === 'IPv4' && !addressInfo.internal) {
        ipAddresses.push(addressInfo.address);
      }
    }
  }

  return ipAddresses;
};

var udp = new osc.UDPPort({
  localAddress: '0.0.0.0',
  localPort: 7400,
  remoteAddress: '127.0.0.1',
  remotePort: 12000
});

udp.on('ready', function() {
  var ipAddresses = getIPAddresses();
  console.log('Listening for OSC over UDP.');
  ipAddresses.forEach(function(address) {
    console.log(' Host:', address + ', Port:', udp.options.localPort);
  });
  console.log(
    'Broadcasting OSC over UDP to',
    udp.options.remoteAddress + ', Port:',
    udp.options.remotePort
  );
});

udp.open();

var wss = new WebSocket.Server({
  port: 8081
});

wss.on('connection', function(socket, req) {
  console.log(
    `A Web Socket connection has been established: ${req.connection.remoteAddress}!`
  );
  var socketPort = new osc.WebSocketPort({
    socket: socket
  });

  var relay = new osc.Relay(udp, socketPort, {
    raw: true
  });
});
