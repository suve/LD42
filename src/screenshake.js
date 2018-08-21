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
const SHAKE_FREQ_MIN = 1.75;
const SHAKE_FREQ_MAX = 6.666;
 
function Screenshake(magnitude, duration) {
	this.amplitude = magnitude;
	this.frequency = {
		'x': SHAKE_FREQ_MIN + Math.random() * (SHAKE_FREQ_MAX-SHAKE_FREQ_MIN),
		'y': SHAKE_FREQ_MIN + Math.random() * (SHAKE_FREQ_MAX-SHAKE_FREQ_MIN),
	};
	this.offset = {
		'x': Math.random() > 0.5 ? 0 : Math.PI,
		'y': Math.random() > 0.5 ? 0 : Math.PI,
	};
	
	this.duration = duration;
	this.progress = 0;
	
	this.draw = function() {
		let scale = viewport.getScale();
		
		let mx = Math.round(this.magnitude.x * scale);
		if(this.magnitude.x > 0) {
			fillRect(0, 0, mx, null, 'black');
		} else if(this.magnitude.x < 0) {
			fillRect(canvas.width + mx, 0, -mx, null, 'black');
		}
		
		let my = Math.round(this.magnitude.y * scale);
		if(this.magnitude.y > 0) {
			fillRect(0, 0, null, my, 'black');
		} else if(this.magnitude.y < 0) {
			fillRect(0, canvas.height + my, null, -my, 'black');
		}
	};
	
	this.update = function(delta) {
		this.progress += delta;
		
		scale = 1.0 - (this.progress / this.duration);
		if(scale < 0) scale = 0;
		
		this.magnitude = {
			'x': Math.sin(this.frequency.x * this.progress * 2 * Math.PI + this.offset.x) * scale * this.amplitude,
			'y': Math.sin(this.frequency.y * this.progress * 2 * Math.PI + this.offset.y) * scale * this.amplitude,
		};
	};
	
	this.update(0);
}
