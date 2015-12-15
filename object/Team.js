var Tool = require("./Tool");
var unitDirection = Tool.unitDirection;

var Core = require("./Core")
var Barrack = require("./Barrack");
var Soldier = require("./Soldier");

function Team(core,color){
	this.core = core;
	this.color = color;
	//this.soldier_size = 0;
	this.soldiers = [];
	this.barracks = [];
	this.born_soldier_cd = 0;
	this.enemy = [];

	this.mouse = {'x': 0,'y': 0};
	this.addSoldier = function(){
		var x = (core.x - 10) + Math.random()*20;
		var y = (core.y - 10) + Math.random()*20;
		var s = new Soldier(x,y,1);
		s.action = Soldier.status.normal;
		this.soldiers.push(s);
	}
	this.addSoldiers = function(amount){
		for(i=0;i<amount;i++){
			this.addSoldier();
		}
	}
	this.moveSoldier = function(){
		//the soldier around of mouse
		for(c = 0;c < this.soldiers.length; c++){
			var this_soldier_is_sacrifice = false;
			if(this.soldiers[c].action == Soldier.status.normal){
				this.soldiers[c].move(core);
				//attack action
				for(e=0;e<this.enemy.length;e++){
					//my soldier close to soldier[s] of enemy[e]
					for(s=0;s<this.enemy[e].soldiers.length;s++){
						if(!this_soldier_is_sacrifice && unitDirection(this.soldiers[c],this.enemy[e].soldiers[s]).r <= this.soldiers[c].size+this.enemy[e].soldiers[s].size){
							this.soldierAttackSoldier(this.soldiers[c],this.enemy[e].soldiers[s]);
							if(this.soldiers[c].size <= 0){
								this_soldier_is_sacrifice = true;
								this.soldiers.splice(c,1);
							}
							if(this.enemy[e].soldiers[s].size <= 0){
								this.enemy[e].soldiers.splice(s,1);
							}
						}
					}
					//my soldier close to barracks[b].soldier[s] or barracks[b] of enemy[e]
					for(b=0;b<this.enemy[e].barracks.length;b++){
						//my soldier close soldier of enemy
						for(s=0;s<this.enemy[e].barracks[b].soldiers.length;s++){
							if(!this_soldier_is_sacrifice && unitDirection(this.soldiers[c],this.enemy[e].barracks[b].soldiers[s]).r <= this.soldiers[c].size+this.enemy[e].barracks[b].soldiers[s].size){
								this.soldierAttackSoldier(this.soldiers[c],this.enemy[e].barracks[b].soldiers[s]);
								if(this.soldiers[c].size <= 0){
									this_soldier_is_sacrifice = true;
									this.soldiers.splice(c,1);
								}
								if(this.enemy[e].barracks[b].soldiers[s].size <= 0){
									this.enemy[e].barracks[b].soldiers.splice(s,1);
								}
							}
						}
						//my soldier close barrack of enemy
						if(!this_soldier_is_sacrifice && unitDirection(this.soldiers[c],this.enemy[e].barracks[b]).r <= this.soldiers[c].size + this.enemy[e].barracks[b].size + 2){
							this.enemy[e].barracks[b].size -= this.soldiers[c].size / (this.enemy[e].barracks[b].size+1);
							this.enemy[e].barracks[b].born_soldier_cd -= Soldier.bornCD * (this.enemy[e].barracks[b].size * 0.3);
							this_soldier_is_sacrifice = true;
							this.soldiers.splice(c,1);
							if(this.enemy[e].barracks[b].size <= 0){
								this.enemy[e].barracks.splice(b,1);
							}
						}
					}
				}
			}else if(this.soldiers[c].action == Soldier.status.build){//if soldier in barrack then remove and addtion barrack size
				var unit_direction = unitDirection(this.soldiers[c].barrack,this.soldiers[c]);
				this.soldiers[c].move();
				if(unit_direction.r < this.soldiers[c].barrack.size+1){ //born barrack
					this.soldiers[c].barrack.size += this.soldiers[c].size*1 / (this.soldiers[c].barrack.size+1);
					this.soldiers[c].barrack.max_soldier_amount = this.soldiers[c].barrack.size * 10;
					this.soldiers.splice(c,1);
				}
			}
		}
		//the soldier around of barrack
		if(this.barracks.length > 0){
			for(b=0;b<this.barracks.length;b++){
				if(this.barracks[b].soldiers.length > 0){ // if barrack has one or more soldier
					for(s=0;s<this.barracks[b].soldiers.length;s++){
						if(unitDirection(this.core , this.barracks[b].soldiers[s]).r <= 10 && unitDirection(this.barracks[b].soldiers[s],this.barracks[b]).r > this.barracks[b].size + 2){//if core close it will be around core
							this.barracks[b].soldiers[s].action = Soldier.status.normal;
							this.soldiers.push(this.barracks[b].soldiers.splice(s,1)[0]);
						}else{
							//console.log(this.barracks[b].soldiers[s]);
							this.barracks[b].soldiers[s].move(this.core);
						}
					}
				}
			}
		}
	}
	this.moveCore = function(direction){
		this.core.setDirection(direction);
		this.core.move();
		this.moveSoldier();
	}
	this.createBarrack = function(){
		var barrack;// = new Barrack(this.core.x , this.core.y);
		for(b=0;b<this.barracks.length;b++){
			if(unitDirection(this.core,this.barracks[b]).r <= this.barracks[b].size + 2){
				barrack = this.barracks[b];
			}
		}
		if(typeof barrack == "undefined"){
			barrack = new Barrack(this.core.x , this.core.y);
			this.barracks.push(barrack);
		}
		for(c = 0;c<this.soldiers.length ; c++){
			this.soldiers[c].barrack = barrack;
			this.soldiers[c].action = Soldier.status.build;
		}
	}
	this.barrackGravity = function(){ 
		for(b = 0;b < this.barracks.length;b++){
			for(s = b+1;s < this.barracks.length;s++){
				var mainBarr = this.barracks[b];
				var seconBarr = this.barracks[s];
				var unit = unitDirection(mainBarr,seconBarr);
				if(unit.r <= mainBarr.size+seconBarr.size+5){ //Gravity influence action
					if(unit.r <= mainBarr.size+seconBarr.size){ //Collide action
						if(mainBarr.size >= seconBarr.size){ //The big one getting more bigger
							mainBarr.size += seconBarr.size / mainBarr.size;
						}else if(mainBarr.size < seconBarr.size){
							seconBarr.size += mainBarr.size / seconBarr.size;
						}

						if(unit.r < mainBarr.size){
							this.barracks.splice(s,1);
						}else if(unit < seconBarr.size){
							this.barracks.splice(b,1);
						}
					}
					mainBarr.x -= unit.x * seconBarr.size/mainBarr.size;
					mainBarr.y -= unit.y * seconBarr.size/mainBarr.size;
					seconBarr.x += unit.x * mainBarr.size/seconBarr.size;
					seconBarr.y += unit.y * mainBarr.size/seconBarr.size;
				}
			}
		}
	}
	this.tickTick = function(){
		this.barrackGravity();
		if(this.barracks.length > 0){
			for(c=0;c<this.barracks.length;c++){
				this.barracks[c].tickTick();
			}
		}
	}
	this.soldierAttackSoldier = function(mSoldier,eSoldier){
		var mSize = mSoldier.size;
		var eSize = eSoldier.size;
		mSoldier.size -= eSize;
		eSoldier.size -= mSize;
	}
	this.mouseMove = function(x,y){
		this.mouse.x = x;
		this.mouse.y = y;
	}
	this.mouseClick = function(){
		if(this.soldiers.length > 0){
			this.createBarrack();
		}
	}
	this.mouseWheel = function(y){
		if(y < 0 && this.core.soldier_gather_radius >= 5){
			this.core.soldier_gather_radius -= 3;
		}else if(y > 0 && this.core.soldier_gather_radius <= 50){
			this.core.soldier_gather_radius += 3;
		}
	}
}

module.exports = Team;