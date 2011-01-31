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

ParticleSystem = Class.create({
	numBalls: 50,
	speed: 5,
	deltaMass: 1,
	mass: .75,
	friction: .006,
	
	balls: false,
	cn: false,
	paused: false,
	trace: false,
	pauseDiv: false,
	boundaries: true,
	followX: true,
	followY: true,
	form: {},
	
	initialize: function(){
		
		this.cn = new Canvas(document.body);
		
		this.reset();
		//console.log(balls.inspect());
		
		setInterval(this.render.bind(this, false), 24);
		
		Event.observe(this.cn.el, "mousemove", this.setCenter.bindAsEventListener(this));
		Event.observe(this.cn.el, "mousedown",this.invert.bind(this));
		Event.observe(this.cn.el, "mouseup",this.invert.bind(this));
		Event.observe(window, "keyup", this.processInput.bindAsEventListener(this))
	},
	
	reset: function(){
		this.cn.fill("black");
		
		
		this.balls = $A();
		
		
		var px = this.cn.width/2;
		var py = this.cn.height/2;

		for(var i=0; i<this.numBalls; i++){
			var ball = this.balls[i] = new Ball(this.cn.width, this.cn.height);
			ball.setGravityCenter({
				"x": px,
				"y": py,
				"z": 0
			});
			ball.setFps(this.speed);
			mass = this.mass;
			mass += Math.random()*(this.deltaMass);
			ball.setMass(mass);
			
			ball.setFriction(this.friction);
			ball.setBoundaries(this.boundaries);
		}
		
		this.circleArrange();
	},
	
	circleArrange: function(){
		var px = this.cn.width/2;
		var py = this.cn.height/2;
		
		var steps = 360/this.numBalls;
		var deg = steps;
		var radius = this.numBalls;
		
		var position = this.cn.el.positionedOffset();	
		px -= position.left;
		py -= position.top;
		
		this.balls.each(
			function(ball){
				ball.setPosition({
				"x": px + (Math.cos(deg*0.0174532925)*radius),
				"y": py + (Math.sin(deg*0.0174532925)*radius),
				"z": 0
				},
				0, true);
				deg+=steps;
			});
		
	},
	
	render: function(force){

		if(this.paused && !force) return;
		if(!this.trace)
			this.cn.fill("black");
			
		this.balls.invoke("render", this.cn.ctx());
		this.cn.ctx().save();
	},
	
	invert: function(){
		this.balls.invoke("invertForces");
	},
			
	setCenter: function(ev){
		px = ev.pointerX();
		py = ev.pointerY();
		
		position = this.cn.el.positionedOffset();
		px -= position.left;
		py -= position.top;
		
		if(!this.followX) px = false;
		if(!this.followY) py = false;
		this.balls.invoke("setGravityCenter",
			{
				"x": px,
				"y": py,
				"z": 0
			}
		);
		
	},
	
	processInput: function(ev){
		if(!this.k){
			this.k ={
				"B": 66,
				"C": 67,
				"P": 80,
				"R": 82,
				"S": 83,
				"T": 84,
				"X": 88,
				"Y": 89,
			}
		}
		k = this.k;
		if(ev.keyCode == k.P) return this.togglePause();
		if(ev.keyCode == k.S) return this.save();
		if(ev.keyCode == k.R) return this.reset();
		if(ev.keyCode == k.T) return this.toggle("trace");
		if(ev.keyCode == k.X) return this.toggle("followX");
		if(ev.keyCode == k.Y) return this.toggle("followY");
		if(ev.keyCode == k.B) return this.toggleBoundaries();
	},
	
	
	togglePause: function(state){
		if(!state)
			return this.togglePause((this.paused)?"on":"off");
		if(state == "off"){
			this.pauseMenu("show");
			return this.paused = true;
		}
		this.pauseMenu("hide");
		return this.paused = false;
	},
	
	toggleBoundaries: function(){
		var cur = this.toggle("boundaries");
		this.balls.invoke("setBoundaries", cur);
		if(cur) this.reset();
	},
	
	pauseMenu: function(action){
		if(!this.pauseDiv){
			this.createPauseMenu();
			if(action == "hide") return;
		}
		div = this.pauseDiv;
		if(action == "show") return document.body.appendChild(div);
		div.parentNode.removeChild(div);
	},
	
	createPauseMenu: function(){	
		var width = this.cn.width/2;
		var height = this.cn.height/2;
		
		var px = (this.cn.width/2) - (width/2);
		var py = (this.cn.height/2) - (height/2);			
		var div = this.pauseDiv = new Element("div", {
			"style": "position: absolute; top: "+py+"px; left: "+px+"px; width: "+width+"px; height: "+height+"px; z-index: 50",
			"class": "pauseMenu"
		});
		
		div.appendChild(
			new Element("h1").update("<u>P</u>aused")
		);
		form = new Element("form");
		
		var els = $A(["trace", "followX", "followY", "boundaries", "numBalls", "speed", "mass", "deltaMass", "friction"]);
		els.each(
			function(form, what){
				var label = new Element("label");
				switch(what){
					case "followX": 					
						input = new Element("input", {"type": "checkbox"});
						label.appendChild( new Element("span").update("Follow cursor <u>X</u>:"));
						input.observe("click", this.toggle.bind(this, "followX"));
						if(this.followX) input.checked = true;
					break;
					case "followY": 					
						input = new Element("input", {"type": "checkbox"});
						label.appendChild( new Element("span").update("Follow cursor <u>Y</u>:"));
						input.observe("click", this.toggle.bind(this, "followY"));
						if(this.followY) input.checked = true;
					break;
					case "trace": 					
						input = new Element("input", {"type": "checkbox"});
						label.appendChild( new Element("span").update("Particle <u>T</u>racing:"));
						input.observe("click", this.toggle.bind(this, "trace"));
						if(this.trace) input.checked = true;
					break;
					case "boundaries": 					
						input = new Element("input", {"type": "checkbox"});
						label.appendChild( new Element("span").update("Enable <u>B</u>oundaries. <b>*</b>:"));
						input.observe("click", this.toggleBoundaries.bind(this));
						if(this.boundaries) input.checked = true;
					break;
					
					case "numBalls":
						input = new Element("input", {"type": "range", "min": 1, "max": 360, "value": this.numBalls});
						label.appendChild( labspan = new Element("span").update("Number of particles <b>*</b>: "));
						this.form.numBallsSpan = new Element("strong").update(this.numBalls);
						labspan.appendChild(this.form.numBallsSpan);
						input.observe("change", this.changeNumBalls.bind(this));
					break;

					case "speed":
						input = new Element("input", {"type": "range", "min": 1, "max": 20, "value": 20-this.speed});
						label.appendChild( new Element("span").update("Speed: "));
						input.observe("change", this.setSpeed.bind(this));
					break;
					case "deltaMass":
						input = new Element("input", {"type": "range", "min": 1, "max": 100, "value": this.deltaMass*20});
						label.appendChild( new Element("span").update("Delta Mass: "));
						input.observe("change", this.setMass.bind(this));
					break;
					case "mass":
						input = new Element("input", {"type": "range", "min": 5, "max": 100, "value": this.mass*100, "step": 1});
						label.appendChild( new Element("span").update("Mass: "));
						input.observe("change", this.changeMinMass.bind(this));
					break;
					case "friction":
						input = new Element("input", {"type": "range", "min": 0, "max": 100, "value": this.friction*1000, "step": 1});
						label.appendChild( new Element("span").update("Friction: "));
						input.observe("change", this.changeFriction.bind(this));
					break;
					
					default: 
						return;
					break;
				}
				form.appendChild(label);
				this.form[what] = input;
				label.appendChild(input);
			}.bind(this, form)
		);
		
		div.appendChild(form);
		div.appendChild(
			new Element("p").update("<b>*</b>: Will reset position.")
		)
	},
	
	toggle: function(what){
		if(!what) return false;
		this[what] = (this[what])?false:true;
		
		if(this.form[what])
			this.form[what].checked = (this[what])?true:false;
		
		return this[what];
	},
	
	setSpeed: function(){

		el = this.form.speed;
		num = el.value;
		if(isNaN(num)){
			alert("Invalid value for speed");
			el.value = 20-this.speed;
			return false;
		}
		num = 20-num;
		this.speed = num;
		if(num < 1) num = 1;
		if(num > 20) num = 20;
		this.balls.invoke("setFps", num);
	},

	changeMinMass: function(){
	
		el = this.form.mass;
		num = el.value;
		if(isNaN(num)){
			alert("Invalid value for mass");
			el.value = this.mass*100;
			return false;
		}
		num = num/100;
		if(num < 0.05) num = 0.05;
		if(num > 1) num = 1;
		
		this.mass = num;
		this.setMass();
	},
	
	setMass: function(){
	
		el = this.form.deltaMass;
		num = el.value;
		if(isNaN(num)){
			alert("Invalid value for delta mass");
			el.value = this.deltaMass;
			return false;
		}

		if(num < 1) num = 1;
		if(num > 100) num = 100;
		this.deltaMass = num/20;
		this.balls.each(function(ball){
			var mass = this.mass;
			mass += Math.random()*(this.deltaMass);

			ball.setMass(mass);
		}.bind(this));
		
		this.render(true);
	},
	
	changeFriction: function(){
	
		el = this.form.friction;
		num = el.value;
		if(isNaN(num)){
			alert("Invalid value for friction");
			el.value = this.friction*1000;
			return false;
		}

		if(num < 0) num = 0;
		if(num > 100) num = 100;
		this.friction = num/1000;
		this.balls.invoke("setFriction", this.friction);
		
	},
	
	changeNumBalls: function(){
		el = this.form.numBalls;
		num = el.value;
		if(isNaN(num)){
			alert("Invalid value for number of particles");
			el.value = this.numBalls;
			return false;
		}
		if(num < 1) num = 1;
		if(num > 360) num = 360;
		this.numBalls = num;
		this.form.numBallsSpan.update(num);
		this.reset();
		this.render(true);
	},
	
	save: function(){
		this.togglePause();
		uri = this.cn.save();
	}
	
	
	
});