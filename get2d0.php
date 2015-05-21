<?php

function get2d0($fname)
{
	$types = array(
		'GROUND' => 0,
		'PLANT' => 1,
		'FENCE' => 2,
		'INVALID' => 3
	);

	$file_width = 1;
	$file_height = 1;
	$data = file_get_contents($fname);
	$res = array('alpha_test' => 0.18);
	foreach(explode("\n", $data) as $line)
	{
		$line = trim($line);
		if (!$line)
			continue;
		list($key, $val) = preg_split('/[:=]/', $line, 2);
		$key = trim($key);
		$val = trim($val);
		switch ($key)
		{
			case 'texture':
				$res['texture_fname'] = dirname($fname) . '/' . $val;
				break;
			case 'file_x_len':
				$file_width = $val;
				break;
			case 'file_y_len':
				$file_height = $val;
				break;
			case 'x_size':
				$res['width'] = floatval($val);
				break;
			case 'y_size':
				$res['height'] = floatval($val);
				break;
			case 'type':
				$val = strtoupper($val);
				if (!isset($types[$val]))
					$val = 'INVALID';
				$res['type'] = $types[$val];
				break;
			case 'alpha_test':
				if ($val > 0)
					$res['alpha_test'] = floatval($val);
				break;
			default:
				$res[$key] = $val;
		}
	}

	if (isset($res['u_start']))
		$res['u_start'] /= $file_width;
	if (isset($res['u_end']))
		$res['u_end'] /= $file_width;
	if (isset($res['v_start']))
		$res['v_start'] /= $file_height;
	if (isset($res['v_end']))
		$res['v_end'] /= $file_height;

	return $res;
}

header('Content-Type: application/json');
try
{
	if (!isset($_REQUEST['fname']))
		throw new Exception('No file name provided');

	if (!preg_match('#^(\./+)?(.*)\.2d0$#', $_REQUEST['fname'], $matches))
		throw new Exception('Invalid file name');
	$basename = $matches[2];

	$fname_2d0 = $basename . '.2d0';
	$have_2d0 = file_exists($fname_2d0);
	$fname_json = $basename . '2d0.json';
	$have_json = file_exists($fname_json);

	$read_json = false;
	if ($basename != '__all__')
	{
		if (!$have_2d0)
		{
			if (!$have_json)
				throw new Exception('File not found');
			$read_json = true;
		}
		else if ($have_json)
		{
			$stat_2d0 = stat($fname_2d0);
			$stat_json = stat($fname_json);
			$read_json = $stat_2d0['mtime'] < $stat_json['mtime'];
		}
	}

	if ($read_json)
	{
		if (@readfile($fname_json) === false)
			throw new Exception('Failed to read file');
	}
	else
	{
		if ($basename == '__all__')
		{
			$res = array();
			$iter = new RecursiveIteratorIterator(
						new RecursiveDirectoryIterator('.',
							FilesystemIterator::KEY_AS_PATHNAME
							| FilesystemIterator::SKIP_DOTS
							| FilesystemIterator::FOLLOW_SYMLINKS));
			foreach ($iter as $fname => $path_obj)
			{
				if ($path_obj->isFile() && $path_obj->getExtension() == '2d0')
				{
					$sfname = substr($fname, 2);
					$res[$sfname] = get2d0($sfname);
				}
			}
		}
		else
		{
			$res = get2d0($fname_2d0);
		}

		$json_data = json_encode($res);
		@file_put_contents($fname_json, $json_data);
		echo $json_data;
	}
}
catch (Exception $e)
{
	echo json_encode(array('error' => $e->getMessage()));
}
