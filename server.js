// some paths 
require.paths.unshift(__dirname + '/support/express/lib/',
                      __dirname + '/support/express/support/connect/lib',
                      __dirname + '/support/socket.io/lib/',
                      __dirname + '/support/nodestream/lib/',
                      __dirname + '/support/mongoose/',
                      __dirname + '/support/express/support/jade/lib/');

// requires
var express = require('express'),
    mongoose = require('mongoose').Mongoose,
    db = mongoose.connect('mongodb://localhost/todo'),
    io = require('socket.io'),
    nodestream = require('nodestream');

// model
mongoose.model('Item', {
  
  properties: ['title', 'description', 'due', ['tags']],
  
  cast: { due: Date },
  
  getters: {
    id: function(){
      return this._id.toHexString();
    },
    
    description_formatted: function(v){
      return '<p>' + v.replace(/\n/g, '</p><p>') + '</p>';
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
      if (!this.isNew) nodestream.emit('item.remove.' + this.id, this);
      return this.__super__();
    }
    
  }
  
});

// app initialization
var app = express.createServer(
  express.staticProvider(__dirname + '/public'),
  express.cookieDecoder(),
  express.session()
);

// routes
app.get('/', function(req, res){
  
  db.model('Item').find({}).all(function(items){
    res.render('index.jade', {locals: {items: items, connections: connections}, layout: false});
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

app.listen(80);

// socket.io
var sio = io.listen(app).nodestream();
var connections = 0;

sio.on('connection', function(c){
  nodestream.emit('connections', ++connections);
  
  c.on('disconnect', function(){
    nodestream.emit('connections', --connections);
  });
});