#!/usr/bin/php
<?php
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
const TILE_EMPTY = 0;
const TILE_GRASS = 1;
const TILE_ROCKS = 2;
const TILE_WALL = 3;
const TILE_SPIKES = 4;

const TILE_COIN = -1;
const TILE_POTION = -2;

const TILE_PLAYER = -40;
const TILE_EXIT   = -41;

const TILE_WALKER_R = -50;
const TILE_WALKER_L = -51;
const TILE_JUMPER_R = -52;
const TILE_JUMPER_L = -53;


function int_to_rgb(int $int) {
	$b = $int & 0xFF;
	$int = $int >> 8;
	
	$g = $int & 0xFF;
	$int = $int >> 8;
	
	$r = $int & 0xFF;
	
	return [
		'r' => $r,
		'g' => $g,
		'b' => $b
	];
}

function int_to_hex($int, $digits = -1) {
	$hex = '';
	while($int > 0) {
		$digit = $int % 16;
		$int = floor($int / 16);
		
		if($digit < 10)
			$hex = $digit . $hex;
		else
			$hex = chr(65 - 10 + $digit) . $hex;
	}
	
	if($digits > 0) {
		$len = strlen($hex);
		while($len++ < $digits) $hex = '0' . $hex;
	}
	
	return $hex;
}

function rgb_to_hex($rgb) {
	$r = int_to_hex($rgb['r'], 2);
	$g = int_to_hex($rgb['g'], 2);
	$b = int_to_hex($rgb['b'], 2);
	
	return $r . $g . $b;
}

function hex_to_tile($hex) {
	switch($hex) {
		case '00C0FF':
			return TILE_EMPTY;
		
		case '00C000':
			return TILE_GRASS;
		
		case '7B2910':
			return TILE_ROCKS;
		
		case '7F7F7F':
			return TILE_WALL;
		
		case 'FF8080':
			return TILE_SPIKES;
		
		case 'FFFF00':
			return TILE_COIN;
			
		case 'FFFFFF':
			return TILE_POTION;
			
		case '0000C4':
			return TILE_PLAYER;
			
		case '0000FF':
			return TILE_EXIT;
		
		case 'FF0000':
			return TILE_WALKER_R;
			
		case 'DD0000':
			return TILE_WALKER_L;
			
		case 'FF00FF':
			return TILE_JUMPER_R;
			
		case 'DD00DD':
			return TILE_JUMPER_L;
		
		default:
			fprintf(STDERR, "map-to-js.php: What the fuck is \"$hex\"?\n");
			exit(1);
	}
}

if($argc < 2) {
	fprintf(STDERR, "map-to-js.php: You must provide a FILE to be processed\n");
	exit(1);
}

$img = imagecreatefrompng($argv[1]);
if($img === FALSE) {
	fprintf(STDERR, "map-to-js.php: Failed to open \"" . $argv[1] . "\"\n");
	exit(1);
}

$w = imagesx($img);
$h = imagesy($img);

$pixels;
for($y = 0; $y < $h; ++$y) {
	for($x = 0; $x < $w; ++$x) {
		$px = rgb_to_hex(int_to_rgb(imagecolorat($img, $x, $y)));
		
		$pixels[$y][$x] = hex_to_tile($px);
	}
}


$varname = basename($argv[1]);
$varname = preg_replace('/\..*$/', '', $varname);
$varname = preg_replace('/[^a-zA-Z0-9_]/', '_', $varname);
$varname = preg_replace('/^[^a-zA-Z_]*/', '', $varname);
$varname .= '_mapdata';

echo "var $varname = [\n";
for($y = 0; $y < $h; ++$y) {
	echo "\t[" . implode(', ', $pixels[$y]) . "],\n";
}
echo "];\n";
