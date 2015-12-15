var Tool = require("./Tool");
var unitDirection = Tool.unitDirection;

function Soldier(x,y,size){
	Soldier.status = {"normal": 1,"build": 2,"defense": 3,"attack":4};
	Soldier.bornCD = 10; //10 = 1s

	this.x = x;
	this.y = y;
	this.size = size;
	this.direction = {'x': 0,'y': 0};
	this.action = Soldier.status.normal;
	this.barrack;//={'x': ... , 'y': ..., 'size': ...}
	this.move = function(core){
		if(this.action == Soldier.status.normal){
			var unit_direction = unitDirection(core,this);
			if(unit_direction.r > core.soldier_gather_radius){
				this.x += unit_direction.x ;
				this.y += unit_direction.y ;
			}else{
				var rx = Math.random()*10;
				var ry = Math.random()*10;
				this.x += (rx - 5)/10;
				this.y += (ry - 5)/10;
			}
		}else if(this.action == Soldier.status.build){
			var unit_direction = unitDirection(this.barrack,this); //this time
			this.x += unit_direction.x;
			this.y += unit_direction.y;
		}else if(this.action == Soldier.status.defense){
			var unit_direction = unitDirection(this.barrack,this);
			if(unit_direction.r < this.barrack.size + 2){
				this.x -= unit_direction.x;
				this.y -= unit_direction.y;
			}else if(unit_direction.r > this.barrack.size+ 10){ //this soldier run out side of barrack defence range
				this.x += unit_direction.x;
				this.y += unit_direction.y;
			}else{
				var rx = Math.random()*10;
				var ry = Math.random()*10;
				this.x += (rx - 5)/10;
				this.y += (ry - 5)/10;
			}
		}
	}
}

module.exports = Soldier;