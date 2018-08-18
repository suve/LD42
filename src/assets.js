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
function __assets() {
	this.__list = [];
	
	this.__ready = function(item) {
		if(item.elem instanceof HTMLMediaElement)
			return (item.elem.readyState == HTMLMediaElement.HAVE_ENOUGH_DATA);
		
		return item.elem.complete;
	};
	
	this.addGfx = function(path) {
		var img = new Image();
		img.src = path;
		img.alt = path;

		document.body.appendChild(img);
		this.__list.push({
			'path': path,
			'elem': img
		});
		
		return img;
	};
	
	this.addSfx = function(path) {
		var sfx = new Audio(path);
		sfx.preload = true;
		sfx.autoplay = false;
		sfx.type = 'audio/wav';

		document.body.appendChild(sfx);
		this.__list.push({
			'path': path,
			'elem': sfx
		});
		
		return sfx;
	};
	
	this.loadingFinished = function() {
		var count = this.__list.length;
		for(let idx = 0; idx < count; ++idx) {
			if(!this.__ready(this.__list[idx])) return false;
		}
		
		return true;
	};
	
	this.getList = function() {
		var result = [];
		
		var count = this.__list.length;
		for(let idx = 0; idx < count; ++idx) {
			let it = this.__list[idx];
			
			result.push({
				'path': it.path,
				'ready': this.__ready(it)
			});
		}
		
		return result;
	};
}

var Assets = new __assets();
