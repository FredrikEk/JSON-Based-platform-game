var express       = require('express');
var bodyParser    = require("body-parser");
var app           = express();
var server        = require('http').Server(app);
var io            = require('socket.io')(server);

app.use(bodyParser.urlencoded({ extended: false }));
 
app.use(express.static(__dirname + '/public'));
 
app.get('/', function(req, res){
  res.render('/index.html');
});

var playerCount = 0;
var id = 0;
var tagged = false;
var turnCount = 0;

app.post('/move', function(req,res){
  command    = req.body.command;
  parameter  = req.body.parameter;
  turnCount++;
  console.log("Command : " + command + ", parameter : " + parameter);
  io.emit('action', {command: command, parameter: parameter});
  io.emit('turn', { turnCount: turnCount });
  res.end("Command received!");
  
  
});

io.on('connection', function (socket) {
  playerCount++;
  id++;
  setTimeout(function () {
    if (!tagged) {
      socket.emit('connected', { playerId: id, tagged: true });
    } else {
      socket.emit('connected', { playerId: id });
    }
    io.emit('count', { playerCount: playerCount });
    io.emit('turn', { turnCount: turnCount });
  }, 1000);
 
  socket.on('disconnect', function () {
    playerCount--;
    io.emit('count', { playerCount: playerCount });
  });

  socket.on('update', function (data) {
    if (data['tagged']) {
      tagged = true;
    }
    socket.broadcast.emit('updated', data);
  });

  socket.on('tag', function (data) {
    io.emit('tagged', data);
  });
});

setInterval(function () {
  tagged = false;
}, 3000);



server.listen(80);
console.log("App listening on port 80");