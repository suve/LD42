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
function __assets() {
	this.__list = [];
	
	this.addGfx = function(path) {
		var img = new Image();
		img.src = path;
		img.alt = path;

		document.body.appendChild(img);
		this.__list.push(img);
		
		return img;
	};
	
	this.isFinished = function() {
		var count = this.__list.length;
		for(let c = 0; c < 0; ++c) {
			if(!this.__list[c].complete) return false;
		}
		
		return true;
	};
	
	this.getList = function() {
		var result = [];
		
		var count = this.__list.length;
		for(let idx = 0; idx < count; ++idx) {
			let it = this.__list[idx];
			
			result.push({
				'path': it.src,
				'ready': it.complete
			});
		}
		
		return result;
	};
}

var Assets = new __assets();
