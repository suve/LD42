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
const AUDIO_SLOTS = 8;

function __sfx() {
	this.__list = [];
	
	this.__createSfx = function(sfx) {
		let elems = [];
		for(let idx = 0; idx < AUDIO_SLOTS; ++idx) elems[idx] = sfx.cloneNode();
		
		let entry = {
			'lastUsed': AUDIO_SLOTS-1,
			'list': elems
		};
		this.__list[sfx.src] = entry;
	};
	
	this.play = function(sfx) {
		if(this.__list[sfx.src] === undefined) this.__createSfx(sfx);
		
		let e = this.__list[sfx.src];
		e.list[e.lastUsed].play();
		e.lastUsed = (e.lastUsed + 1) % AUDIO_SLOTS;
	};
}

var Sfx = new __sfx();
