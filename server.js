//connect
var http = require("http");
var url = require("url");
var webSocket = require("ws");
//game
var gameObject = require("./object");
var teamToMessage = gameObject.Tool.teamToMessage;
var unitDirection = gameObject.Tool.unitDirection;
var Room = gameObject.Room;
var gameServer;

function start(route,handle){
	function createMyServer(request,response){
		var pathname = url.parse(request.url).pathname;
		//console.log("Request for "+pathname+" received.");
		route(handle,pathname,response);
	}

	http.createServer(createMyServer).listen(8899);
	//console.log("server has started.");
}

exports.start = start;


function GameServer(){
	this.clientConnections = 0;
	this.clients = {};
	this.option = {
		serverPort:8898,
		serverMaxConnections: 10,
	}
	this.amount_of_room = 0;
	this.rooms = {};
}

GameServer.prototype.start = function(){
	this.socket = new webSocket.Server({port: this.option.serverPort , perMessageDeflate: false},this.socketListener.bind(this));
	console.log("GameServer Listening on port "+this.option.serverPort);

	this.socket.on("connection" , connection.bind(this));
	this.socket.on("error", function err(e){
		console.log("[Server socket closed] Untreated Error. code: "+e.code);
		process.exit(1); // Exits the program
	});

	function connection(ws){
		//console.log("GameServer get connecting: "+ws.upgradeReq.connection.remoteAddress);
		ws.on("message", function(msg){
			//handle mouse action
			var parts = msg.split(":");
			var id = parseInt(parts[0]);
			//var room_id = parseInt(parts[1]); //not use
			var action = parts[2];

			if(action == "click"){
				//click action
				gameServer.clients[id].team.mouseClick();
			}else if(action == "wheelup"){
				//wheelup action
				gameServer.clients[id].team.mouseWheel(-1);
			}else if(action == "wheeldown"){
				//wheeldown action
				gameServer.clients[id].team.mouseWheel(1);
			}else{
				//mouse location
				var p = action.split(",");
				var x = parseInt(p[0]);
				var y = parseInt(p[1]);
				gameServer.clients[id].team.mouseMove(x,y);
			}
		});
		ws.onclose = function(e){
			console.log("[Client connection closed] code: "+e.code);
			gameServer.checkAllPlayerOfRoom();
			gameServer.checkRoomHasPlayer();
			gameServer.checkPlayerConnection();
		}
		this.clients[this.clientConnections] = {'ws': ws,'id': this.clientConnections, 'status':"idle", 'team':""};
		ws.send(getPlayerOptionMsg("id",this.clientConnections.toString()));
		ws.send(getPlayerOptionMsg("status","idle"));
		this.clientConnections += 1;
		this.makeAPair(Room.mode.single_player); //change mode on this
	}
	function getPlayerOptionMsg(name,value){
		return "setting*"+name+":"+value;
	}
}

GameServer.prototype.makeAPair = function(mode){
	var idle_player = 0;
	for(var key in this.clients){
		if(!this.clients.hasOwnProperty(key)){ //if this.client has not key then breake
			return;
		}
		if(this.clients[key].status == "idle"){
			idle_player += 1;
		}
	}
	console.log("[MakeAPair] idle_player: "+idle_player);
	//single_player  tow_player
	if(idle_player >= mode.number_of_player){
		//console.log("[Room Message] creating...");
		var room = new Room(this.amount_of_room , mode);
		room.init();
		this.rooms[this.amount_of_room] = room;
		for(var key in this.clients){
			if(this.clients[key].status == "idle" && !room.addPlayer(this.clients[key])){//when number of player == max number of player on room
				return;
			}
		}
		this.amount_of_room += 1;
	}
}

GameServer.prototype.socketListener = function(){}

GameServer.prototype.checkRoomHasPlayer = function(){
	for(var id in this.rooms){
		if(this.rooms[id].clients.length == 0){
			delete this.rooms[id];
		}
	}
}

GameServer.prototype.checkAllPlayerOfRoom = function(){
	for(var key in this.rooms){
		this.rooms[key].checkAllPlayerHasConnection();
	}
}

GameServer.prototype.checkPlayerConnection = function(){
	for(var key in this.clients){
		//console.log("[Server Check Connection] ws: "+this.clients[key].ws.readyState);
		if(this.clients[key].ws.readyState == 3){
			delete this.clients[key];
		}
	}
}

// create Web Socket
gameServer = new GameServer();
gameServer.start();
