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
  
  getters: {
    id: function(){
      return this._id.toHexString();
    },
    
    description_formatted: function(v){
      return this.description ? '<p>' + this.description.replace(/\n/g, '</p><p>') + '</p>' : '';
    }
  },
  
  methods: {
    
    save: function(fn){
      if (this.isNew){
        nodestream.emit('item.new', this);
      } else {
        nodestream.emit('item.edit.' + this.id, this);
      }
      return this.__super__(fn);
    },
    
    remove: function(fn){
      if (!this.isNew) nodestream.emit('item.remove.' + this.id, this);
      return this.__super__(fn);
    }
    
  }
  
});

// app initialization
var app = express.createServer(
  express.staticProvider(__dirname + '/public'),
  express.bodyDecoder(),
  express.cookieDecoder(),
  express.session()
);

app.configure(function(){
  Item = db.model('Item');
});

// routes
app.get('/', function(req, res){
  
  Item.find({}).sort([['_id', -1]]).all(function(items){
    res.render('index.jade', {locals: {items: items, connections: connections}, layout: false});
  });
  
});

app.get('/edit/:id', function(req, res){
  
  Item.findById(req.param('id'), function(item){
    res.render('edit.jade', {locals: {item: item}, layout: false});
  });
  
});

app.post('/edit/:id', function(req, res){
  
  Item.findById(req.param('id'), function(item){
    item.title = req.body.title;
    item.due = req.body.due;
    item.description = req.body.description;
    item.save(function(){
      res.redirect('/');
    });
  });
  
});

app.post('/add', function(req, res){
  
  var item = new Item();
  item.merge(req.body);
  item.save(function(){
    res.redirect('/');
  });
  
});

app.get('/delete/:id', function(req, res){
  
  Item.findById(req.param('id'), function(item){
    item.remove(function(){
      res.redirect('/');
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