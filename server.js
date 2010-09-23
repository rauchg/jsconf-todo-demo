require.paths.unshift(__dirname + '/support/express/lib/',
                      __dirname + '/support/socket.io/lib/',
                      __dirname + '/support/mongoose/',
                      __dirname + '/support/nodestream',
                      __dirname + '/support/express/support/jade/lib/');

var express = require('express'),
    mongoose = require('mongoose').Mongoose,
    db = mongoose.connect('mongodb://localhost/todo'),
    io = require('socket.io'),
    nodestream = require('nodestream');

mongoose.model('Item', {
  
  properties: ['title', 'description'],
  
  getters: {
    id: function(){
      return this._id.toHexString();
    }
  },
  
  methods: {
    
    save: function(){
      if (this.isNew){
        nodestream.emit('item.new', this);
      } else {
        nodestream.emit('item.edit.' + this.id, this);
      }
      return this.__super__();
    },
    
    remove: function(){
      if (!this.isNew) nodestream.emit('item.delete.' + this.id, this);
      return this.__super__();
    }
    
  }
  
});
    
var app = express.createServer(
  express.staticProvider(__dirname + '/public'),
  express.cookieDecoder(),
  express.session()
);

app.get('/', function(req, res){
  
  db.model('Item').find(function(items){
    res.render('index.jade', {locals: {items: items, connections: connections}})
  });
  
});

app.post('/edit', function(req, res){
  
  db.model('Item').findById(req.body.id, function(item){
    item.title = req.body.title;
    item.description = req.body.description;
    item.save(function(){
      res.send(200);
    });
  });
  
});

app.get('/delete/:id', function(req, res, params){
  
  db.model('Item').findById(params.id, function(item){
    item.remove(function(){
      res.send(200);
    });
  });
  
});

app.listen(80).nodestream();

var sio = io.listen(app),
    connections = 0;

sio.on('connection', function(c){
  nodestream.emit('connections', ++connections);
  
  c.on('disconnect', function(){
    nodestream.emit('connections', --connections);
  });
});

nodestream(sio);