//var exec = require("child_process").exec;
var fs = require("fs");

var context;
var game_script;
fs.readFile('./original_war.html','utf8',function(err,html){
	if(err){
	}
	context = html;
});

fs.readFile('./originawar_client.js','utf8',function(err,script){
	if(err){
	}
	game_script = script;
});

function start(response){
	console.log("Request handler 'start' was called.");

	response.writeHead(200,{"Content-Type": "text/html"});
	response.write(context);
	response.end();
}

function script(response){
	//console.log(response);
	response.setHeader("Content-Type", "application/javascript");
	response.end(game_script);
}
// function upload(response){
// 	console.log("Request handler 'upload' was called.");
// 	response.writeHead(200,{"Content": "text/plain"});
// 	response.write("Hello Upload");
// 	response.end();
// }

exports.start = start;
exports.script = script;
// exports.upload = upload;