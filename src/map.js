/**
 * LD42
 * Copyright (C) 2018 Artur "suve" Iwicki
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program (LICENCE.txt). 
 * If not, see <http://www.gnu.org/licenses/>.
 */
const TILE_SPIKES = 3;
const TILE_COIN = -1;

function Map(data) {
	this.data = data;
	this.h = data.length;
	this.w = data[0].length;
	this.canvas = null;
	
	this.__stickQuart = function(tile, neighbour, sticky) {
		return sticky ? (neighbour > 0) : (neighbour == tile);
	};
	
	this.__calculateQuarts = function(sticky) {
		const ADJACENT_X = 1;
		const ADJACENT_Y = 2;
		const ADJACENT_CORNER = 4;
		
		this.quarts = []
		for(let y = 0; y < this.h; ++y) {
			this.quarts[y] = []
		}
		
		for(let y = 0; y < this.h; ++y) {
			for(let x = 0; x < this.w; ++x) {
				// Reset
				let quarts = {
					'tl': 0,
					'tr': 0,
					'bl': 0,
					'br': 0
				};
				
				// Check above and below
				if((y == 0) || this.__stickQuart(this.data[y][x], this.data[y-1][x], sticky)) {
					quarts.tl += ADJACENT_Y; quarts.tr += ADJACENT_Y;
				}
				if((y >= this.h-1) || this.__stickQuart(this.data[y][x], this.data[y+1][x], sticky)) {
					quarts.bl += ADJACENT_Y; quarts.br += ADJACENT_Y;
				}
				  
				// Check left and right
				if((x == 0) || this.__stickQuart(this.data[y][x], this.data[y][x-1], sticky)) {
					quarts.tl += ADJACENT_X; quarts.bl += ADJACENT_X;
				}
				if((x >= this.w-1) || this.__stickQuart(this.data[y][x], this.data[y][x+1], sticky)) {
					quarts.tr += ADJACENT_X; quarts.br += ADJACENT_X;
				}
				
				// Check corners.
				if((x == 0)        || (y == 0)        || this.__stickQuart(this.data[y][x], this.data[y-1][x-1], sticky)) quarts.tl += ADJACENT_CORNER;
				if((x >= this.w-1) || (y == 0)        || this.__stickQuart(this.data[y][x], this.data[y-1][x+1], sticky)) quarts.tr += ADJACENT_CORNER;
				if((x >= this.w-1) || (y >= this.h-1) || this.__stickQuart(this.data[y][x], this.data[y+1][x+1], sticky)) quarts.br += ADJACENT_CORNER;
				if((x == 0)        || (y >= this.h-1) || this.__stickQuart(this.data[y][x], this.data[y+1][x-1], sticky)) quarts.bl += ADJACENT_CORNER;
				
				this.quarts[y][x] = quarts;
			}
		}
	};
	
	this.__renderQuart = function(tile, dx, dy, qx, qy, mapped) {
		this.ctx2d.drawImage(worldGfx, qx + mapped*8, qy + (tile-1)*8, 4, 4, dx+qx, dy+qy, 4, 4);
	};
	
	this.__renderTile = function(tile, quarts, dx, dy) {
		const QuartMap = [3,1,2,4,3,1,2,0];
		this.__renderQuart(tile, dx, dy, 0, 0, QuartMap[quarts.tl]);
		this.__renderQuart(tile, dx, dy, 4, 0, QuartMap[quarts.tr]);
		this.__renderQuart(tile, dx, dy, 4, 4, QuartMap[quarts.br]);
		this.__renderQuart(tile, dx, dy, 0, 4, QuartMap[quarts.bl]);
	}
	
	this.__allocCanvas = function() {
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.w * 8;
		this.canvas.height = this.h * 8;
		this.ctx2d = this.canvas.getContext('2d', { 'alpha': false });
	};
	
	this.__render = function(sticky) {
		this.__allocCanvas();
		
		this.ctx2d.fillStyle = '#00c0ff';
		this.ctx2d.fillRect(0, 0, this.canvas.width, this.canvas.height);
		
		this.__calculateQuarts(sticky);
		for(let y = 0; y < this.h; ++y) {
			for(let x = 0; x < this.w; ++x) {
				let type = this.data[y][x];
				if(type > 0) this.__renderTile(type, this.quarts[y][x], x*8, y*8);
			}
		}
		
		this.quarts = null;
	};
	
	this.collides = function(x, y) {
		x = Math.floor(x / 8);
		y = Math.floor(y / 8);
		
		if((x < 0) || (y < 0)) return true;
		if((x >= this.w) || (y >= this.h)) return true;
		
		return this.data[y][x] > 0;
	}
	
	this.draw = function() {
		if(this.canvas === null) this.__render(true);
		
		ctx.drawImage(this.canvas, 0, 0);
	}
}
