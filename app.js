var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/cr', function(req, res){
  res.sendFile(__dirname + '/create.png');
});

app.get('/con', function(req, res){
  res.sendFile(__dirname + '/connection.png');
});

app.get('/qwe', function(req, res){
  res.sendFile(__dirname + '/spr.png');
});

var players = {};

function onConnection(socket) {
	
	socket.on('create table', function(roomID) {
		
		socket.emit('connecting', socket.id);

		socket.emit('show players', players);

		socket.on('connected', function(userID, X, Y, color, radius, XCur, YCur, roomID) {
			console.log("get: ", userID, "  ", X, " ", Y, " ", color, " ", radius, " in room: ", roomID);
			//console.log('room ' + roomid);
			players[userID] = {
				x: X,
				y: Y,
				clr: color,
				r: radius,
				xCur: XCur,
				yCur: YCur,
				room: roomID,
			};
			//console.log("connected: ", socket.id, " in room ", room," mouse in: ", players[userID].xCur, '-', players[userID].yCur);
			socket.broadcast.emit('imready', socket.id, players[userID].x, players[userID].y, players[userID].clr, players[userID].r, players[userID].xCur, players[userID].yCur, players[userID].room);
		});

		socket.on('mouse moved', function(XCur, YCur) {
			console.log("connected: ", socket.id, " mouse in: ", XCur, '-', YCur);
			//players[socket.id].xCur = XCur;
			//players[socket.id].yCur = YCur;
			socket.broadcast.emit('mouse moved', socket.id, XCur, YCur);
		});

		socket.on('player moved', function(x, y){
			//console.log('room ' + room);
			if (!players[socket.id])
				return;
			console.log("moving: ", socket.id, " mouse in: ", x, '-', y);
			//socket.emit('imoved', x, y);
			socket.broadcast.emit('player moved', socket.id, x, y, players[socket.id].room);
			socket.broadcast.emit('create tail', socket.id, x, y, players[socket.id].clr, players[socket.id].r, players[socket.id].room);
			if (x && y)
			{	
				players[socket.id].x = x;
				players[socket.id].y = y;
			}
		});
		socket.on('disconnect', function(){
			socket.broadcast.emit('dis', socket.id);
			delete players[socket.id];
			console.log("delete: ", socket.id, "\nnow: ", players.length, "\n");
		});
	});
};

io.on('connection', onConnection); 

http.listen(port, function(){
  console.log('listening on *:' + port);
});