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

Canvas = Class.create({
				el: false,
				
				_ctx: false,
				
				width: false,
				
				height: false,
				
				initialize: function(parent, width, height){
					if(parent = $(parent)){
						this.parent = parent;
					}else{
						parent = this.parent = $(document.body);
					}
					

					
					if(!width && !height){
						var size = parent.getDimensions();

						width = size.width;
						height = size.height;
					}
					
					if(!height){
						height = width;
					}
					
					if(this.getCanvas(width, height)){
						this.width = width;
						this.height = height;
					}
					
					
				},
				
				ctx: function(){
					return this.el.getContext('2d');
				},
				
				clear: function(){
					this.ctx().clearRect(0,0, this.width, this.height);
					
				},
				
				fill: function(color){
					ctx = this.ctx();
					this.clear();
					ctx.beginPath();
					ctx.fillStyle = color;
					ctx.fillRect(0,0, this.width, this.height);
					ctx.fill();
				},
				
				createCanvas: function(width, height){
					cn = new Element('canvas', {'width': width, 'height': height});
					if(!cn.getContext) throw('No Canvas Support');
					if(!document.body) throw('Body not loaded');
					this.parent.appendChild(cn);
					return cn;
				},
				
				getCanvas: function(width, height){
					if(this.el) return this.el;
					this.el = this.createCanvas(width, height);
					this._ctx = this.el.getContext('2d');
					
					this._ctx.save();
					return this.el;
				},
				
				save: function(){
					window.open(this.el.toDataURL());
				}
			});
			