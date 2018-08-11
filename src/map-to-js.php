#!/usr/bin/php
<?php

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
			return 0;
		
		case '00C000':
			return 1;
		
		case '7F7F7F':
			return 2;
		
		default:
			echo "What the fuck is \"$hex\"?\n";
			exit(1);
	}
}

if($argc < 2) {
	echo "You must provide a FILE to be processed\n";
	exit(1);
}

$img = imagecreatefrompng($argv[1]);
if($img === FALSE) {
	echo "Failed to open \"" . $argv[1] . "\"\n";
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

echo "var mapdata = [\n";
for($y = 0; $y < $h; ++$y) {
	echo "\t[" . implode(', ', $pixels[$y]) . "],\n";
}
echo "];\n";
