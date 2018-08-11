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
function Map(data) {
	this.data = data;
	this.h = data.length;
	this.w = data[0].length;
	
	this.collides = function(x, y) {
		x = Math.floor(x / 8);
		y = Math.floor(y / 8);
		
		if((x < 0) || (y < 0)) return true;
		if((x >= this.w) || (y >= this.h)) return true;
		
		return !!this.data[y][x];
	}
}
