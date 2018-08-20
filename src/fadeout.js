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
const __FADEOUT_MAX = 1;

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
	
	if(type === undefined) type = Math.floor(Math.random() * (__FADEOUT_MAX+1));
	
	switch(type) {
		case FADEOUT_VERTICAL:
			this.draw = draw_vertical;
		break;
		
		case FADEOUT_HORIZONTAL:
			this.draw = draw_horizontal;
		break;
		
		default:
			throw new Error("Unknown fadeout type");
	}
}
