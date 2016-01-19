var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http);

var CookieParser = require('cookie-parser');
var ECT = require('ect');
var ectRenderer = ECT({ watch: true, root: __dirname + '/views', ext : '.ect' });
var validator = require('validator');

app.use(express.static('public'));
app.use(express.static('lib'));
app.use(CookieParser());
app.engine('ect', ectRenderer.render);
app.set('view engine', 'ect');

var async = require('async');

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
  socketid: String,
  name: String
});
mongoose.model('User', UserSchema);
var User;

var LogSchema = new Schema({
  name: String,
  msg: String,
  tag: String,
  question: Boolean,
  reply_to: String,
  date: Date
});
LogSchema.pre('save', function(next){
  this.date = new Date();
  next();
});
mongoose.model('Log', LogSchema);
var Log;

mongoose.connect('mongodb://localhost/chatdb');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected to 'chatdb' database");
  User = mongoose.model('User');
  User.remove({}, function(err) {
    console.log('Reflesh User');
    if (err) {
      console.log(err);
    }
  });
  Log = mongoose.model('Log');
});

app.get('/', function(req, res){
  res.render('chat', {name: req.cookies.name});
});

app.get('/readonly', function(req, res){
  res.render('readonly');
});

app.post('/users/:name', function(req, res){
  var name = validator.escape(req.params.name);
  var query = User.where({name: name});
  query.findOne().lean().exec(function(err, result){
    if (result !== null){
      res.status(400).json({type: "error", msg: "すでにその名前は使われています"});
    } else {
      res.status(200).cookie('name', name).json({type: "OK"});
    }
  });
});

app.get('/messages/:id', function(req, res){
  var _id = req.params.id;
  var logquery = Log.where({});
  logquery.findOne({_id: _id}, null).lean().exec(function(err, result){
    if (err) {
      res.status(400).json({type: "error", msg: "メッセージが存在しません"});
    } else {
      res.status(200).json(result);
    }
  });
});

var updateMemberList = function(socket, io){
  checkMemberList(socket, io);
  var listquery = User.where({}).select('name');
  listquery.find().lean().exec(function(err, result){
    if (err) {
      socket.emit('system', "DB接続エラーです。管理者に問い合わせて下さい");
    } else {
      io.emit('member list', result);
    }
  });
};

var checkMemberList = function(socket, io) {
  var onlines = [];
  for(var key in socket.adapter.rooms) {
    onlines.push(key);
  }
  var listquery = User.find({'socketid': {$nin:[onlines]}});
  listquery.remove().lean().exec(function(err, result){
  });
};

io.on('connection', function(socket){
  updateMemberList(socket, io);

  var logquery = Log.where({});
  logquery.find({}, null, {sort:{date: -1}}).lean().exec(function(err, result){
    if (err) {
      socket.emit('system', "DB接続エラーです。管理者に問い合わせて下さい");
    } else {
      socket.emit('chat logs', result);
    }
  });

  socket.on('enter room', function(name){
    name = validator.escape(name);
    if (name === '') {
      socket.emit('system', "名前に空白は利用できません");
      return;
    }

    var query = User.where({name: name});
    query.findOne().lean().exec(function(err, result){
      if (result !== null){
        return;
      }
    });

    var newUser = new User({socketid: socket.id.toString(),
                            name: name});
    newUser.save(function(err, result){
      if (err) {
        socket.emit('system', "DB接続エラーです。管理者に問い合わせて下さい");
      } else if (result === null){
        socket.emit('system', "おっと、チャットルームに入室できていないかもしれません。ページをリロードしてみてください。");
      } else {
        var today = new Date();
        // io.emit('chat message',
        //         { name: 'System', msg: result.name + 'さんが入室しました',
        //           date: today});
        // var newLog = new Log({name: result.name, msg: result.name + 'さんが入室しました',
        //                       date: today});
        // newLog.save();
        updateMemberList(socket, io);
      }
    });
  });

  socket.on('chat message', function(message){
    var msgClass = "msg", question = false;
    if (message.msg === '') {
      socket.emit('system', "メッセージに空白は利用できません");
      return;
    } else {
      if (message.msg.match(/質問|question/i)) {
        question = true;
        msgClass = "msg question";
      }
    }

    var query = User.where({socketid: socket.id.toString()});
    query.findOne().lean().exec(function(err, result){
      if (err) {
        socket.emit('system', "DB接続エラーです。管理者に問い合わせて下さい");
      } else if (result === null){
        socket.emit('system', "おっと、チャットルームに入室できていないかもしれません。ページをリロードしてみてください。");
      } else {
        var newLog = new Log({name: result.name, msg: message.msg, tag: msgClass, question: question, reply_to: message.reply_to});
        newLog.save(function(){
          io.emit('chat message', newLog);
        });
      }
    });
  });

  socket.on('disconnect', function(){
    var query = User.where({socketid: socket.id.toString()});
    query.findOneAndRemove().lean().exec(function(err, result){
      if (err) {
        socket.emit('system', "DB接続エラーです。管理者に問い合わせて下さい");
      } else if (result === null){
        socket.emit('system', "おっと、チャットルームに入室できていないかもしれません。ページをリロードしてみてください。");
      } else {
        var today = new Date();
        // io.emit('chat message',
        //         { name: 'System', msg: result.name + 'さんが退室しました',
        //           date: today});
        // var newLog = new Log({name: result.name, msg: result.name + 'さんが退室しました',
        //                       date: today});
        // newLog.save();
        updateMemberList(socket, io);
      }
    });
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
