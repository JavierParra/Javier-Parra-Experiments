        /*--------------------------------------------------------------------------------/|
       /                           Javier Parra Cervantes                                / |
      /                           http://www.javierparra.mx                             /  |
     /                                                                                 /  /|
    /---------------------------------------------------------------------------------|  / |
    |                                                                                 | /  |
    |        Copyright (C) 2010  Javier Alejandro Parra Cervantes                     |/   |
    |_________________________________________________________________________________/    |
    |   This program is free software: you can redistribute it and/or modify          |   /|
    |   it under the terms of the GNU General Public License as published by          |  / |
    |   the Free Software Foundation, either version 3 of the License, or             | /  |
    |   (at your option) any later version.                                           |/   |
    |_________________________________________________________________________________/    |
    |   This program is distributed in the hope that it will be useful,               |    |
    |   but WITHOUT ANY WARRANTY; without even the implied warranty of                |    |
    |   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                 |    |
    |   GNU General Public License for more details.                                  |   /
    |---------------------------------------------------------------------------------|  /
    |   You should have received a copy of the GNU General Public License             | /
    |   along with this program.  If not, see <http://www.gnu.org/licenses/>.         |/ 
    |________________________________________________________________________________*/ 

Ball = Class.create({
				position: {},
				prevposition: {},
				forces: {},
				gravCenter: {},
				
				gravity: {
					"x": 19.2,
					"y": 19.2,
					"z": 0 // Z is not fully functional yet, so no forces there.
				},
				
				boundaries: true,
				mass: 1,
				radius: 7,
				defRadius: 7,
				lastRender: false,
				bounciness: 1,
				invert: false,
				friction: .006,
				fps: 5,
				
				initialize: function(width, height){
					this.radius = this.defRadius * this.mass;
					
					this.setColor(Math.random()*355, Math.random()*355, Math.random()*355);
					
					this.world = {
						"x": width,
						"y": height,
						"z": 50
					};
					
					this.position = {
						"x": this.world.x/2 + this.radius,
						"y": this.world.y/2 + this.radius,
						"z": 0
					};
					
					this.prevposition = {
						"x": this.world.x/2 + this.radius,
						"y": this.world.y/2 + this.radius,
						"z": 0
					};
					
					this.forces = {
						"x": 0,
						"y": 0,
						"z": 0
					};
					
//					this.accel("y", this.gravity.y);
					//this.accel("x", this.gravity);
					//this.accel("z", this.gravity*-1);
					//this.accel("z", 2.8);
					
					this.setGravityCenter({"x": false, "y": height, "z": 50});
				},
				
				setBoundaries: function(val){
					this.boundaries = (val)?true:false;
				},
				
				setColor: function(r,g,b){
					this.red = Math.ceil(r);
					this.green = Math.ceil(g);
					this.blue = Math.ceil(b);
				},
				
				setFps: function(fps){
					if(isNaN(fps)) return false;
					this.fps = fps;
				},
				
				/* Should be less than .01*/
				setFriction: function(val){
					if(isNaN(val)) return false;
					this.friction = val;
				},
				
				setGravityCenter: function(obj, cant){
					
					if(obj.x == undefined || obj.y == undefined || obj.z == undefined ){
						if(obj != "x" && obj != "y" && obj != "z" ) return false;
						d = obj;
					}else{
						var dimensions = ["x", "y", "z"];
						
						for(i = 0; i < dimensions.length; i++){
							this.setGravityCenter(dimensions[i], obj[dimensions[i]]);
						}
						return true;
					}
					//console.log(d + " " + cant);
					this.gravCenter[d] = cant;
				},
				
				setPosition: function(obj, cant, reset){
					if(obj.x == undefined || obj.y == undefined || obj.z == undefined ){
						if(obj != "x" && obj != "y" && obj != "z" ) return false;
						d = obj;
					}else{
						var dimensions = ["x", "y", "z"];
						
						for(i = 0; i < dimensions.length; i++){
							this.setPosition(dimensions[i], obj[dimensions[i]], reset);
						}
						return true;
					}
					//console.log(d + " " + cant);
					this.position[d] = cant;
					if(reset){
						this.prevposition[d] = cant;
					}
				},
								
				setMass: function(mass){

					if(isNaN(mass)) return;
					this.mass = mass;
					this.radius = this.defRadius / this.mass;
				},
				
				resetForce: function(d){
					if(d != "x" && d != "y" && d != "z" ){
						var dimensions = ["x", "y", "z"];
						for(i = 0; i < dimensions.length; i++){
							this.resetForce(dimensions[i]);
						}
						return true;
					}
					this.forces[d] = 0;
					
				},
				
				invertForces: function(d){
					this.invert = (this.invert)?false:true;
				},
				
				accel: function(obj, cant){
					if(obj.x == undefined || obj.y == undefined || obj.z == undefined ){
						if(obj != "x" && obj != "y" && obj != "z" ) return false;
						d = obj;
					}else{
						var dimensions = ["x", "y", "z"];
						
						for(i = 0; i < dimensions.length; i++){
							this.accel(dimensions[i], obj[dimensions[i]]);
						}
						return true;
					}
					var newForce = this.mass * cant;
					this.forces[d] += newForce;
					return true;
				},
				
				constraints: function(){
					
					/*********************************/
					/*		Centro de Gravedad		*/
					/*******************************/
					
					if(this.gravCenter.y !== false){
						if(this.position.y < this.gravCenter.y){
						
							this.resetForce("y");
							this.accel("y",this.gravity.y);
						}
						
						if(this.position.y > this.gravCenter.y){
						
							this.resetForce("y");
							this.accel("y",this.gravity.y*-1);
						}
						if(this.position.y == this.gravCenter.y){
							this.resetForce("y");
						}
					}else{
					
							this.resetForce("y");
							this.accel("y",this.gravity.y);
					}
					
					if(this.gravCenter.x !== false){
						if(this.position.x < this.gravCenter.x){
						
							this.resetForce("x");
							this.accel("x", this.gravity.x);
						}
						
						if(this.position.x > this.gravCenter.x){
							
							this.resetForce("x");
							this.accel("x", this.gravity.x*-1);
						}
						
						if(this.position.x == this.gravCenter.x){
							this.resetForce("x");
						}
					}else{
					
							this.resetForce("x");
							this.accel("x",0);
					}
					
					if(!this.boundaries) return;
					
					/*		Izquierda		*/
					if(this.position.x - (this.radius+this.position.z) < 0){
						this.position.x = this.radius+this.position.z;
						this.bounce("x");
					}
					
					/*			Derecha		*/
					if(this.position.x + this.radius +this.position.z > this.world.x){
						this.position.x = this.world.x - (this.radius+this.position.z);
						this.bounce("x");
					}
					
					/*			Arriba		*/
					if(this.position.y - (this.radius+this.position.z) < 0){
						this.position.y = (this.radius+this.position.z);
						this.bounce("y");
					}
					
					/*			Abajo		*/
					if(this.position.y + this.radius+this.position.z > this.world.y){
						this.position.y = this.world.y - (this.radius+this.position.z);
						this.bounce("y");
					}
					
					/*		Fondo (Z min)	*/
					if(this.position.z < (this.radius-1)*-1){
						this.position.z = (this.radius-1)*-1;
						this.bounce("z");
					}
					
					/*			Z max		*/
					if(this.position.z > this.world.z){
						this.position.z = this.world.z;					
						this.bounce("z");
					}
					
					
				},
				
				bounce: function(d){
					//console.log(n);
					pos = this.position[d];
					//console.log(Math.atan(this.bounciness*this.mass));
					bounce = (pos - this.prevposition[d]) * Math.atan(this.bounciness*this.mass);
					/*if(bounce != 0)
						console.log(bounce);*/
					pos += bounce;
					this.prevposition[d] = pos;
				},
				
				nextPos: function(c, DT){
					if(c != "x" && c != "y" && c != "z" ) return false;
					prev = this.prevposition[c];
					cur = this.position[c];
					//console.log("cur"+cur);
					force = this.forces[c];
					next = cur;
					n = (this.invert)?-1:1;
					friction = 1-this.friction;
					next += (cur-prev) * friction + (force * Math.pow(DT, 2)) * n; //Verlet Integration
					this.position[c] = next;
					this.prevposition[c] = cur;
					this.constraints();
				},
				
				drawCenter: function(ctx){
				
					ctx.beginPath();
					ctx.fillStyle = "rgba(0,0,0,"+this.mass+")";
					ctx.arc(this.gravCenter.x, this.gravCenter.y, 2, 0, Math.PI*2, false);
					ctx.stroke();
					ctx.fill();
				},
				
				drawMass: function(ctx){
					ctx.font = "bold "+this.radius + "px arial";
					var text = ""+Math.round(this.mass*100)/100+"";
					var tw = ctx.measureText(text);

					ctx.textBaseline = "middle";
					ctx.fillStyle = "rgba(0,0,0,.8)";
					ctx.fillText(text, this.position.x-(tw.width/2), this.position.y, this.radius*2);
				},
				
				render: function(ctx){
					var now = new Date();
					if(this.lastRender){
						var DT = now - this.lastRender;
						secs = 1/this.fps;
						//console.log(secs);
						this.nextPos("y", secs);
						this.nextPos("x", secs);
						this.nextPos("z", secs);
						
					}
					this.lastRender = now;
					//this.drawCenter(ctx);
					ctx.beginPath();
					ctx.lineWidth = 2;
					ctx.strokeStyle = "rgb("+this.red+", "+this.green+", "+this.blue+")";
					ctx.fillStyle = "rgba("+this.red+", "+this.green+", "+this.blue+", "+this.mass+")";
					ctx.arc(this.position.x, this.position.y, this.radius+this.position.z, 0, Math.PI*2, false);
					ctx.stroke();
					ctx.fill();
				}
			});