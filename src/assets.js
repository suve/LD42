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
const ASSET_ERROR   = -1;
const ASSET_LOADING =  0;
const ASSET_READY   = +1;

function __assets() {
	this.__list = [];
	
	this.__addEntry = function(path, elem) {
		let entry = {
			'ready': ASSET_LOADING,
			'path': path,
			'elem': elem
		};
		elem.onload = () => entry.ready = ASSET_READY;
		elem.oncanplaythrough = () => entry.ready = ASSET_READY;
		elem.onerror = () => entry.ready = ASSET_ERROR;

		document.body.appendChild(elem);
		this.__list.push(entry);
	};
	
	this.addGfx = function(path) {
		let img = new Image();
		img.src = path;
		img.alt = path;

		this.__addEntry(path, img);
		return img;
	};
	
	this.addSfx = function(path) {
		let sfx = new Audio(path);
		sfx.preload = true;
		sfx.autoplay = false;
		sfx.type = 'audio/wav';

		this.__addEntry(path, sfx);
		return sfx;
	};
	
	this.loadingFinished = function() {
		var count = this.__list.length;
		for(let idx = 0; idx < count; ++idx) {
			let e = this.__list[idx];
			if(e.ready !== ASSET_READY) return false;
		}
		
		return true;
	};
	
	this.getList = function() {
		return this.__list;
	};
}

var Assets = new __assets();
