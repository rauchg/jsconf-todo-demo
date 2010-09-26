// require.paths are needed until these projects become stable in npm
require.paths.unshift(__dirname + '/support/express/lib/',
                      __dirname + '/support/express/support/connect/lib',
                      __dirname + '/support/socket.io/lib/',
                      __dirname + '/support/nodestream/lib/',
                      __dirname + '/support/mongoose/',
                      __dirname + '/support/jade/lib/');

var express = require('express'),
    mongoose = require('mongoose').Mongoose,
    db = mongoose.connect('mongodb://localhost/todo'),
    io = require('socket.io'),
    node = require('nodestream'),
    connections = 0;

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
      nodestream.emit('item.edit.' + item.id, item);
      res.send(200);
    });
  });
  
});

app.post('/add', function(req, res){
  
  var item = new Item();
  item.merge(req.body);
  item.save(function(){
    nodestream.emit('item.new', item);
    res.send(200);
  });
  
});

app.get('/delete/:id', function(req, res){
  
  Item.findById(req.param('id'), function(item){
    item.remove(function(){
      nodestream.emit('item.remove.' + item.id);
      res.send(200);
    });
  });
  
});

app.listen(80);

var nodestream = io.listen(app).nodestream()
  .on('connect', function(){
    connections++;
    this.emit('connections', connections);
  })
  .on('disconnect', function(){
    connections--;
    this.emit('connections', connections);
  });
  
process.on('uncaughtException', function(e){
  console.error(e.stack || e);
});