var socket = new WebSocket("ws://127.0.0.1:8898");  //sing.le test


var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var mouse = {'x': canvas.width/2,'y': canvas.height/2 , direction: {'x': 0,'y':0}};

var id;
var team = [];
var teams;
var msg;

function messageToTeam(msg){
	var ele_sym = ",";
	var part_sym = ":";
	var category_sym = ";";
	var draw_msg = [];

	var category = msg.split(category_sym);
	draw_msg.push(category[0]);
	var parts = category[1].split(part_sym);
	for(p = 0;p<parts.length;p++){
		var e = parts[p].split(ele_sym);
		draw_msg.push({ 'x': e[0],'y': e[1],'size': e[2] });
	}
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
// function drawText(){
// 	ctx.beginPath();
// 	ctx.font = "15px Arial";
// 	ctx.fillStyle = "#777777";
// 	ctx.fillText("Soldiers:"+player.soldiers.length,10,canvas.height-25);
// 	ctx.fillText("Barrack:"+player.barracks.length,10,canvas.height-10);

// 	ctx.closePath();
// }
function draw(){
	ctx.clearRect(0,0,canvas.width,canvas.height);

	teams = msg.split("-");
	for(t = 0; t< teams.length; t++){
		team = messageToTeam(teams[t]);
		var color = team.shift();
		drawTeam(team,color);
	}
}
function mouseMoveHandler(e){
	mouse.x = e.clientX - canvas.offsetLeft;
	mouse.y = e.clientY - canvas.offsetTop;

	sendMsg(id+":"+mouse.x+","+mouse.y);
}
function clickHandler(e){
	if(e.button == 0){
		sendMsg(id+":"+"click");
	}
}
function mouseWheelHandler(e){
	//console.log(e);
	if(e.deltaY < 0){ //Wheel up
		sendMsg(id+":"+"wheelup");
	}else if(e.deltaY > 0){ //Wheel down
		sendMsg(id+":"+"wheeldown");
	}
}

document.addEventListener("mousemove",mouseMoveHandler,false);
canvas.addEventListener("click",clickHandler,false);
canvas.addEventListener("wheel",mouseWheelHandler,false);

//client
socket.onmessage = function(e){
	msg = e.data;
	//console.log("get:"+msg);
	if(msg.length <= 6){
		id = msg;
	}else{
		draw();
	}
}

function sendMsg(msg){
	//console.log("sending:"+msg);
	socket.send(msg);
}
