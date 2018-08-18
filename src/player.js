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
 * along with this program (LICENCE-AGPL-v3.txt).
 * If not, see <http://www.gnu.org/licenses/>.
 */
const ANIM_FRAMES_PER_SECOND = 12;
const ANIM_TICKS_PER_FRAME = Math.floor(TICKS_PER_SECOND / ANIM_FRAMES_PER_SECOND);

const FACING_LEFT = true;
const FACING_RIGHT = false;

const ANIM_DEATH_FRAMES = 5;
const ANIM_DEATH_TICKS_PER_FRAME = ANIM_TICKS_PER_FRAME / 2;
const ANIM_DEATH_TICKS_TOTAL = ANIM_DEATH_FRAMES * ANIM_DEATH_TICKS_PER_FRAME;

const PLAYER_MAX_HP = 2;

function Player(x, y) {
	this.x = x;
	this.y = y;
	this.w = 0.98;
	this.h = 0.98;
	this.facing = FACING_RIGHT;
	this.xVel = 0;
	this.yVel = null;
	this.health = 1;
	this.invul = 0;
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

function canPowerUp() {
	return player.health < PLAYER_MAX_HP;
}

function canPowerDown() {
	return player.health > 1;
}

function powerUp() {
	if(!canPowerUp()) return;
	
	Sfx.play(oneUpSfx);
	viewport.setScale(viewport.getScale() + 4);
	player.health += 1;
	
	Achievements.add(ACHIEV_ONE_UP);
}

function powerDown() {
	if(!canPowerDown()) return;
	
	Sfx.play(oneDownSfx);
	viewport.setScale(viewport.getScale() - 4);
	player.health -= 1;
	player.invul = INVUL_CYCLES;
	
	Achievements.add(ACHIEV_ONE_DOWN);
}
