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

SOURCES_DEVEL := $(shell ls src/*.js)
SOURCES_BUILD := $(SOURCES_DEVEL:src/%.js=build/%.js)

all: build/index.html build/style.css $(SOURCES_BUILD) $(GRAPHICS_BUILD)

build/%.html: src/%.html
	mkdir -p build
	cp "$<" "$@"

build/%.css: src/%.css
	mkdir -p build
	cp "$<" "$@"

build/%.js: src/%.js
	mkdir -p build
	cat "$<" | sed -e 's|"\.\./gfx/\([a-zA-Z0-9._\-]*\)"|"\1"|g' > "$@"

build/%.png: gfx/%.png
	mkdir -p build
	convert "$<" -transparent '#209C00' "$@.transparent.png"
	pngcrush "$@.transparent.png" "$@" >/dev/null 2>/dev/null
	rm "$@.transparent.png"

clean:
	rm -rf build/
