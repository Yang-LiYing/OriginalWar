function Core(x,y,direction){
	this.x = x;
	this.y = y;
	this.speed = 2;
	this.direction = direction;//{'x': 0,'y': 0};
	this.soldier_gather_radius = 20;
	this.setDirection = function(direction){
		//console.log("setDirection: this.direction:"+this.direction.x+":"+this.direction.y+" ; direction:"+direction.x+":"+direction.y);
		this.direction = direction;
	}
	this.move = function(){
		//console.log("Core Move:"+this.x+":"+this.y+" ; dir:"+this.direction.x+":"+this.direction.y+" ; speed:"+this.speed);
		this.x += this.direction.x * this.speed;
		this.y += this.direction.y * this.speed;
	}
}

module.exports = Core;