<?php

header('Content-Type: application/json');
try
{
	if (!isset($_REQUEST['fname']))
		throw new Exception('No file name provided');

	if (!preg_match('#^(\./+)?(.*\.atlas)$#', $_REQUEST['fname'], $matches))
		throw new Exception('Invalid file name');

	$fname_json = $matches[2] . '.json';
	if (file_exists($fname_json))
	{
		if (@readfile($fname_json) === false)
			throw new Exception('Failed to read file');
	}
	else if ($fname_json == '__all__.atlas.json')
	{
		$res = array();
		$iter = new RecursiveIteratorIterator(
					new RecursiveDirectoryIterator('.',
						FilesystemIterator::KEY_AS_PATHNAME
						| FilesystemIterator::SKIP_DOTS
						| FilesystemIterator::FOLLOW_SYMLINKS));
		foreach ($iter as $fname => $path_obj)
		{
			if ($path_obj->isFile() && substr($fname, -11) == '.atlas.json')
			{
				$obj = json_decode(file_get_contents($fname), true);
				$res = array_merge($res, $obj);
			}
		}

		$json_data = json_encode($res);
		@file_put_contents($fname_json, $json_data);
		echo $json_data;
	}
	else
	{
		throw new Exception('File not found');
	}
}
catch (Exception $e)
{
	echo json_encode(array('error' => $e->getMessage()));
}
