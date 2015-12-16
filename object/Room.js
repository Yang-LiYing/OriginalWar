var Tool = require("./Tool");
var unitDirection = Tool.unitDirection;
var teamToMessage = Tool.teamToMessage;

var Core = require("./Core");
var Barrack = require("./Barrack");
var Soldier = require("./Soldier");
var Team = require("./Team");

function Room(id,mode){
	this.status = Room.status.waiting;
	this.mode = mode;
	this.id = id;
	//this.clients = {};
	this.clients = new Array(); //{'id','ws','status','room_id','team'}
	this.teams = new Array(); //[team object , ... ]
	this.loop;

	this.init = function(){
		if(this.mode == Room.mode.single_player){
			var core = new Core(100,100,{"x": 0,"y": 0});
			var team = new Team( core ,"#123456");
			this.teams.push(team);
			this.teams[0].mouse = {'x': 100,'y': 100};
			this.teams[0].addSoldiers(100);

			this.loop = setInterval(loop,10,this);
		}else if(this.mode == Room.mode.two_player){
			var core = new Core(150,200,{"x": 0,"y": 0});
			var team = new Team( core ,"#123456");
			this.teams.push(team);
			this.teams[0].mouse = {'x': 150,'y': 200};
			this.teams[0].addSoldiers(100);

			var core = new Core(450,300,{"x": 0,"y": 0});
			var team = new Team( core ,"#654321");
			this.teams.push(team);
			this.teams[1].mouse = {'x': 450,'y': 300};
			this.teams[1].addSoldiers(100);

			this.teams[0].enemy.push(this.teams[1]);
			this.teams[1].enemy.push(this.teams[0]);
			this.loop = setInterval(loop,10,this);
		}
		//console.log("[Room init]this.teams.length:"+this.teams.length);
	}
	this.addPlayer = function(client){
		if(this.clients.length < this.mode.number_of_player){
			this.clients.push(client);
			client.team = this.teams[this.clients.length - 1];
			client.status = "normal";
			//console.log("[Room Addplayer].teams.length:"+this.teams.length);
			if(this.checkIsConnection(client)){
				client.ws.send("setting*status:normal");
			}
			return true;
		}else{
			return false;
		}
	}
	this.checkAllPlayerHasConnection = function(){
		for(p = 0;p<this.clients.length;p++){
			if(this.clients[p].ws.readyState == 3){
				console.log("[Room]ID:"+this.id+":remove "+p);
				this.clients.splice(p,1);
				console.log("[Room]ID:"+this.id+":clients.length"+this.clients.length);
			}
		}
	}
	this.adjudicate = function(){
		var loser_quantity = 0;
		for(c=0;c<this.clients.length;c++){
			if(this.clients[c].team.barracks.length == 0 && this.clients[c].team.soldiers.length == 0){
				loser_quantity += 1;
				if(this.clients.status != "loser"){
					this.clients[c].status = "loser";
					if(this.checkIsConnection(this.clients[c])){
						this.clients[c].ws.send("setting*status:"+this.clients[c].status);
					}
				}
			}
		}
		//console.log("[Room adj]this.mode.number_of_player:"+this.mode.number_of_player);
		if(loser_quantity == (this.mode.number_of_player-1) && this.mode.id != Room.mode.single_player.id){ //game has winner in addition to test mode 
			for(c=0;c<this.clients.length;c++){
				//console.log("[Room adj]Player.status:"+this.clients[c].status);
				if(this.clients[c].status == "normal"){
					this.clients[c].status = "winner";
					if(this.checkIsConnection(this.clients[c])){
						this.clients[c].ws.send("setting*status:"+this.clients[c].status);
					}
				}
			}
		}
	}
	this.checkIsConnection = function(client){
		if(client.ws.readyState == 1){
			return true;
		}else{
			return false;
		}

	}
}
Room.status = {
	'beginning': 	0,
	'waiting': 	1,
};
Room.mode = {
	'single_player': 			{'id': 1,'number_of_player': 1},
	'two_player': 			{'id': 2,'number_of_player': 2},
	'bot_and_single_player': 	{'id': 3,'number_of_player': 1},
}

function loop(room){
	//move all team
	//console.log("[Room loop]room.teams:"+room.teams);
	for(t=0;t<room.teams.length;t++){
		room.teams[t].moveCore(unitDirection(room.teams[t].mouse , room.teams[t].core));
		room.teams[t].tickTick();
	}
	//who is winner or loser
	room.adjudicate();
	//create msg on all team of this room
	var all_teams_msg = "";
	for(t=0;t<room.teams.length;t++){
		all_teams_msg += teamToMessage(room.teams[t]);
		//console.log("[Team]ID:"+t+";msg:"+teamToMessage(room.teams[t]));
		if( t != room.teams.length - 1){
			all_teams_msg += "-";
		}
	}
	//send msg to client
	for(c=0;c<room.clients.length;c++){
		if(room.checkIsConnection(room.clients[c])){
			room.clients[c].ws.send("teams*"+all_teams_msg);
		}
	}
}

module.exports = Room;
