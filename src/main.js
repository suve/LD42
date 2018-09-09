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

// Game config (yeah, global consts, fight me)
const TICKS_PER_SECOND = 1000;

const CYCLES_PER_SECOND = 50;
const CYCLE_SECONDS = 1 / CYCLES_PER_SECOND;
const CYCLE_TICKS = Math.floor(TICKS_PER_SECOND / CYCLES_PER_SECOND);

const PLAYER_ACCEL = 360 / 8;
const PLAYER_MAX_SPEED = 96 / 8;
const PLAYER_JUMP_FORCE = 88 / 8;
const GRAVITY = 88 / 8;
const LAND_SFX_THRESHOLD = GRAVITY * 0.75;
const LAND_HARD_THRESHOLD = GRAVITY * 1.33;
const OUCH_SFX_THRESHOLD = -PLAYER_JUMP_FORCE / 2;
const AIR_CONTROL = 0.33;

const INVUL_CYCLES = Math.floor(CYCLES_PER_SECOND * 2.25);
const INVUL_BLINK_CYCLES = CYCLES_PER_SECOND / 10;

const DEATH_TIME = 0.48;
const DEATH_ANIM_TIME = DEATH_TIME * 0.9;

const WALKER_ACCEL = 120 / 8;
const WALKER_MAX_SPEED = 36 / 8;

const JUMPER_ACCEL = 96 / 8;
const JUMPER_MAX_SPEED = 30 / 8;
const JUMPER_JUMP_FORCE = 72 / 8;
const JUMPER_JUMP_TRIGGER = 10;

const JUMPER_AIR_ACCEL_FACTOR = 0.75;
const JUMPER_AIR_SPEED_FACTOR = 1.5;


// Ugh
const ARROW_LEFT = 37;
const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;

// Global vars, fuck yeah
var appstart;
var canvas, ctx, fadeout, shaking, viewport;

var keystate = [];
var items, map;

const LEVELS_TOTAL = 4;
var levelNo = 0;
var inGame = false;

var player = null;
var enemies = [];

var logoGfx = [];
var coinGfx = [], potionGfx = [];
var playerGfx = [], walkerGfx = [], jumperGfx = [];
var worldGfx = [];
var achievGfx;

var achievSfx, levelFinishedSfx;
var jumpSfx, landSfx, landHardSfx, spikesSfx, ouchHeadSfx, ouchWallSfx;
var walkerAttackSfx, walkerDeathSfx;
var jumperAttackSfx, jumperDeathSfx, jumperJumpSfx;
var coinSfx, oneUpSfx, oneDownSfx;
var numfont, numfontGfx;


function getTicks() {
	var d = new Date();
	return d.getTime() - appstart;
}

var fpsTicks, fpsOld, fpsNow;

function countFPS() {
	let tikk = getTicks();
	
	if(fpsTicks) {
		fpsNow += 1;
		
		if(tikk - fpsTicks >= TICKS_PER_SECOND) {
			fpsOld = fpsNow;
			fpsNow = 0;
			fpsTicks += TICKS_PER_SECOND;
		}
	} else {
		fpsNow = 1;
		fpsOld = '?';
		fpsTicks = tikk;
	}
	
	return fpsOld;
}

function fillRect(x,y,w,h,col) {
	if(w === null) w = canvas.width;
	if(h === null) h = canvas.height;

	if(col !== null) ctx.fillStyle = col;
	ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

function fillCircle(x,y,r,col) {
	if(col !== null) ctx.fillStyle = col;
	
	ctx.beginPath();
	ctx.arc(Math.floor(x), Math.floor(y), Math.floor(r), 0, Math.PI*2);
	ctx.fill();
}

function fillAnnulus(x, y, r_out, r_in, col) {
	if(col !== null) ctx.fillStyle = col;
	
	ctx.beginPath();
	if(r_in > 0) ctx.arc(x, y, r_in, 0, Math.PI*2, true);
	ctx.arc(x, y, r_out, 0, Math.PI*2);
	ctx.fill();
}

function fillTriangle(x1, y1, x2, y2, x3, y3, col) {
	if(col !== null) ctx.fillStyle = col;
	
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.lineTo(x3, y3);
	ctx.fill();
}

function printText(x, y, text, size, colour) {
	if(size !== null) ctx.font = size+'px monospace';
	if(colour !== null) ctx.fillStyle = colour;
	
	ctx.textAlign = 'start';
	ctx.textBaseline = 'top';
	ctx.fillText(text.toString(), x, y);
}

function printTextCentered(x, y, text, size, colour) {
	if(size !== null) ctx.font = size+'px monospace';
	if(colour !== null) ctx.fillStyle = colour;
	
	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	ctx.fillText(text.toString(), x, y);
}

function drawPlayer() {
	if(player.invul > 0) {
		let phase = Math.floor(player.invul / INVUL_BLINK_CYCLES);
		if(phase % 2 == 0) return;
	}
	
	let scale = viewport.getScale();
	
	let frame, face;
	if(player.dead === null) {
		if(player.jumping())
			frame = 3;
		else if(player.falling())
			frame = 4;
		else
			frame = player.frame;
		
		face = player.facing; 
	} else {
		frame = Math.floor(player.dead * TICKS_PER_SECOND / ANIM_DEATH_TICKS_PER_FRAME);
		face = 2; // magic numbers FTW
	}
	
	ctx.drawImage(playerGfx[scale], frame*scale, face*scale, scale, scale, Math.floor(player.x*scale), Math.floor((player.y-1)*scale), scale, scale);
}

function drawWalker(e) {
	let scale = viewport.getScale();
	
	let frame, face;
	if(e.dead === null) {
		frame = e.frame;
		face = e.facing; 
	} else {
		frame = Math.floor(e.dead / ANIM_DEATH_TICKS_PER_FRAME);
		face = 2; // magic numbers FTW
	}
	
	ctx.drawImage(walkerGfx[scale], frame*scale, face*scale, scale, scale, Math.floor(e.x*scale), Math.floor((e.y-1)*scale), scale, scale);
}

function drawJumper(e) {
	let scale = viewport.getScale();
	
	let frame, face;
	if(e.dead === null) {
		if(e.jumping())
			frame = 3;
		else if(e.falling())
			frame = 4;
		else
			frame = e.frame;
		
		face = e.facing; 
	} else {
		frame = Math.floor(e.dead / ANIM_DEATH_TICKS_PER_FRAME);
		face = 2; // magic numbers FTW
	}
	
	ctx.drawImage(jumperGfx[scale], frame*scale, face*scale, scale, scale, Math.floor(e.x*scale), Math.floor((e.y-1)*scale), scale, scale);
}

function drawEnemies() {
	let count = enemies.length;
	for(let idx = 0; idx < count; ++idx) {
		let e = enemies[idx];
		if(e.type == 0)
			drawWalker(e);
		else
			drawJumper(e);
	}
}

function secondsToTime(secs) {
	secs = Math.floor(secs);
	if(secs < 60) return '0:' + secs.toString().padStart(2, '0');
	
	
	let mins = Math.floor(secs / 60);
	secs %= 60;
	
	if(mins < 60) return mins + ':' + secs.toString().padStart(2, '0');
	
	
	let hrs = Math.floor(mins / 60);
	mins %= 60;
	
	return hrs + ':' + mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
}

function drawFrame() {
	let scale = viewport.getScale();
	viewport.update(player);
	if(shaking) { viewport.x += shaking.magnitude.x; viewport.y += shaking.magnitude.y; }
	
	ctx.restore(); ctx.save();
	ctx.translate(-Math.floor(viewport.x * scale), -Math.floor(viewport.y * scale));
	
	map.draw();
	items.render();
	drawEnemies();
	drawPlayer();
	
	ctx.restore(); ctx.save();
	if(shaking) shaking.draw();
	Achievements.render();
	
	let fps = countFPS();
	numfont.print(fps, canvas.width-numfont.textWidth(fps)-1, 1);
	
	let secs = Achievements.playtimeTicks / TICKS_PER_SECOND;
	numfont.print(secondsToTime(secs), 1, 1);
	
	let coins = Achievements.getCoinCount();
	numfont.print(coins, Math.floor((canvas.width - numfont.textWidth(coins)) / 2), 1);
	
	if(player.dead !== null) {
		let perc = player.dead / DEATH_ANIM_TIME;
		fadeout.draw(perc);
		
		drawLogo();
	}
}

function drawLogo(scale) {
	const LogoPos = [5, 60, 100, 130];
	
	if(scale === undefined) scale = 1.0;
	
	let pieces = logoGfx.length;
	for(let idx = 0; idx < pieces; ++idx) {
		if(!logoGfx[idx].complete) return;
		
		let w = Math.floor(logoGfx[idx].width * scale);
		let h = Math.floor(logoGfx[idx].height * scale);
		ctx.drawImage(logoGfx[idx], Math.floor((canvas.width - w) / 2), Math.floor(LogoPos[idx]*scale), w, h);
	}
}

const LoadingLogoScale = 0.85;

function drawFrame_loading() {
	fillRect(0, 0, null ,null, 'black');
	drawLogo(LoadingLogoScale);
	
	let files = Assets.getList();
	let count = files.length;
	
	let done = 0;
	let errors = [];
	for(let idx = 0; idx < count; ++idx) {
		if(files[idx].ready === ASSET_READY)
			++done;
		else if(files[idx].ready === ASSET_ERROR)
			errors.push(files[idx].path);
	}
	
	let text;
	if(errors.length) {
		let seconds = Math.floor(getTicks() / TICKS_PER_SECOND);
		text = 'Failed to load file: ' + errors[seconds % errors.length];
	} else {
		text =  Math.floor(done * 100 / count) + '%';
	}
	let bar_wid = canvas.width * done / count;
	
	fillRect(0, canvas.height * 0.85, null, canvas.height / 10, '#454545');
	fillRect((canvas.width - bar_wid) / 2, canvas.height * 0.85, bar_wid, canvas.height / 10, errors.length ? '#7F0000' : '#007F00');
	printTextCentered(canvas.width / 2, canvas.height * 0.925, text, canvas.height / 15, 'white');
}

function drawIntermissionFrame() {
	const TargetScale = 0.666;
	
	let StartingScale;
	let AnimationOffset, AnimationLength;
	if(levelNo == 0) {
		StartingScale = LoadingLogoScale;
		AnimationOffset = CYCLES_PER_SECOND / 2;
		AnimationLength = CYCLES_PER_SECOND;
	} else {
		StartingScale = 1.0;
		AnimationOffset = CYCLES_PER_SECOND/4;
		AnimationLength = CYCLES_PER_SECOND*3/4;
	}
	
	
	fillRect(0, 0, null ,null, 'black');
	if(intermissionCycles < AnimationOffset) {
		drawLogo(StartingScale);
		return;
	}
	
	let progress = (intermissionCycles - AnimationOffset) / AnimationLength;
	if(progress > 1.0) progress = 1.0;
	
	drawLogo(StartingScale - progress*(StartingScale-TargetScale));
	
	
	let top_text, bottom_text;
	if(levelNo < LEVELS_TOTAL) {
		top_text = (levelNo == 0) ? 'Use the arrow keys to move' : 'Level ' + (1 + levelNo);
		bottom_text = 'Press space to start!';
	} else {
		top_text = 'That was the last level!';
		bottom_text = 'Thanks for playing!';
	}
	
	printTextCentered(canvas.width / 2, canvas.height * 0.75, top_text, 18*progress, 'white');
	printTextCentered(canvas.width / 2, canvas.height * 0.85, bottom_text, 18*progress, 'white');
	
	printTextCentered(canvas.width / 2, canvas.height * 0.96, 'a Ludum Dare 42 entry by suve', 12*progress, '#7f7f7f');
}

var intermissionCycles = 0;

function intermissionLogic() {
	intermissionCycles += 1;
	if(levelNo == LEVELS_TOTAL) return;
	
	if(keystate[32] && !inGame) {
		resetLevel();
		inGame = true;
	}
}


function keycode(ev) {
	let k = ev.keyCode;
	
	// Do not preventDefault on F-keys (interferes with refreshing and opening the dev tools)
	if(k < 112 || k > 123) ev.preventDefault();
	
	return k;
}

function handleKeyDown(k) {
	k = keycode(k);
	keystate[k] = true;
}

function handleKeyUp(k) {
	k = keycode(k);
	keystate[k] = false;
}

function overlap(x1, y1, w1, h1, x2, y2, w2, h2) {
	if(typeof y1 === "object") {
		h2 = y1.h;
		w2 = y1.w;
		y2 = y1.y;
		x2 = y1.x;
	}
	if(typeof x1 === "object") {
		h1 = x1.h;
		w1 = x1.w;
		y1 = x1.y;
		x1 = x1.x;
	}
	
	return !( (x2 > x1+w1) || (x2+w2 < x1) || (y2-h2 > y1) || (y2 < y1-h1) );
}

function distance(x1, y1, x2, y2) {
	if(typeof y1 === "object") {
		y2 = y1.y - (y1.h / 2);
		x2 = y1.x + (y1.w / 2);
	}
	if(typeof x1 === "object") {
		y1 = x1.y - (x1.h / 2);
		x1 = x1.x + (x1.w / 2);
	}
	
	let dx = x2 - x1;
	let dy = y2 - y1;
	return Math.sqrt(dx*dx + dy*dy);
}

function calculateWalkerMovement(e) {
	if(e.facing == FACING_LEFT) {
		e.xVel -= WALKER_ACCEL * CYCLE_SECONDS;
		if(e.xVel < -WALKER_MAX_SPEED) e.xVel = -WALKER_MAX_SPEED;
	} else {
		e.xVel += WALKER_ACCEL * CYCLE_SECONDS;
		if(e.xVel > WALKER_MAX_SPEED) e.xVel = WALKER_MAX_SPEED;
	}
	
	let oldX = e.x;
	e.x += e.xVel * CYCLE_SECONDS;
	
	let turnAround = false;
	if(e.xVel > 0) {
		turnAround =
			map.collides(e.x+e.w, e.y-0.05) || map.collides(e.x+e.w, e.y-e.h) || 
			map.deadly(e.x+e.w, e.y-0.05) || map.deadly(e.x+e.w, e.y-e.h) ||
			!map.collides(e.x+e.w, e.y);
	} else {
		turnAround =
			map.collides(e.x, e.y-0.05) || map.collides(e.x, e.y-e.h) ||
			map.deadly(e.x, e.y-0.05) || map.deadly(e.x, e.y-e.h) ||
			!map.collides(e.x,e.y);
	}
	
	if(turnAround) {
		e.x = oldX;
		e.xVel = 0;
		e.facing = !e.facing;
	}
	
	e.animate(CYCLE_TICKS);
}

function calculateJumperMovement(e) {
	let triggered = distance(e, player) < JUMPER_JUMP_TRIGGER;
	let facingPlayer = e.facing == (player.x > e.x) ? FACING_RIGHT : FACING_LEFT;
	 
	if((e.yVel === null) && triggered && facingPlayer) {
		e.yVel = -JUMPER_JUMP_FORCE;
		Sfx.play(jumperJumpSfx);
	}
	
	let accelFactor = 1;
	let speedFactor = 1;
	if(e.yVel !== null) {
		e.yVel += GRAVITY * CYCLE_SECONDS;
		e.y += e.yVel * CYCLE_SECONDS;
		
		if(e.yVel < 0) {
			if(map.collides(e.x, e.y-e.h) || map.collides(e.x + e.w, e.y-e.h)) {
				e.y = Math.floor(e.y)+1;
				e.yVel = 0;
			}
		} else {
			if(map.collides(e.x, e.y) || map.collides(e.x + e.w, e.y)) {
				e.y = Math.floor(e.y);
				e.yVel = null;
			}
		}
		
		accelFactor = JUMPER_AIR_ACCEL_FACTOR;
		speedFactor = JUMPER_AIR_SPEED_FACTOR;
	}
	
	let maxSpeed = JUMPER_MAX_SPEED * speedFactor;
	
	let accelDir = e.facing;
	if(triggered && !facingPlayer && (Math.abs(e.x-player.x) > 0.75)) accelDir = !accelDir;
	
	if(accelDir == FACING_LEFT) {
		e.xVel -= JUMPER_ACCEL * CYCLE_SECONDS * accelFactor;
		if(e.xVel < -maxSpeed)
			e.xVel = -maxSpeed;
		else if(e.xVel < 0)
			e.facing = FACING_LEFT;
	} else {
		e.xVel += JUMPER_ACCEL * CYCLE_SECONDS * accelFactor;
		if(e.xVel > maxSpeed)
			e.xVel = maxSpeed;
		else if(e.xVel > 0)
			e.facing = FACING_RIGHT;
	}
	
	let oldX = e.x;
	e.x += e.xVel * CYCLE_SECONDS;
	
	let turnAround = false;
	if(e.xVel > 0) {
		turnAround = map.collides(e.x+e.w, e.y-0.05) || map.collides(e.x+e.w, e.y-e.h);
		if(e.yVel === null) turnAround = turnAround || map.deadly(e.x+e.w, e.y-0.05) || map.deadly(e.x+e.w, e.y-e.h) || !map.collides(e.x+e.w, e.y);
	} else {
		turnAround = map.collides(e.x, e.y-0.05) || map.collides(e.x, e.y-e.h);
		if(e.yVel === null) turnAround = turnAround || map.deadly(e.x, e.y-0.05) || map.deadly(e.x, e.y-e.h) || !map.collides(e.x,e.y);
	}
	
	if(turnAround) {
		e.x = oldX;
		e.xVel = 0;
		if(e.yVel === null) e.facing = !e.facing;
	}
	
	if(e.yVel === null) {
		if(!(map.collides(e.x, e.y) || map.collides(e.x + e.w, e.y))) {
			e.yVel = 0;
		}
	}
	
	e.animate(CYCLE_TICKS);
}

function calculateEnemies() {
	let count = enemies.length;
	let idx = 0;
	while(idx < count) {
		let e = enemies[idx];
		
		if(e.dead === null) {
			if(e.type == 0)
				calculateWalkerMovement(e);
			else
				calculateJumperMovement(e);
			
			if(player.yVel > 0 && overlap(player, e) && (player.y < e.y)) {
				Achievements.add((e.type == 0) ? ACHIEV_WALKER_KILL : ACHIEV_JUMPER_KILL);
				Sfx.play((e.type == 0) ? walkerDeathSfx : jumperDeathSfx);
				e.dead = 0;
			}
			
			if((e.dead === null) && (e.type == 1) && (e.yVel !== null)) {
				if(map.deadly(e.x, e.y) || map.deadly(e.x+e.w, e.y) || map.deadly(e.x, e.y-e.h) || map.deadly(e.x+e.w, e.y-e.h)) {
					Achievements.add(ACHIEV_JUMPER_SPIKES);
					Sfx.play(jumperDeathSfx);
					e.dead = 0;
				}
			}
		} else {
			e.dead += CYCLE_TICKS;
			if(e.dead >= ANIM_DEATH_TICKS_TOTAL) {
				enemies.splice(idx, 1);
				--count;
				continue;
			}
		}
		++idx;
	}
}

function calculatePlayerMovement() {
	if((keystate[ARROW_UP]) && (player.yVel === null)) {
		player.yVel = -PLAYER_JUMP_FORCE;
		Sfx.play(jumpSfx);
		Achievements.add(ACHIEV_JUMP);
	}
	
	let airFactor = 1;
	if(player.yVel !== null) {
		player.yVel += GRAVITY * CYCLE_SECONDS;
		player.y += player.yVel * CYCLE_SECONDS;
		
		if(player.yVel < 0) {
			if(map.collides(player.x, player.y-player.h) || map.collides(player.x + player.w, player.y-player.h)) {
				if(player.y-player.h < 0) {
					Achievements.add(ACHIEV_SKY);
				} else if(player.yVel <= OUCH_SFX_THRESHOLD) {
					Sfx.play(ouchHeadSfx);
					Achievements.add(ACHIEV_OUCH);
				}
				
				player.y = Math.floor(player.y)+1;
				player.yVel = 0;
			}
		} else {
			if(map.collides(player.x, player.y) || map.collides(player.x + player.w, player.y)) {
				if(player.yVel >= LAND_HARD_THRESHOLD) {
					shaking = new Screenshake(player.yVel / LAND_HARD_THRESHOLD * 1.666, 0.666);
					Sfx.play(landHardSfx);
					
					Achievements.add(ACHIEV_LAND);
				} else if(player.yVel > LAND_SFX_THRESHOLD) {
					Sfx.play(landSfx);
				}
				
				player.y = Math.floor(player.y);
				player.yVel = null;
			}
		}
		
		airFactor = AIR_CONTROL;
	}
	
	let oldX = player.x;
	let anyKey = false;
	if(keystate[ARROW_LEFT]) {
		player.facing = FACING_LEFT;
		anyKey = true;
		
		player.xVel -= PLAYER_ACCEL * CYCLE_SECONDS * airFactor;
		if(player.xVel < -PLAYER_MAX_SPEED) player.xVel = -PLAYER_MAX_SPEED;
	}
	if(keystate[ARROW_RIGHT]) {
		player.facing = FACING_RIGHT;
		anyKey = true;
		
		player.xVel += PLAYER_ACCEL * CYCLE_SECONDS * airFactor;
		if(player.xVel > PLAYER_MAX_SPEED) player.xVel = PLAYER_MAX_SPEED;
	}
	if(!anyKey) {
		if(player.facing == FACING_RIGHT) {
			player.xVel -= PLAYER_ACCEL * CYCLE_SECONDS;
			if(player.xVel < 0) player.xVel = 0;
		} else {
			player.xVel += PLAYER_ACCEL * CYCLE_SECONDS;
			if(player.xVel > 0) player.xVel = 0;
		}
	}
	
	if(player.xVel !== 0) {
		player.x += player.xVel * CYCLE_SECONDS;
		if(
			map.collides(player.x, player.y-0.05) || map.collides(player.x, player.y-player.h) ||
			map.collides(player.x+player.w, player.y-0.05) || map.collides(player.x+player.w, player.y-player.h)
		) {
			if(Math.abs(player.xVel) >= PLAYER_MAX_SPEED*0.99) {
				Achievements.add(ACHIEV_WALLHIT);
				Sfx.play(ouchWallSfx);
			}
			
			player.x = oldX;
			player.xVel = 0;
		}
	}
	
	if(player.yVel === null) {
		if(!(map.collides(player.x, player.y) || map.collides(player.x + player.w, player.y))) {
			player.yVel = 0;
		}
	}
	
	if(anyKey)
		player.animate(CYCLE_TICKS);
	else
		player.stopAnimation();
}

function checkPlayerDamage() {
	if(
		map.deadly(player.x, player.y-0.05) || map.deadly(player.x, player.y-player.h) ||
		map.deadly(player.x+player.w, player.y-0.05) || map.deadly(player.x+player.w, player.y-player.h)
	) {
		if(player.health <= 1) Sfx.play(spikesSfx);
		Achievements.add(ACHIEV_SPIKES);
		return true;
	}
	
	let count = enemies.length;
	for(let idx = 0; idx < count; ++idx) {
		let e = enemies[idx];
		
		if(e.dead !== null) continue;
		if(!overlap(player, e)) continue;
		
		if(player.health <= 1) Sfx.play((e.type == 0) ? walkerAttackSfx : jumperAttackSfx);
		Achievements.add((e.type == 0) ? ACHIEV_WALKER_DIE : ACHIEV_JUMPER_DIE);
		return true;
	}
	
	return false;
}

function gameLogic() {
	Achievements.checkPlaytime(CYCLE_TICKS);
	
	if(player.dead !== null) {
		player.dead += CYCLE_SECONDS;
		if(player.dead > DEATH_TIME) resetLevel();
		
		return;
	}
	
	calculatePlayerMovement();
	calculateEnemies();
	
	if(player.invul <= 0) {
		if(checkPlayerDamage()) {
			if(player.health <= 1) {
				player.dead = 0;
				fadeout = new Fadeout();
				return;
			} 
			
			powerDown();
		}
	} else {
		player.invul--;
	}
	
	if(shaking) shaking.update(CYCLE_SECONDS);
	
	items.decay(CYCLE_TICKS);
	items.collect(player.x, player.y-0.05);
	items.collect(player.x+player.w, player.y-0.05);
	items.collect(player.x, player.y-player.h);
	items.collect(player.x+player.w, player.y-player.h);
	
	if(inGame) {
		let tile = map.getTile(player.x + player.w/2, player.y - player.h/2);
		if(tile == TILE_EXIT) {
			levelNo += 1;
			inGame = false;
			intermissionCycles = 0;
			Sfx.play(levelFinishedSfx);
		}
	}
}

function resize_canvas() {
	const aspect_ratio = 1.6;
	
	let wndW = window.innerWidth;
	let wndH = window.innerHeight;
	
	let newW = wndW;
	let newH = wndW / aspect_ratio;
	if(newH > wndH) {
		newW = wndH * aspect_ratio;
		newH = wndH;
	}
	
	canvas.style.width = newW + 'px';
	canvas.style.height = newH + 'px';
	canvas.style.margin = Math.floor((wndH - newH) / 2) + 'px auto';
}

function spawnActors(map) {
	enemies = [];
	for(let y = 0; y < map.h; ++y) {
		for(let x = 0; x < map.w; ++x) {
			let e = null;
			if(map.data[y][x] === TILE_PLAYER) {
				let hp = ((player != null) && (player.health > 0)) ? player.health : 1;
				
				player = new Player(x, y+1);
				player.health = hp;
				
				map.data[y][x] = 0;
			} else if(map.data[y][x] === TILE_WALKER_R) {
				e = new Player(x, y+1);
				e.facing = FACING_RIGHT;
				e.type = 0;
			} else if(map.data[y][x] === TILE_WALKER_L) {
				e = new Player(x, y+1);
				e.facing = FACING_LEFT;
				e.type = 0;
			} else if(map.data[y][x] === TILE_JUMPER_R) {
				e = new Player(x, y+1);
				e.facing = FACING_RIGHT;
				e.type = 1;
			} else if(map.data[y][x] === TILE_JUMPER_L) {
				e = new Player(x, y+1);
				e.facing = FACING_LEFT;
				e.type = 1;
			}
			
			if(e !== null) {
				map.data[y][x] = 0;
				enemies.push(e);
			}
		}
	}
}

function resetLevel() {
	let _mapdata;
	if(levelNo == 0)
		_mapdata = level0_mapdata;
	if(levelNo == 1)
		_mapdata = level1_mapdata;
	if(levelNo == 2)
		_mapdata = level2_mapdata;
	if(levelNo == 3)
		_mapdata = level3_mapdata;
	
	map = new Map(_mapdata);
	spawnActors(map);
	items = new Items(map);
	
	shaking = null;
	fadeout = null;
}

function ld42_init() {
	appstart = (new Date()).getTime();
	
	canvas = document.getElementById('ld42');
	ctx = canvas.getContext('2d', { 'alpha': false });
	ctx.save();
	viewport = new Viewport();
	
	logoGfx[0] = Assets.addGfx("../gfx/logo-super.png");
	logoGfx[1] = Assets.addGfx("../gfx/logo-over.png");
	logoGfx[2] = Assets.addGfx("../gfx/logo-42k.png");
	logoGfx[3] = Assets.addGfx("../gfx/logo-deluxe.png");
	
	achievGfx = Assets.addGfx("../gfx/achievements.png");
	numfontGfx = Assets.addGfx("../gfx/numfont.png");
	
	numfont = new BitmapFont(numfontGfx, '0', 5, 7);
	numfont.setSpacing(1, 1);
	
	for(let idx = 0; idx < GfxSizes.length; ++idx) {
		let s = GfxSizes[idx];
		worldGfx[s] = Assets.addGfx("../gfx/world-"+s+"px.png");
		
		playerGfx[s] = Assets.addGfx("../gfx/hero-"+s+"px.png");
		walkerGfx[s] = Assets.addGfx("../gfx/walker-"+s+"px.png");
		jumperGfx[s] = Assets.addGfx("../gfx/jumper-"+s+"px.png");
		
		coinGfx[s] = Assets.addGfx("../gfx/coin-"+s+"px.png");
		potionGfx[s] = Assets.addGfx("../gfx/potion-"+s+"px.png");
	}
	
	achievSfx = Assets.addSfx("../sfx/achiev.wav");
	levelFinishedSfx = Assets.addSfx("../sfx/level-finished.wav");
	coinSfx = Assets.addSfx("../sfx/coin.wav");
	oneUpSfx = Assets.addSfx("../sfx/1up.wav");
	oneDownSfx = Assets.addSfx("../sfx/1down.wav");
	jumpSfx = Assets.addSfx("../sfx/jump.wav");
	landSfx = Assets.addSfx("../sfx/ground.wav");
	landHardSfx = Assets.addSfx("../sfx/ground-hard.wav");
	ouchHeadSfx = Assets.addSfx("../sfx/hit-head.wav");
	ouchWallSfx = Assets.addSfx("../sfx/hit-wall.wav");
	spikesSfx = Assets.addSfx("../sfx/spikes.wav");
	walkerAttackSfx = Assets.addSfx("../sfx/walker-attack.wav");
	walkerDeathSfx = Assets.addSfx("../sfx/walker-death.wav");
	jumperAttackSfx = Assets.addSfx("../sfx/jumper-attack.wav");
	jumperDeathSfx = Assets.addSfx("../sfx/jumper-death.wav");
	jumperJumpSfx = Assets.addSfx("../sfx/jumper-jump.wav");
	
	Assets.addScript('map/level0.js');
	Assets.addScript('map/level1.js');
	Assets.addScript('map/level2.js');
	Assets.addScript('map/level3.js');
	
	let loaded = false;
	levelNo = 0;
	inGame = false;
	
	let oldTicks = getTicks();
	let main_loop = function() {
		let ticks = getTicks() - oldTicks;
		let cycles = Math.floor(ticks / CYCLE_TICKS);
		oldTicks += cycles * CYCLE_TICKS;
		
		if(loaded) {
			if(inGame) {
				while(cycles --> 0) gameLogic();
				drawFrame();
			} else {
				while(cycles --> 0) intermissionLogic();
				drawIntermissionFrame();
			}
		} else {
			drawFrame_loading();
			loaded = Assets.loadingFinished();
			if(loaded) document.body.style.cursor = 'none';
		}
		
		window.setTimeout(main_loop, CYCLE_TICKS - (ticks % CYCLE_TICKS));
	};
	
	window.onresize = resize_canvas;
	resize_canvas();
	
	Achievements.reset();
	
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
	main_loop();
}
