function unitDirection(old_point,new_point){
	//console.log("unitDirection: old:"+old_point.x+":"+old_point.y+" ; new:"+new_point.x+":"+new_point.y);
	var dirX = old_point.x - new_point.x;
	var dirY = old_point.y - new_point.y;
	var moving_radius = Math.sqrt( Math.pow(dirX,2) + Math.pow(dirY,2) );
	//console.log("dirX:"+dirX+" ; dirY:"+dirY+" ; moving_radius:"+moving_radius);
	//console.log("return:"+ dirX / moving_radius+":"+dirY / moving_radius);
	if(moving_radius == 0){
		return {'x': 0,'y':0};
	}
	return {'x': dirX / moving_radius , 'y': dirY / moving_radius , 'r': moving_radius}; //unit direction
}

function teamToMessage(team){
	var msg = "";
	var ele_sym = ",";
	var part_sym = ":";
	var category_sym = ";";
	var barrack_soldier_msg = "";
	//team msg
	msg += team.color;
	msg += category_sym;
	//barrack msg
	for(c = 0; c < team.barracks.length ; c++){
		msg += (team.barracks[c].x+ele_sym+team.barracks[c].y+ele_sym+team.barracks[c].size+part_sym);
		for(s = 0; s < team.barracks[c].soldiers.length; s++){
			barrack_soldier_msg += (team.barracks[c].soldiers[s].x+ele_sym+team.barracks[c].soldiers[s].y+ele_sym+team.barracks[c].soldiers[s].size+part_sym);
		}
	}
	msg += barrack_soldier_msg;
	//mouse soldier msg
	for(s = 0;s<team.soldiers.length;s++){
		msg += (team.soldiers[s].x+ele_sym+team.soldiers[s].y+ele_sym+team.soldiers[s].size);
		if(s != team.soldiers.length - 1){
			msg += part_sym;
		}
	}
	if(msg[msg.length-1] == ":"){
		msg = msg.substr(0,msg.length-1);
	}
	return msg;
}


module.exports.unitDirection = unitDirection;
module.exports.teamToMessage = teamToMessage;