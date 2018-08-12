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
const OUCH_SFX_THRESHOLD = -PLAYER_JUMP_FORCE / 2;
const AIR_CONTROL = 0.33;

const DEATH_TIME = 0.48;
const DEATH_ANIM_TIME = DEATH_TIME * 0.9;

// Ugh
const ARROW_LEFT = 37;
const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;

// Global vars, fuck yeah
var appstart;
var canvas, ctx, ctxOrg, viewport;
var keystate = [];
var coins, map;
var player;

var logoGfx = [];
var achievGfx, coinGfx, playerGfx, worldGfx;
var achievSfx, coinSfx, jumpSfx, landSfx, spikesSfx, ouchSfx;


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

function printText(x, y, text, size, colour) {
	if(size !== null) ctx.font = size+'px monospace';
	if(colour !== null) ctx.fillStyle = colour;
	
	ctx.textAlign = 'start';
	ctx.textBaseline = 'top';
	ctx.fillText(text, x, y);
}

function printTextCentered(x, y, text, size, colour) {
	if(size !== null) ctx.font = size+'px monospace';
	if(colour !== null) ctx.fillStyle = colour;
	
	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	ctx.fillText(text, x, y);
}

function drawFrame() {
	let scale = viewport.getScale();
	viewport.update(player);
	ctx.restore(); ctx.save();
	ctx.translate(-Math.floor(viewport.x * scale), -Math.floor(viewport.y * scale));
	
	map.draw();
	coins.render();
	
	let frame = player.frame;
	if(player.jumping()) frame = 3;
	if(player.falling()) frame = 4;
	ctx.drawImage(playerGfx, frame*8, player.facing*8, 8, 8, Math.floor(player.x*scale), Math.floor((player.y-1)*scale), scale, scale);
	
	ctx.restore(); ctx.save();
	Achievements.render();
	
	if(player.dead !== null) {
		let perc = player.dead / DEATH_ANIM_TIME;
		let wid = canvas.width / 2 * perc;
		
		fillRect(0, 0, wid, null, 'black');
		fillRect(canvas.width-wid+1, 0, wid, null, 'black');
		
		drawLogo();
	}
	
	let fps = countFPS();
	printText(0, 0, fps+'FPS', 12, 'white');
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

function drawFrame_loading() {
	fillRect(0, 0, null ,null, 'black');
	
	let files = Assets.getList();
	
	let done = 0;
	let count = files.length;
	for(let idx = 0; idx < count; ++idx) {
		let f = files[idx];
		printText(4, 16 + 12*idx, f.path, 10, f.ready ? 'lime' : '#7F7F7F');
		
		done += !!f.ready;
	}
	printText(4, 4, Math.floor(done * 100 / count) + '%', 10, 'white');
	
	drawLogo();
}

function drawFrame_title() {
	const AnimationOffset = CYCLES_PER_SECOND*2;
	const AnimationLength = CYCLES_PER_SECOND;
	const TargetScale = 0.666;
	
	fillRect(0, 0, null ,null, 'black');
	if(__titleScreenCycles < AnimationOffset) {
		drawLogo();
		return;
	}
	
	let progress = (__titleScreenCycles - AnimationOffset) / AnimationLength;
	if(progress > 1.0) progress = 1.0;
	
	drawLogo(1 - progress*(1-TargetScale));
	
	printTextCentered(canvas.width / 2, canvas.height * 0.75, 'Use the arrow keys to move', 18*progress, 'white');
	printTextCentered(canvas.width / 2, canvas.height * 0.85, 'Press space to start!', 18*progress, 'white');
	printTextCentered(canvas.width / 2, canvas.height * 0.96, 'a Ludum Dare 42 entry by suve', 12*progress, '#7f7f7f');
}

var __titleScreenCycles = 0;

function titleScreenLogic() {
	__titleScreenCycles += 1;
	
	return keystate[32];
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
					Sfx.play(ouchSfx);
					Achievements.add(ACHIEV_OUCH);
				}
				
				player.y = Math.floor(player.y)+1;
				player.yVel = 0;
			}
		} else {
			if(map.collides(player.x, player.y) || map.collides(player.x + player.w, player.y)) {
				if(player.yVel >= LAND_SFX_THRESHOLD) {
					Sfx.play(landSfx);
					Achievements.add(ACHIEV_LAND);
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
			if(Math.abs(player.xVel) >= PLAYER_MAX_SPEED*0.99) Achievements.add(ACHIEV_WALLHIT);
			
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

function checkPlayerDeath() {
	if(
		map.deadly(player.x, player.y-0.05) || map.deadly(player.x, player.y-player.h) ||
		map.deadly(player.x+player.w, player.y-0.05) || map.deadly(player.x+player.w, player.y-player.h)
	) {
		Achievements.add(ACHIEV_SPIKES);
		Sfx.play(spikesSfx);
		return true;
	}
	
	return false;
}

var __playtimeLevel = 0;

function playtimeAchievementCheck() {
	const PlaytimeThresholds = [
		TICKS_PER_SECOND * 30,
		TICKS_PER_SECOND * 60,
		TICKS_PER_SECOND * 60 * 3,
		TICKS_PER_SECOND * 60 * 5,
		TICKS_PER_SECOND * 60 * 10,
		TICKS_PER_SECOND * 60 * 15,
		TICKS_PER_SECOND * 60 * 20,
		TICKS_PER_SECOND * 60 * 25,
		TICKS_PER_SECOND * 60 * 30,
		TICKS_PER_SECOND * 60 * 35,
		TICKS_PER_SECOND * 60 * 40,
	];
	
	if(__playtimeLevel >= PlaytimeThresholds.length) return;
	
	let ticks = getTicks();
	if(ticks < PlaytimeThresholds[__playtimeLevel]) return;
	
	Achievements.add(ACHIEV_PLAYTIME, true);
	__playtimeLevel += 1;
}

function gameLogic() {
	playtimeAchievementCheck();
	
	if(player.dead !== null) {
		player.dead += CYCLE_SECONDS;
		if(player.dead > DEATH_TIME) resetLevel();
		
		return;
	}
	
	calculatePlayerMovement();
	if(checkPlayerDeath()) {
		player.dead = 0;
		return;
	}
	
	coins.decay(CYCLE_TICKS);
	coins.collect(player.x, player.y-0.05);
	coins.collect(player.x+player.w, player.y-0.05);
	coins.collect(player.x, player.y-player.h);
	coins.collect(player.x+player.w, player.y-player.h);
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

function resetLevel() {
	map = new Map(mapdata);
	coins = new Coins(map);
	player = new Player(0, map.h-5);
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
	playerGfx = Assets.addGfx("../gfx/hero-8px.png");
	worldGfx = Assets.addGfx("../gfx/world-8px.png");
	coinGfx = Assets.addGfx("../gfx/coin-8px.png");
	
	achievSfx = Assets.addSfx("../sfx/achiev.wav");
	coinSfx = Assets.addSfx("../sfx/coin.wav");
	jumpSfx = Assets.addSfx("../sfx/jump.wav");
	landSfx = Assets.addSfx("../sfx/ground.wav");
	ouchSfx = Assets.addSfx("../sfx/hit-head.wav");
	spikesSfx = Assets.addSfx("../sfx/spikes.wav");
	
	let loaded = false;
	let inGame = false;
	
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
				while(cycles --> 0) inGame = inGame || titleScreenLogic();
				drawFrame_title();
			}
		} else {
			drawFrame_loading();
			loaded = Assets.loadingFinished();
		}
		
		window.setTimeout(main_loop, CYCLE_TICKS - (ticks % CYCLE_TICKS));
	};
	
	window.onresize = resize_canvas;
	resize_canvas();
	
	resetLevel();
	Achievements.reset();
	
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
	main_loop();
}
