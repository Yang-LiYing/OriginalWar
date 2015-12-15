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
	this.clients = [];
	this.option = {
		serverPort:8898,
		serverMaxConnections: 10,
	}
	this.amount_of_room = 0;
	this.rooms = new Array();
}

GameServer.prototype.start = function(){
	this.socket = new webSocket.Server({port: this.option.serverPort , perMessageDeflate: false},this.socketListener.bind(this));
	//console.log("GameServer Listening on port "+this.option.serverPort);

	this.socket.on("connection" , connection.bind(this));
	this.socket.on("error", function err(e){
		//console.log("[Error] Unhandled error code: "+e.code);
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
				//console.log("[clientWS].team:"+gameServer.clients[id].team);
				gameServer.clients[id].team.mouseMove(x,y);
			}
		});
		this.clients.push({'ws': ws, 'id': this.clientConnections,'status': "idle",'team': ""});
		ws.send(getPlayerOptionMsg("id",this.clientConnections.toString()));
		ws.send(getPlayerOptionMsg("status","idle"));
		this.clientConnections += 1;
		this.makeAPair();
	}
	function getPlayerOptionMsg(name,value){
		return "setting*"+name+":"+value;
	}
}

GameServer.prototype.makeAPair = function(){
	var idle_player = 0;
	if(!this.clients){ //when this.clients is empty
		return;
	}
	for(p = 0; p < this.clients.length ; p++){
		if(this.clients[p].status == "idle"){
			idle_player += 1;
		}
	}

	if(idle_player >= Room.mode.two_player.number_of_player){
		//console.log("[Room Message] creating...");
		var room = new Room(this.amount_of_room , Room.mode.two_player);
		room.init();
		this.rooms.push(room);
		for(p = 0; p < this.clients.length ; p++){
			if(!room.addPlayer(this.clients[p])) { //when number of player == max number of player on room
				return;
			}
		}
	}
}

GameServer.prototype.socketListener = function(){

}

// create Web Socket
gameServer = new GameServer();
gameServer.start();
