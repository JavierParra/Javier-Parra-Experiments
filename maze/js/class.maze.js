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

function array_random(array){
	return Math.floor(Math.random()*array.length);
}

Maze = Class.create({
	configurable: ['w', 'h', 'cell', 'parent', 'color', 'borderColor', 'bordersize'],
	cn: false,
	grid: false,
	list: false,
	algorithm: false,
	
	initialize: function(algorithm, conf){
		this.size = {};
		this.parseConfig(conf);

		if(!algorithm){
			throw('No algorithm supplied');
		}
		
		this.algorithm = new (window[algorithm])(this);

		if(!this.algorithm){
			throw('Algorithm '+algorithm+' is invalid');
		}
		
		this.game = new Game(this);
		
		this.reset();

		this.generate();
	},
	
	parseConfig: function(conf){
		conf = $H(conf);
		
		conf.each(
			function(pair){
				if(this.configurable.indexOf(pair.key) == -1) return;
				switch(pair.key){
					case 'w':
					case 'h':
					case 'cell':
						this.size[pair.key] = pair.value;
					break
					case 'color':
					case 'borderColor':
						var col = $H(pair.value);
						if(!col.get('r') || !col.get('g') || !col.get('b')) return;
					default:
						this[pair.key] = pair.value;
					break;
				}
				
			}.bind(this)
		);
		this.parent = $(this.parent);
		if(!this.parent){
			this.parent = $(document.body);
		}
		
		if(!this.size.w && this.size.h){
			this.size.w = this.size.h;
		}
	
		if(this.size.w && !this.size.h){
			this.size.h = this.size.w;
		}
		
		if(!this.size.w && !this.size.h){
			if(!(cellSize = this.size.cell)){
				cellSize = this.size.cell = 25;
			}
			var parentSize = this.parent.getDimensions();
			parentSize.height = (parentSize.height)?parentSize.height:parentSize.width;
			
			
			this.size.w = Math.floor(parentSize.width / cellSize);
			this.size.h = Math.floor(parentSize.height / cellSize);
		}
		

	},
	
	reset: function(){
		this.grid = $A();
		this.render();
		this.generateGrid();
		this.algorithm.reset();
	},

	generateGrid: function(){
		var grid = $A();
		var cell = (this.size.cell)?this.size.cell:25;
		for(var row = 0; row < this.size.h; row++){
			grid[row] = $A();
			for(var col = 0; col < this.size.w; col++){
				grid[row][col] = new Cell(col, row, cell);
			}		
		}
		
		this.grid = grid;
	},

	
	generate: function(){
		this.algorithm.generate();
		this.render();
	},
	
	animate: function(){
		if(!this.animating){
			this.doAnimate();
			this.animating = true;
		}else{
			this.animating = false;		
			clearTimeout(this.to);
		}
	},
	
	doAnimate: function(){
		if(this.algorithm.running()){
			this.step(true);
			this.to = setTimeout(this.doAnimate.bind(this), 10);
		}else{
/* 			this.render(); */
			this.animating = false;
		}	
	},

	step: function(render){
		this.algorithm.step(render);
	},
	
	randomCell: function(){
		var grid = this.grid;
		var y = array_random(grid);
		var x = array_random(grid[y]);
		
		return cell = grid[y][x];
	},
	
	getNeighbor: function(cell, which, invalid, targetStatus){
		if(!targetStatus) targetStatus = 0;
		if(!cell) return false;
		var aval = ['top', 'right', 'bottom', 'left'];
		
		if(!invalid){
			var invalid = {};
		}
		while(!which){
			var key = array_random(aval);
			which = aval[key];
			if(invalid[which]){
				which = false;
				aval.splice(key, 1);
/* 				console.log(aval); */
			}
			if(aval.length == 0) return false;
		}
		
		var x = cell.position.get('x');
		var y = cell.position.get('y');
		
		switch(which){
				case 'top':
					nx = x;
					ny = y-1;
				break;
				case 'right':
					nx = x+1;
					ny = y;
				break;
				case 'bottom':
					nx = x;
					ny = y+1;
				break;
				case 'left':
					nx = x-1;
					ny = y;
				break;
		}
		
		var newCell = (this.grid[ny])?this.grid[ny][nx]:undefined;
		
		if(!newCell || newCell.status != targetStatus){
			invalid[which] = true;
			return this.getNeighbor(cell,false,invalid);
		}
/* 		console.log(x, y, 'returning '+which); */
		return {'which': which, 'cell': newCell};
		
	},
	
	cn: function(){
		return this.canvas = (this.canvas)?this.canvas:new Canvas(this.parent);
	},
	
	render: function(){
		cn = this.cn();
		cn.fill("black");
/* 		console.log(this, this.boss); */
		if(this.boss) this.game.fillImage(this.cn());
		ctx = cn.ctx();
		if(this.grid)
			this.grid.invoke('invoke', 'render', ctx);

		return true;
	},
	
	
	renderCells: function(){
		var cn = this.cn();
		var cells = $A(arguments);
		cells.invoke('render', cn.ctx());
	},
	
	loading: function(st){
		
	}
	
});

Game = Class.create({
	initialize: function(maze){
		this.maze = maze;
	},	
	
	play: function(){
		var maze = this.maze;
		var cell = false;
		this.start = this.current = cell = maze.randomCell();
		cell.setFlag(37,215,42);
		do{
			this.goal = cell = maze.randomCell();
		}while(this.goal == this.start);
		cell.setFlag(215,19,33);

		if(!this.observing){
			Event.observe(window, 'keydown', this.doPlay.bindAsEventListener(this));
			this.observing = true;
		}
		
		maze.generate();		
		maze.loading(0);
	},
	
	doPlay: function(ev){
		var direction;
		switch(ev.keyCode){
			case Event.KEY_UP:
				direction = 'top';
			break;
			case Event.KEY_RIGHT:
				direction = 'right';
			break;
			case Event.KEY_DOWN:
				direction = 'bottom';
			break;
			case Event.KEY_LEFT:
				direction = 'left';
			break;
			case 82:
				return this.restore();
			break;
			case 83:
				return this.saveCheckpoint();
			break;
			case 87:
				this.cheat = 87;
				return;
			break;
			case 73:
				if(this.cheat == 87) this.cheat = 73;
				return;
			break;
			case 78:
				if(this.cheat == 73){
					this.cheat = false;
					this.cheated = true;
					this.instantWin();
				}
				return;
			break;
			default:
				this.cheat = false;
				return;
			break;
		}
		
		var maze = this.maze;
		var cell = this.current;
		if(!cell.paths.get(direction)) return;

		var newCell = maze.getNeighbor(cell, direction, false, 2);

		if(!newCell.cell) return;
		newCell = newCell.cell;
		newCell.setFlag(37,215,42);
		if(cell == this.start){
			cell.setFlag(5,127,226)
		}else{
			cell.removeFlag();
		}
		
		if(newCell == this.goal){
			
			maze.parseConfig({'cell': Math.ceil(maze.size.cell/2), 'w':0, 'h':0});

			if(maze.size.cell <= 5){
				var msg = "You solve mazes.\nLike a Boss!!!";
				if(this.cheated){
					maze.boss = 'cheat';
					msg += "\n With a little bit of help ;)";
				}else{
					maze.boss = true;
				}
				alert(msg);
				maze.reset();
				maze.animate();
			}else{
				if(maze.size.cell <= 10)
					alert('Last Level!!!');
				else
					alert('Next Level');
				maze.loading(1);
				maze.reset();
				this.play();
			}
			return;
		}
		
		this.current = newCell;
		maze.renderCells(newCell, cell);
	},
	
	saveCheckpoint: function(){
		this.start.removeFlag();
		maze.renderCells(this.start);
		this.start = this.current;
	},
	
	restore: function(){
		var prev = this.current;
		var cell = this.start;

		prev.removeFlag();
		this.current = cell;
		cell.setFlag(37,215,42);
		this.maze.renderCells(prev, cell);	
	},
	
	instantWin: function(){
		var prev = this.current;
		var goal = this.goal;
		var ret;
		do{
			ret = this.maze.getNeighbor(goal, false, false, 2);
		}while(!goal.paths.get(ret.which));
		var cell = this.current = ret.cell;
		prev.removeFlag();
		cell.setFlag(37,215,42);
		this.maze.renderCells(prev, cell);
	},

	fillImage: function(cn){
		var src = 'images/boss.jpg';
		if(maze.boss == 'cheat'){
			src = 'images/cheat.jpg';
		}
		img = new Image();
		img.src = src;
		img.onload = function(){
			console.log(img.height, img.width, cn.height, cn.width);
			var top = (cn.height/2)-(img.height/2);
			var left =(cn.width/2)-(img.width/2);
			cn.ctx().drawImage(img,left,top);
		}.bind(this);
		maze.boss = false;
	}
});

Cell = Class.create({
	size: 25,
	lineWidth: 2,
	
	status: 0,
	position: false,
	paths: false,
	
	initialize: function(x, y, size){
		this.position = $H({
			'x': x,
			'y': y
		});
		
		this.paths = $H({
			'top': false,
			'right': false,
			'bottom': false,
			'left': false
		});
		
		if(size){
			this.size = size;
		}
		
		this.status = 0;//Math.floor(Math.random()*3);
		this.setColor(255,255,255);
	},

	setFlag: function(r,g,b){
	    this.red = Math.ceil(r);
	    this.green = Math.ceil(g);
	    this.blue = Math.ceil(b);
	    this.flag = "rgb("+this.red+", "+this.green+", "+this.blue+")";
	},
	
	removeFlag: function(){
		this.flag = false;
	},

	setColor: function(r,g,b){
	    this.red = Math.ceil(r);
	    this.green = Math.ceil(g);
	    this.blue = Math.ceil(b);
	    this.color = "rgb("+this.red+", "+this.green+", "+this.blue+")";
	},
	
	carvePath: function(where){
		this.paths.set(where, true);
	},
					
	render: function(ctx){
		var x = this.position.get('x') * this.size;
		var y = this.position.get('y') * this.size;

		ctx.lineWidth = Math.ceil(this.lineWidth/2);
/* 		ctx.lineWidth = this.lineWidth; */


		
		var colors = [
			'rgb(100,100,100)',
			"rgb(255,200,200)",
			this.color
		];
		
		ctx.fillStyle = colors[this.status];
		ctx.strokeStyle = "rgb(0,0,0)";
		

		ctx.beginPath();
		ctx.rect(x, y, this.size, this.size);
		ctx.fill();
		ctx.closePath();



		ctx.beginPath();
		ctx.moveTo(x, y);
		
		this.paths.each(function(pair){
			var offX = 0;
			var offY = 0;
			switch(pair.key){
				case 'top':
					nx = x+this.size;
					ny = y;
/* 					offY = this.lineWidth; */
				break;
				case 'right':
					nx = x+this.size;
					ny = y+this.size;
/* 					offX = -this.lineWidth; */
				break;
				case 'bottom':
					nx = x;
					ny = y+this.size;

/* 					offY = -this.lineWidth; */
				break;
				case 'left':
					nx = x;
					ny = y;

/* 					offX = this.lineWidth; */
				break;
			}

			if(!pair.value){
/* 				ctx.moveTo(x, y); */
				ctx.lineTo(nx+offX, ny+offY);
				
			}else{
				ctx.moveTo(nx, ny);

			}
		}.bind(this));
		
		ctx.stroke();
		ctx.closePath();
		
		if(this.flag){
			ctx.beginPath();
			ctx.fillStyle = this.flag;
			ctx.arc(x+(this.size/2), y+(this.size/2), this.size/3, 0, Math.PI*2, false);
			ctx.fill();
		}
	}
	
});