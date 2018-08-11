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
function Viewport() {
	this.getScale = function() {
		return this.__scale;
	};
	
	this.setScale = function(newScale) {
		if(newScale % 2) return;
		if(newScale < 8 || newScale > 16) return;
		
		this.__scale = newScale;
		this.w = canvas.width / this.__scale;
		this.h = canvas.height / this.__scale;
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
