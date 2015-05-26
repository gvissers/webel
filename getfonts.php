<?php

define('FONT_CHARS_PER_LINE', 14);
define('FONTS_ARRAY_SIZE', 10);

$fonts = array();

$iter = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator('.',
				FilesystemIterator::KEY_AS_PATHNAME
				| FilesystemIterator::SKIP_DOTS
				| FilesystemIterator::FOLLOW_SYMLINKS));
foreach ($iter as $fname => $path_obj)
{
	unset($matches);
	if (!preg_match('/^font(\d*).dds/', $path_obj->getBasename(), $matches))
		continue;
	if (!$path_obj->isFile())
		continue;

	$nr = $matches[1] ? intval($matches[1]) : 0;
	if ($nr == 1)
	{
		$widths = array(
			 4,  2,  7, 11,  8, 12, 12,  2,  7,  7,  9, 10,  3,  8,
			 2, 10, 10, 10,  8,  8, 10,  7,  9,  9,  9,  9,  3,  3,
			10, 10, 10,  9, 12, 12,  9, 10, 10,  9,  9, 10,  9,  8,
			 7, 11,  8, 11, 10, 11,  9, 11, 11,  9, 10,  9, 12, 12,
			12, 12, 10,  6, 10,  6, 10, 12,  3, 11,  9,  9,  9,  9,
			 8,  9,  9,  4,  6, 10,  4, 11,  9, 10,  9,  9,  8,  8,
			 8,  9, 10, 12, 10, 10,  9,  8,  2,  8, 10,  8, 12, 12,
			12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
			12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
			12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12
		);
		$spacing = 4;
	}
	else if ($nr == 2)
	{
		$widths = array(
			 8,  8,  8, 10,  8, 10, 10,  8,  8,  8,  8, 10,  8,  8,
			 8,  8,  8,  8,  8,  8,  8,  8,  8,  8,  8,  8,  8,  8,
			10, 10, 10,  8, 12, 10, 10, 10, 10, 10, 10, 10, 10, 10,
			10, 10, 10, 10, 10, 10, 10, 10,  8, 10, 10, 10, 10, 10,
			10, 10, 10, 10, 10, 10, 10,  8,  8,  8,  8,  8,  8,  8,
			10,  8,  8,  8,  8,  8,  8, 10,  8,  8,  8,  8,  8,  8,
			 8,  8,  8, 10,  8,  8,  8, 10,  8, 10, 10,  8, 10,  8,
			 8,  8, 10, 10, 10,  8, 10, 10,  8,  8,  8, 12, 12, 12,
			10, 10, 12, 10, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
			12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12
		);
		$spacing = 2;
	}
	else
	{
		$widths = array_fill(0, FONT_CHARS_PER_LINE*FONTS_ARRAY_SIZE, 12);
		$spacing = 0;
	}

	$fonts[$nr] = array(
		'texture_fname' => substr($fname, 2),
		'widths' => $widths,
		'spacing' => $spacing
	);
}

$json_data = json_encode($fonts);

header('Content-Type: application/json');
echo $json_data;
