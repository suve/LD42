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

const PLAYER_SPEED = 120;


// Ugh
const ARROW_LEFT = 37;
const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;

// Global vars, fuck yeah
var appstart;
var canvas, ctx;
var keystate = [];
var player;

var playerGfx;

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

function printText(x, y, text, size, colour) {
	if(size !== null) ctx.font = size+'px serif';
	if(colour !== null) ctx.fillStyle = colour;
	
	ctx.textBaseline = 'top';
	ctx.fillText(text, x, y);
}

function drawFrame() {
	fillRect(0, 0, null, null, 'black');
	ctx.drawImage(playerGfx, 8, 0, 8, 8, Math.floor(player.x), Math.floor(player.y), 8, 8);
	
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

function gameLogic() {
	if(keystate[ARROW_UP]) {
		player.y -= PLAYER_SPEED * CYCLE_SECONDS;
		if(player.y < 0) player.y = 0;
	}
	if(keystate[ARROW_DOWN]) {
		player.y += PLAYER_SPEED * CYCLE_SECONDS;
		if(player.y >= canvas.height) player.y = canvas.height-1;
	}
	
	if(keystate[ARROW_LEFT]) {
		player.x -= PLAYER_SPEED * CYCLE_SECONDS;
		if(player.x < 0) player.x = 0;
	}
	if(keystate[ARROW_RIGHT]) {
		player.x += PLAYER_SPEED * CYCLE_SECONDS;
		if(player.x >= canvas.width) player.x = canvas.width-1;
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

function ld42_init() {
	appstart = (new Date()).getTime();
	
	canvas = document.getElementsByTagName('canvas')[0];
	ctx = canvas.getContext('2d', { alpha: false });
	
	player = {
		'x': canvas.width / 2,
		'y': canvas.height / 2
	};
	playerGfx = Assets.addGfx('../gfx/hero-8px.png');
	
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
	
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
	main_loop();
}
