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
const GfxSizes = [8, 12];

function Viewport() {
	this.getScale = function() {
		return this.__scale;
	};
	
	this.setScale = function(newScale) {
		let found = false;
		for(let idx = 0; idx < GfxSizes.length; ++idx) {
			if(GfxSizes[idx] === newScale) {
				this.__scale = newScale;
				this.w = canvas.width / this.__scale;
				this.h = canvas.height / this.__scale;
				
				break;
			}
		}
		return this.__scale;
	};
	
	this.update = function(player) {
		this.x = (player.x + 0.5) - this.w / 2;
		if(this.x < 0)
			this.x = 0;
		else if(this.x + this.w > map.w)
			this.x = map.w-this.w;
		
		this.y = (player.y - 0.5) - this.h / 2;
		if(this.y < 0)
			this.y = 0;
		else if(this.y + this.h > map.h)
			this.y = map.h-this.h;
	}
	
	// Init
	this.setScale(8);
}
