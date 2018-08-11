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
const ANIM_FRAMES_PER_SECOND = 12;
const ANIM_TICKS_PER_FRAME = Math.floor(TICKS_PER_SECOND / ANIM_FRAMES_PER_SECOND);

const FACING_LEFT = 1;
const FACING_RIGHT = 0;

function Player(x, y) {
	this.x = x;
	this.y = y;
	this.w = 8;
	this.h = 8;
	this.facing = FACING_RIGHT;
	this.xVel = 0;
	this.yVel = null;
	this.dead = null;
	
	this.animate = function(dt) {
		this.animationTicks += dt;
		if(this.animationTicks < ANIM_TICKS_PER_FRAME) return;
		this.animationTicks -= ANIM_TICKS_PER_FRAME;
		
		this.calcFrame = (this.calcFrame + 1) % 4;
		this.frame = this.calcFrameToFrame();
	};
	
	this.calcFrameToFrame = function() {
		switch(this.calcFrame) {
			case 0:
			case 2:
				return 1;
			
			case 1:
				return 2;
			
			case 3:
				return 0;
		}
	};
	
	this.stopAnimation = function() {
		this.calcFrame = 0;
		this.frame = this.calcFrameToFrame();
		
		this.animationTicks = 0;
	};
	
	this.falling = function() {
		return this.yVel > 0;
	};
	
	this.jumping = function() {
		return this.yVel < 0;
	};
	
	this.stopAnimation();
}
