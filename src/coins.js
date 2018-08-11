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
			if(map.data[y][x] == TILE_COIN) {
				this.__list.push({'x': x, 'y': y, 'dead': null});
			}
		}
	}
	
	this.collect = function(x, y) {
		x = Math.floor(x);
		y = Math.floor(y);
		
		if((x < 0) || (y < 0)) return;
		if((x >= this.__map.w) || (y >= this.__map.h)) return;
		
		if(this.__map.data[y][x] !== TILE_COIN) return;
		this.__map.data[y][x] = 0;
		
		let count = this.__list.length;
		for(let idx = 0; idx < count; ++idx) {
			let e = this.__list[idx];
			
			if((e.x === x) && (e.y === y)) {
				Achievements.add(ACHIEV_COIN);
				Sfx.play(coinSfx);
				e.dead = 0;
				return;
			}
		}
	};
	
	this.decay = function(dt) {
		let count = this.__list.length;
		
		let idx = 0;
		while(idx < count) {
			let e = this.__list[idx];
			if(e.dead !== null) {
				e.dead += dt;
				if(e.dead >= COIN_ANIM_FRAMES * (COIN_ANIM_TICKS / 2)) {
					this.__list.splice(idx, 1);
					--count;
					
					continue;
				}
			}
			
			++idx;
		}
	}
	
	this.render = function() {
		let scale = viewport.getScale();
		let liveFrame = Math.floor(getTicks() / COIN_ANIM_TICKS) % COIN_ANIM_FRAMES;
		
		let count = this.__list.length;
		for(let idx = 0; idx < count; ++idx) {
			let e = this.__list[idx];
			if(e.dead === null) {
				ctx.drawImage(coinGfx, liveFrame*8, 0, 8, 8, e.x*scale, e.y*scale, scale, scale);
			} else {
				let deadFrame = Math.floor(e.dead / (COIN_ANIM_TICKS / 2));
				ctx.drawImage(coinGfx, deadFrame*8, 8, 8, 8, e.x*scale, e.y*scale, scale, scale);
			}
		}
	};
}
