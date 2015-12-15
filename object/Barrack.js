var Soldier = require("./Soldier");

function Barrack(x,y){
	this.x = x;
	this.y = y;
	this.size = 0;
	this.max_soldier_amount = this.size * 10;
	this.soldiers = [];
	this.born_soldier_cd = 0;
	this.bornSoldier = function(){
		var s = new Soldier(this.x-5+Math.random()*10 , this.y-5+Math.random()*10,1);
		s.barrack = this;
		s.action = Soldier.status.defense;
		this.soldiers.push(s);
	}
	this.tickTick = function(){
		this.born_soldier_cd += Soldier.bornCD * (this.size * 0.3); //0.5 
		if(this.born_soldier_cd >= 1000 && this.soldiers.length <= this.max_soldier_amount){
			this.bornSoldier();
			this.born_soldier_cd = 0;
		}
	}
}

module.exports = Barrack;