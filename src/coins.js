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
const COIN_ANIM_FRAMES = 4;
const COIN_ANIM_FPS = 8;
const COIN_ANIM_TICKS = Math.floor(1000 / COIN_ANIM_FPS);

function Coins(map) {
	this.__map = map;
	this.__list = [];
	
	for(let y = 0; y < map.h; ++y) {
		for(let x = 0; x < map.w; ++x) {
			if(map.data[y][x] == -1) {
				this.__list.push({'x': x, 'y': y});
			}
		}
	}
	
	this.collect = function(x, y) {
		x = Math.floor(x / 8);
		y = Math.floor(y / 8);
		
		if((x < 0) || (y < 0)) return;
		if((x >= this.__map.w) || (y >= this.__map.h)) return;
		
		if(this.__map.data[y][x] !== -1) return;
		this.__map.data[y][x] = 0;
		
		let count = this.__list.length;
		for(let idx = 0; idx < count; ++idx) {
			let e = this.__list[idx];
			
			if((e.x === x) && (e.y === y)) {
				Sfx.play(coinSfx);
				this.__list.splice(idx, 1);
				return;
			}
		}
	};
	
	this.render = function() {
		let frame = Math.floor(getTicks() / COIN_ANIM_TICKS) % COIN_ANIM_FRAMES;
		
		let count = this.__list.length;
		for(let idx = 0; idx < count; ++idx) {
			let e = this.__list[idx];
			ctx.drawImage(coinGfx, frame*8, 0, 8, 8, e.x*8, e.y*8, 8, 8);
		}
	};
}
