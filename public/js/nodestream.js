(function($){
  
  var socket,
      subscriptions = [];
  
  var oldMessage = io.Socket.prototype._onMessage;

  io.Socket.prototype._onMessage = function(msg){
    if (typeof msg == 'object' && 'nodestream' in msg){
      Nodestream.handle(msg.type, msg.args);
    } else {
      oldMessage.apply(this, arguments);
    }
  };
  
  Nodestream = function(s){
    socket = s;
    s.on('connect', function(){
      subscriptions.forEach(function(name){
        s.send({
          nodestream: 1,
          susbscribe: s[0]
        })
      });
    })
  };
  
  Nodestream.handle = function(type, args){
    Nodestream.actions[type].apply(this, args);
  };
  
  Nodestream.subscribe = function(name, type){
    subscriptions.push([name, type]);
  };
  
  Nodestream.actions = {
    
    remove: function(id){
      $('#' + id).animate({'background-color': '#ffff88'}, 500, function(){
        $('#' + id).remove();
      })
    },
    
    repaint: function(id, html){
      $('#' + id).html(html).animate({'background-color': '#ffff88'}, 500);
    },
    
    append: function(id, html, top){
      $('#' + id + ' .placeholder').remove();
      if (top){
        $('#' + id).prepend(html);
      } else {
        $('#' + id).append(html);
      }
    }
    
  }
  
})(jQuery);