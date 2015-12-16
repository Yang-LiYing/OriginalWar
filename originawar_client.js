var socket = new WebSocket("ws://127.0.0.1:8898");  //sing.le test

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var mouse = {'x': canvas.width/2,'y': canvas.height/2 , direction: {'x': 0,'y':0}};

//can use to debug
var team = [];
var teams;
var msg;

//option
var id;
var room_id;

var status;
var server_status;
//tool
function messageToTeam(msg){
	var ele_sym = ",";
	var part_sym = ":";
	var category_sym = ";";
	var draw_msg = [];

	var category = msg.split(category_sym);
	draw_msg.push(category[0]); //color
	var parts = category[1].split(part_sym);
	for(p = 0;p<parts.length;p++){
		var e = parts[p].split(ele_sym);
		draw_msg.push({ 'x': e[0],'y': e[1],'size': e[2] });
	}
	//console.log(draw_msg[1]); //test
	return draw_msg;
}

function drawArc(x,y,color,size){
	ctx.beginPath();
	ctx.arc(x,y,size,0,Math.PI*2);
	ctx.fillStyle = color;
	ctx.fill();
	ctx.closePath();
}
function drawTeam(elements,color){
	for(a = 0;a<elements.length;a++){
		drawArc(elements[a].x , elements[a].y , color , elements[a].size);
	}
}
function drawStatus(){
	if(status != "normal"){
		ctx.fillStyle = "rgba(200,200,200,0.65)";
		ctx.fillRect(0,0,canvas.width,canvas.height);

		ctx.beginPath();
		ctx.font = "50px Arial";
		ctx.fillStyle = "#777777";
		var text = "";
		if(status == "loser"){
			text = "Lose";
		}else{
			text = "Win";
		}
		ctx.fillText(text,canvas.width/2-60,canvas.height/2);
		ctx.closePath();
	}
}
function draw(){
	ctx.clearRect(0,0,canvas.width,canvas.height);

	var msg_parts = msg.split("-");
	teams = msg_parts;
	for(t = 0; t< teams.length; t++){
		console.log("[Draw]"+teams[t]);
		team = messageToTeam(teams[t]);
		var color = team.shift();
		drawTeam(team,color);
	}
	drawStatus();
}
function mouseMoveHandler(e){
	mouse.x = e.clientX - canvas.offsetLeft;
	mouse.y = e.clientY - canvas.offsetTop;
	if(status == "normal"){
		sendMsg(getOption()+mouse.x+","+mouse.y);
	}
}
function clickHandler(e){
	if(e.button == 0 && status == "normal"){
		sendMsg(getOption()+"click");
	}
}
function mouseWheelHandler(e){
	var m = getOption();
	if(e.deltaY < 0){ //Wheel up
		m += "wheelup";
	}else if(e.deltaY > 0){ //Wheel down
		m += "wheeldown";
	}

	if(status == "normal"){
		sendMsg(m);
	}
}

document.addEventListener("mousemove",mouseMoveHandler,false);
canvas.addEventListener("click",clickHandler,false);
canvas.addEventListener("wheel",mouseWheelHandler,false);


//client
socket.onmessage = function(e){
	console.log(e.data);
	var action = getHeadOfMassage(e.data,"*");
	var body = getBodyOfMessage(e.data,"*");
	if(action == "setting"){
		//set id and room_id
		var opt_name = getHeadOfMassage(body,":");
		var opt_value = getBodyOfMessage(body,":");
		if(opt_name == "id"){
			id = opt_value;
		}else if(opt_name == "room_id"){
			room_id = opt_value;
		}else if(opt_name == "status"){
			status = opt_value;
		}
	}else if(action == "teams"){
		msg = body;
		draw();
	}
}
socket.onclose = function(e){
	console.log(e.code);
	if(e.code == 1006){
		server_status = 1006;
		console.log("[Socket closed] Server Error. error code:1006");
	}else{
		console.log("[Socket closed] Untreated Error! code: "+e.code);
	}
}

function sendMsg(msg){
	socket.send(msg);
}

function getHeadOfMassage(msg,symbol){
	var parts = msg.split(symbol);
	return parts.shift();
}

function getBodyOfMessage(msg,symbol){
	var parts = msg.split(symbol);
	return parts.pop();
}

function getOption(){
	return id+":"+room_id+":";
}