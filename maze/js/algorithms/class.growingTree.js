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


GrowingTree = Class.create({
	maze: false,
	list: false,
	
	initialize: function(maze){
		this.maze = maze;
	},
	
	reset: function(){
		this.list = $A();
		var cell = this.maze.randomCell();
		this.list.push(cell);
	},
	
	generate: function(){
		while(this.list.length){
			this.step();
		}
	},
	
	running: function(){
		return (!!this.list.length);
	},
	
	step: function(render){
		var list = this.list;
		var ret = false;
		var ncell = false;
		var oposite = {
			'top':    'bottom',
			'right':  'left',
			'bottom': 'top',
			'left':   'right'
		}


    	var cell = list.last();
    	
		if(ret = this.maze.getNeighbor(cell, false, false, 0)){
    		ncell = ret.cell;
    		
    		cell.carvePath(ret.which);
    		ncell.carvePath(oposite[ret.which]);

    		ncell.status = 1;
    		list.push(ncell);
			if(render)
	    		this.maze.renderCells(cell, ncell);
    		
    	}else{
    		list.pop(cell);
    		cell.status = 2;
			if(render)    		
	    		this.maze.renderCells(cell);
    	}

		return list;	

	}
});