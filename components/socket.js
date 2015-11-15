module.exports = function(){
  var socket = require('../node_modules/socket.io-client/socket.io.js')();
  return socket;
}();
