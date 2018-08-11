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
const ACHIEV_JUMP     = 0;
const ACHIEV_COIN     = 1;
const ACHIEV_LAND     = 2;
const ACHIEV_OUCH     = 3;
const ACHIEV_SKY      = 4;
const ACHIEV_WALLHIT  = 5;
const ACHIEV_SPIKES   = 6;
const ACHIEV_PLAYTIME = 7;

const AchievementSteps = [1, 5, 10, 25, 50, 75, 100, 200, 300, 400, 500];

function __achievements() {
	this.reset = function() {
		this.list = [];
		this.stack = [];
	};
	
	this.add = function(achiev, bumpToNextRank) {
		let steps = AchievementSteps.length;
		
		if(!this.list[achiev]) this.list[achiev] = 0;
		if(bumpToNextRank) {
			for(let idx = 0; idx < steps; ++idx) {
				if(this.list[achiev] < AchievementSteps[idx]) {
					this.list[achiev] = AchievementSteps[idx];
					break;
				}
			}
		} else {
			this.list[achiev] += 1;
		}
		
		for(let idx = 0; idx < steps; ++idx) {
			if(this.list[achiev] == AchievementSteps[idx]) {
				this.stack.push({'type': achiev, 'step': idx});
				Sfx.play(achievSfx);
				
				return;
			}
		}
	};
	
	this.render = function() {
		const AchievSize = 24;
		const HalfSize = AchievSize / 2;
		
		let minY = 0;
		let maxY = canvas.height - AchievSize - Math.floor((canvas.height % AchievSize)/2);
		let minX = Math.floor((canvas.width % AchievSize)/2);
		let maxX = canvas.width;
		
		let x = minX;
		let y = maxY;
		let dir = 'r';
		
		let count = this.stack.length;
		for(let idx = 0; idx < count; ++idx) {
			let a = this.stack[idx];
			ctx.drawImage(achievGfx, AchievSize * a.step, AchievSize * a.type, AchievSize, AchievSize, x, y, AchievSize, AchievSize);
			
			if(dir === 'r') {
				x += AchievSize;
				if(x + AchievSize*2 > maxX) {
					dir = 'u';
					maxY = y;
				}
			} else if(dir === 'u') {
				y -= AchievSize;
				if(y - AchievSize < minY) {
					dir = 'l';
					maxX = x;
				}
			} else if(dir === 'l') {
				x -= AchievSize;
				if(x - AchievSize < minX) {
					dir = 'd';
					minY = y + AchievSize;
				}
			} else if(dir === 'd') {
				y += AchievSize;
				if(y + AchievSize*2 > maxY) {
					dir = 'r';
					minX = x + AchievSize;
				}
			}
		}
	};
	
	this.reset();
}

var Achievements = new __achievements();
