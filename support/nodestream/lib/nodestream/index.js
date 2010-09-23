var encoded = {};

var subscriptions = {};

var io;

module.exports = function(_io){
  io = _io;
  io.on('connection', function(c){
    var cleanup = [];
    c.on('message', function(v){
      if (typeof v == 'object' && 'nodestream' in v){
        if (v.subscribe){
          if (v.subscribe in encoded){
            if (!(encoded[v.subscribe] in subscriptions))
              subscriptions[encoded[v.subscribe]] = {};
            cleanup.push(v.subscribe);
            subscriptions[encoded[v.subscribe]][c.sessionId] = true;
          }
        } 
      }
    });
    c.on('disconnect', function(){
      for (var i = 0, l = cleanup.length; i < l; i++){
        delete subscriptions[encoded[cleanup[i]]][c.sessionId];
        delete encoded[cleanup[i]];
      }
    });
  })
};

module.exports.emit = function(ev){
  if (ev in subscriptions){
    var keys = Object.keys(subscriptions[ev]);
    for (var i = 0, l = keys.length; i < l; i++){
      if (keys[i] in io.clientsIndex){
        io.clientsIndex[ keys[i] ].send({
          type: encodedTypes[   ] ],
          args: [ jade.render(  ) ]
        })
      } else {
        console.error('Unproper disconnection cleanup. ' + subscriptions[ev][i] + ' not found in clientsIndex');
      }
    }
  }
  
};

var crypto = require('crypto');
    Server = require('express/server');

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

Server.prototype.nodestream = function(){

  this.dynamicHelpers({
    
    realtime: function(req, res){
      function encode(ev, type, partial){
        var hash = md5(req.sessionId + ev + partial);
        encoded[hash] = {ev: ev, type: type, partial: partial};
      };
      
      return function(partial, options){
        
        if (Array.isArray(options.value) && options.value.length){
          if (options.append){
            var append = encode(options.append, 'append', partial);
          
            ret = '<div class="nodestream_append_'+ append +'">';
            ret += '<script>NodeStream.register("'+ append +'")</script>';
          }
          
          // collection          
          var id = options.id || 'id';
          
          options.value.forEach(function(v){
            if (!v || ( !options.repaint && !options.remove)) return;
            
            var ret2 = '';
            ret += '<div class="';
            
            if (options.repaint){
              ret += encode(options.repaint + '.' + v[id], 'repaint', partial) + ' '
              ret2 += '<script>NodeStream.register("'+ encode(options.repaint + '.' + v[id], 'repaint', partial) +'")</script>';
            }
            
            if (options.remove){
              ret += encode(options.remove + '.' + v[id], 'remove', partial);
              ret2 += '<script>NodeStream.register("'+ encode(options.remove + '.' + v[id], 'remove', partial) +'")</script>';
            }
            
            ret += '">' + ret2 + res.partial(partial, {locals: {obj: v} }) + '</div>';
            
          });
          
          if (options.append) ret += '</div>';
        } else {
          // single paint
          var ret2 = '';
          ret += '<div class="';
          
          if (options.repaint){
            ret += encode(options.repaint, 'repaint', partial) + ' '
            ret2 += '<script>NodeStream.register("'+ encode(options.repaint, 'repaint', partial) +'")</script>';
          }
          
          if (options.remove){
            ret += encode(options.remove, 'remove', partial);
            ret2 += '<script>NodeStream.register("'+ encode(options.remove, 'remove', partial) +'")</script>';
          }
          
          ret += '">' + ret2 + res.partial(partial, {locals: {obj: v} }) + '</div>';
        }
        
        return ret;
      };
    }
    
  });

}