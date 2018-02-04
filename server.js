const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const io = require('socket.io')().listen(4000);
const express = require('express');
const app =  express();
const mongo =  require('mongodb').MongoClient;
// const dbUrl = 'mongodb://localhost:27017/mongochat';
// const dbName = 'mongochat';
const dbUrl = 'mongodb://sj_joel:joel@ds225038.mlab.com:25038/whatapp_web';
const dbName = 'whatapp_web';
let db;
var port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());  // else req.body is undefined cause body-parser is separated from express from v4.0
app.listen(port, function() {
  console.log('server listening...');
});

// mongo connect
mongo.connect(dbUrl, function(err, database) {
  if(err){
    throw err;
  }

  db = database.db(dbName);
  console.log("Connected successfully to mongochat database");

  //connect to sockets
  io.on('connection', function(socket){
    console.log(socket.id + ' connected')
    socket.on('update-room', function(roomData){
        updateRoom = [roomData.user,roomData.friend].sort().join('-');
        // leave all rooms
        var rooms = io.sockets.adapter.sids[socket.id];
        for(var room in rooms) {
          socket.leave(room); // leave one by one
        }

        socket.join(updateRoom, function(){
          db.collection('chats').find({roomName: updateRoom}).toArray(function(err, result){
            if(result.length !== 0) {
              io.sockets.in(updateRoom).emit('message-history', { 'message-history' : result[0]['messages'] });
            }
          });
        });
        socket.room = updateRoom;
    });

    // Handle input events
    socket.on('roomchat-input', function(data){
      let name = data.name;
      let message = data.message;
      io.sockets.in(socket.room).emit('roomchat-output', data);
        // Insert message into db
        db.collection('chats').update({ roomName: socket.room }, {
          $push: { messages: data }
        },function(err, res) {
          if(err) {
            throw err;
          }
        });
    });

  });
});

app.post('/api/login', function (req, res){
  let { userName, password } = req.body;
  let usersCollection = db.collection('users');
  usersCollection.find({ name: userName , password: password }).toArray(function(err,result) {
    if (err)
      throw err;
    if (result.length == 0){
      res.json({'success':false, 'message': 'Invalid login Information'});
    }
    else {
      res.cookie('mongo_chat_user', userName);
      res.json({'success': true });
    }
  });
});

app.post('/api/signout', function(req, res){
  res.clearCookie('mongo_chat_user');
  res.json({'success': true, 'message': 'Signout Successful' });
});

app.post('/api/fetch_users', function(req, res){
  db.collection('users').find({}).toArray(function(err, result){
    if(result.length !== 0) {
      res.json({ 'users' : result });
    }
  });
});


