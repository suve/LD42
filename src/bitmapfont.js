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
function BitmapFont(img, start, w, h) {
	this.img = img;
	this.start = start.toString().charCodeAt(0);
	this.w = w;
	this.h = h;
	this.xspc = 0;
	this.yspc = 0;
	this.scale = 1;
	
	this.setSpacing = function(xs, ys) {
		this.xspc = (xs > 0) ? xs : 0;
		this.yspc = (ys > 0) ? ys : 0;
	};
	
	this.textWidth = function(text) {
		let len = text.toString().length;
		let wid = (len * w) + ((len > 0) ? (len-1) : 0) * this.xspc;
		
		return wid * this.scale;
	};
	
	this.print = function(text, x, y) {
		let startX = x;
		
		text = text.toString();
		let len = text.length;
		for(let i = 0; i < len; ++i) {
			let cc = text.charCodeAt(i);
			if((cc -= this.start) < 0) continue;
			
			ctx.drawImage(this.img, cc*this.w, 0, this.w, this.h, x, y, this.w*this.scale, this.h*this.scale);
			x += (this.w + this.xspc) * this.scale;
		}
	};
}
