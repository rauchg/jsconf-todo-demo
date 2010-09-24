// socket.io additions
var Listener = require('socket.io').Listener;

Listener.prototype.nodestream = function(){
  if (!this._nodestream){
    var self = this;
    this.on('connection', function(c){
      c.on('message', function(msg){
        if (typeof msg == 'object' && 'nodestream' in msg){
          c._nodestream = true;
          self._nodestreamHandle(c, msg);
        }
      });
      c.on('disconnect', function(){
        
      });
    });
    this._nodestream = true;
  }
  return this;
};

Listener.prototype._nodestreamHandle = function(client, message){
  console.log('nodestream message received');
};

Listener.prototype._nodestreamSend = function(){
  
};

// nodestream api
module.exports = {
  
  emit: function(){
    // notify suscriptors
  }
  
}

// filters
var filters = require('jade/filters');

filters.realtime = function(){
  
};