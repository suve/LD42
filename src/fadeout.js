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
const FADEOUT_VERTICAL = 0;
const FADEOUT_HORIZONTAL = 1;
const FADEOUT_TRIANGLE_SLASH = 2;
const FADEOUT_TRIANGLE_BACKSLASH = 3;
const FADEOUT_CIRCLE = 4;
const __FADEOUT_MAX = 4;

function Fadeout(type) {
	let draw_vertical = function(progress) {
		let wid = canvas.width / 2 * progress;
		
		fillRect(0, 0, wid, null, 'black');
		fillRect(canvas.width-wid+1, 0, wid, null, 'black');
	};
	
	let draw_horizontal = function(progress) {
		let hei = canvas.height / 2 * progress;
		
		fillRect(0, 0, null, hei, 'black');
		fillRect(0, canvas.height-hei+1, null, hei, 'black');
	};
	
	let draw_triangle_slash = function(progress) {
		let wid = canvas.width * progress;
		let hei = canvas.height * progress;
		
		fillTriangle(0, 0, wid, 0, 0, hei, 'black');
		fillTriangle(canvas.width, canvas.height, canvas.width - wid, canvas.height, canvas.width, canvas.height - hei, 'black');
	};
	
	let draw_triangle_backslash = function(progress) {
		let wid = canvas.width * progress;
		let hei = canvas.height * progress;
		
		fillTriangle(0, canvas.height, wid, canvas.height, 0, canvas.height - hei, 'black');
		fillTriangle(canvas.width, 0, canvas.width - wid, 0, canvas.width, hei, 'black');
	};
	
	let draw_circle = function(progress) {
		let inner_rad = Math.floor((1.0 - progress) * canvas.width / 2);
		fillAnnulus(canvas.width / 2, canvas.height / 2, canvas.width, inner_rad, 'black');
	};
	
	if(type === undefined) type = Math.floor(Math.random() * (__FADEOUT_MAX+1));
	
	switch(type) {
		case FADEOUT_VERTICAL:
			this.draw = draw_vertical;
		break;
		
		case FADEOUT_HORIZONTAL:
			this.draw = draw_horizontal;
		break;
		
		case FADEOUT_TRIANGLE_SLASH:
			this.draw = draw_triangle_slash;
		break;
		
		case FADEOUT_TRIANGLE_BACKSLASH:
			this.draw = draw_triangle_backslash;
		break;
		
		case FADEOUT_CIRCLE:
			this.draw = draw_circle;
		break;
		
		default:
			throw new Error("Unknown fadeout type");
	}
}
