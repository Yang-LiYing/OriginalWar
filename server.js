//connect
var http = require("http");
var url = require("url");
var webSocket = require("ws");
//game
var gameObject = require("./object");
var gameServer;

function start(route,handle){
	function createMyServer(request,response){
		var pathname = url.parse(request.url).pathname;
		console.log("Request for "+pathname+" received.");
		route(handle,pathname,response);
	}

	http.createServer(createMyServer).listen(8899);
	console.log("server has started.");
}

exports.start = start;


function GameServer(){
	this.clientConnections = 0;
	this.clients = [];
	this.option = {
		serverPort:8898,
		serverMaxConnections: 2,
	}
	this.teams = new Array();
}

GameServer.prototype.start = function(){
	this.socket = new webSocket.Server({port: this.option.serverPort , perMessageDeflate: false},this.socketListener.bind(this));
	console.log("GameServer Listening on port "+this.option.serverPort);

	this.socket.on("connection" , connection.bind(this));
	this.socket.on("error", function err(e) {
		console.log("[Error] Unhandled error code: "+e.code);
		process.exit(1); // Exits the program
	});
	function connection(ws){
		//this is gameServer;
		console.log("GameServer get connecting: "+ws.upgradeReq.connection.remoteAddress);
		if(this.clientConnections >= this.option.serverMaxConnections){
			ws.close();
			return;
		}
		ws.on("message", function(msg){
			//this is ws
			//handle mouse action
			console.log(msg);
			var parts = msg.split(":");
			var id = parseInt(parts[0]);
			var action = parts[1];
			if(!(gameServer.clientConnections == gameServer.option.serverMaxConnections)){
				return;
			}
			if(action == "click"){
				//click action
				gameServer.teams[id].mouseClick();
			}else if(action == "wheelup"){
				//wheelup action
				gameServer.teams[id].mouseWheel(-1);
			}else if(action == "wheeldown"){
				//wheeldown action
				gameServer.teams[id].mouseWheel(1);
			}else{
				//mouse location
				var p = action.split(",");
				var x = parseInt(p[0]);
				var y = parseInt(p[1]);
				gameServer.teams[id].mouseMove(x,y);
			}
		});
		ws.send(this.clientConnections.toString());
		this.clients.push({'ws': ws, 'id': this.clientConnections,'connecting': false});
		this.clientConnections += 1;
		this.initRoom();
	}
	function sendMessage(ws,msg){
		ws.send(msg);
	}
}

GameServer.prototype.socketListener = function(){

}

GameServer.prototype.initRoom = function(){
	if(this.option.serverMaxConnections == 1 && this.clientConnections == 1){
		var core = new gameObject.Core(100,100,{"x": 0,"y": 0});
		var team = new gameObject.Team( core ,"#123456");
		this.teams.push(team);
		this.teams[0].mouse = {'x': 100,'y': 100};
		this.teams[0].addSoldiers(50);

		setInterval(gameLoop,10,gameServer);
	}else if(this.option.serverMaxConnections == 2 && this.clientConnections == 2){
		//team 1
		var core = new gameObject.Core(150,200,{"x": 0,"y": 0});
		var team = new gameObject.Team( core ,"#123456");
		this.teams.push(team);
		this.teams[0].mouse = {'x': 150,'y': 200};
		this.teams[0].addSoldiers(50);
		//team 2
		var core = new gameObject.Core(450,300,{"x": 0,"y": 0});
		var team = new gameObject.Team( core ,"#654321");
		this.teams.push(team);
		this.teams[1].mouse = {'x': 450,'y': 300};
		this.teams[1].addSoldiers(50);

		this.teams[0].enemy.push(this.teams[1]);
		this.teams[1].enemy.push(this.teams[0]);
		setInterval(gameLoop,10,gameServer);
	}
}

function gameLoop(server){
	//move team
	for(t = 0 ; t < server.teams.length ; t++){
		server.teams[t].moveCore(gameObject.Tool.unitDirection(server.teams[t].mouse,server.teams[t].core));
		server.teams[t].tickTick();
	}

	//send msg
	var msg = "";
	for(p = 0; p < server.clients.length ; p++){
		msg += gameObject.Tool.teamToMessage(server.teams[server.clients[p].id]);
		if(p != server.clients.length -1){
			msg += "-";
		}
	}
	for(p = 0; p < server.clients.length ; p++){
		server.clients[p].ws.send(msg);
	}
}

// create Web Socket
gameServer = new GameServer();
gameServer.start();
