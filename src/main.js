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

// Global vars, fuck yeah
var canvas, ctx;

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
	canvas = document.getElementsByTagName('canvas')[0];
	ctx = canvas.getContext('2d', { alpha: false });
	
	resize_canvas();
	window.onresize = resize_canvas;
}
