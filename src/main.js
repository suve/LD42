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

const PLAYER_SPEED = 96;
const GRAVITY = 88;
const PLAYER_JUMP_FORCE = 84;
const LAND_SFX_THRESHOLD = GRAVITY / 2;
const OUCH_SFX_THRESHOLD = -PLAYER_JUMP_FORCE / 2;
const AIR_CONTROL = 1;

// Ugh
const ARROW_LEFT = 37;
const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;

// Global vars, fuck yeah
var appstart;
var canvas, ctx;
var keystate = [];
var coins, map;
var player;

var coinGfx, playerGfx, worldGfx;
var achievSfx, coinSfx, jumpSfx, landSfx, ouchSfx;

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
	
	ctx.textBaseline = 'top';
	ctx.fillText(text, x, y);
}

function drawFrame() {
	map.draw();
	coins.render();
	
	let frame = player.frame;
	if(player.jumping()) frame = 3;
	if(player.falling()) frame = 4;
	ctx.drawImage(playerGfx, frame*8, player.facing*8, 8, 8, Math.floor(player.x), Math.floor(player.y)-8, 8, 8);
	
	Achievements.render();
	
	let fps = countFPS();
	printText(0, 0, fps+'FPS', 12, 'white');
}

function drawFrame_loading() {
	let files = Assets.getList();
	let count = files.length;
	for(let idx = 0; idx < count; ++idx) {
		let f = files[idx];
		printText(32, 16 + 12*idx, f.path, 10, f.ready ? 'lime' : 'red');
	}
	
	let fps = countFPS();
	printText(0, 0, fps+'FPS', 12, 'white');
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

function gameLogic() {
	if((keystate[ARROW_UP]) && (player.velocity === null)) {
		player.velocity = -PLAYER_JUMP_FORCE;
		Sfx.play(jumpSfx);
		Achievements.add(ACHIEV_JUMP);
	}
	
	let airFactor = 1;
	if(player.velocity !== null) {
		player.velocity += GRAVITY * CYCLE_SECONDS;
		player.y += player.velocity * CYCLE_SECONDS;
		
		if(player.velocity < 0) {
			if(map.collides(player.x, player.y-player.h) || map.collides(player.x + player.w - 1, player.y-player.h)) {
				if(player.y-player.h < 0) {
					Achievements.add(ACHIEV_SKY);
				} else if(player.velocity <= OUCH_SFX_THRESHOLD) {
					Sfx.play(ouchSfx);
					Achievements.add(ACHIEV_OUCH);
				}
				
				player.y = (Math.floor(player.y / 8)+1)*8;
				player.velocity = 0;
			}
		} else {
			if(map.collides(player.x, player.y) || map.collides(player.x + player.w - 1, player.y)) {
				if(player.velocity >= LAND_SFX_THRESHOLD) {
					Sfx.play(landSfx);
					Achievements.add(ACHIEV_LAND);
				}
				
				player.y = Math.floor(player.y / 8)*8;
				player.velocity = null;
			}
		}
		
		airFactor = AIR_CONTROL;
	}
	
	let moved = false;
	if(keystate[ARROW_LEFT]) {
		player.facing = FACING_LEFT;
		moved = true;
		
		let oldX = player.x;
		player.x -= PLAYER_SPEED * CYCLE_SECONDS * airFactor;
		if(map.collides(player.x, player.y-1) || map.collides(player.x, player.y-player.h)) player.x = oldX;
	}
	if(keystate[ARROW_RIGHT]) {
		player.facing = FACING_RIGHT;
		moved = true;
		
		let oldX = player.x;
		player.x += PLAYER_SPEED * CYCLE_SECONDS * airFactor;
		if(map.collides(player.x+player.w-1, player.y-1) || map.collides(player.x+player.w-1, player.y-player.h)) player.x = oldX;
	}
	
	if(moved && (player.velocity === null)) {
		if(!(map.collides(player.x, player.y) || map.collides(player.x + player.w - 1, player.y))) {
			player.velocity = 0;
		}
	}
	
	coins.decay(CYCLE_TICKS);
	coins.collect(player.x, player.y-1);
	coins.collect(player.x+player.w-1, player.y-1);
	coins.collect(player.x, player.y-player.h);
	coins.collect(player.x+player.w-1, player.y-player.h);
	
	let anyKey = keystate[ARROW_LEFT] || keystate[ARROW_RIGHT];
	if(anyKey)
		player.animate(CYCLE_TICKS);
	else
		player.stopAnimation();
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

function ld42_init() {
	appstart = (new Date()).getTime();
	
	canvas = document.getElementById('ld42');
	ctx = canvas.getContext('2d', { 'alpha': false });
	
	playerGfx = Assets.addGfx("../gfx/hero-8px.png");
	worldGfx = Assets.addGfx("../gfx/world-8px.png");
	coinGfx = Assets.addGfx("../gfx/coin-8px.png");
	
	achievSfx = Assets.addSfx("../sfx/achiev.wav");
	coinSfx = Assets.addSfx("../sfx/coin.wav");
	jumpSfx = Assets.addSfx("../sfx/jump.wav");
	landSfx = Assets.addSfx("../sfx/ground.wav");
	ouchSfx = Assets.addSfx("../sfx/hit-head.wav");
	
	let loaded = false;
	let oldTicks = getTicks();
	let main_loop = function() {
		let ticks = getTicks() - oldTicks;
		let cycles = Math.floor(ticks / CYCLE_TICKS);
		oldTicks += cycles * CYCLE_TICKS;
		
		if(loaded) {
			while(cycles --> 0) gameLogic();
			drawFrame();
		} else {
			drawFrame_loading();
			loaded = Assets.isFinished();
		}
		
		window.setTimeout(main_loop, CYCLE_TICKS - (ticks % CYCLE_TICKS));
	};
	
	window.onresize = resize_canvas;
	resize_canvas();
	
	map = new Map(mapdata);
	coins = new Coins(map);
	player = new Player(0, canvas.height-16);
	Achievements.reset();
	
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
	main_loop();
}
