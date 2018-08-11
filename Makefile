# LF42
# Copyright (C) 2018 Artur "suve" Iwicki
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License, version 3,
# as published by the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program (LICENCE.txt).
# If not, see <http://www.gnu.org/licenses/>.

GRAPHICS_DEVEL := $(shell ls gfx/*.png)
GRAPHICS_BUILD := $(GRAPHICS_DEVEL:gfx/%.png=build/%.png)

SOUNDS_DEVEL := $(shell ls sfx/*.wav)
SOUNDS_BUILD := $(SOUNDS_DEVEL:sfx/%.wav=build/%.wav)

SOURCES_DEVEL := $(shell ls src/*.js)
SOURCES_BUILD := $(SOURCES_DEVEL:src/%.js=build/%.js)

all: build/index.html build/style.css build/mapdata.js $(SOURCES_BUILD) $(GRAPHICS_BUILD) $(SOUNDS_BUILD)

build/%.html: src/%.html
	mkdir -p build
	cp "$<" "$@"

build/%.css: src/%.css
	mkdir -p build
	cp "$<" "$@"

build/mapdata.js: map/test.png src/map-to-js.php
	src/map-to-js.php "$<" > "$@"

build/%.js: src/%.js
	mkdir -p build
	cat "$<" | sed -e 's|"\.\./gfx/\([a-zA-Z0-9._\-]*\)"|"\1"|g' -e 's|"\.\./sfx/\([a-zA-Z0-9._\-]*\)"|"\1"|g' > "$@"

build/%.png: gfx/%.png
	mkdir -p build
	convert "$<" -transparent '#209C00' -transparent '#FF678B' "$@.transparent.png"
	pngcrush "$@.transparent.png" "$@" >/dev/null 2>/dev/null
	rm "$@.transparent.png"

build/%.wav: sfx/%.wav
	mkdir -p build
	cp "$<" "$@"

clean:
	rm -rf build/
