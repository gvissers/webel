<?php

header('Content-Type: application/json');
try
{
	if (!isset($_REQUEST['fname']))
		throw new Exception('No file name provided');

	if (!preg_match('#^(\./+)?(.*)\.part$#', $_REQUEST['fname'], $matches))
		throw new Exception('Invalid file name');
	$basename = $matches[2];

	$fname_part = $basename . '.part';
	$have_part = file_exists($fname_part);
	$fname_json = $basename . '.json';
	$have_json = file_exists($fname_json);

	$read_json = false;
	if (!$have_part)
	{
		if (!$have_json)
			throw new Exception('File not found');
		$read_json = true;
	}
	else if ($have_json)
	{
		$stat_part = stat($fname_part);
		$stat_json = stat($fname_json);
		$read_json = $stat_part['mtime'] < $stat_json['mtime'];
	}

	if ($read_json)
	{
		if (@readfile($fname_json) === false)
			throw new Exception('Failed to read file');
	}
	else
	{
		$data = file_get_contents($fname_part);
		$data = str_replace(',', ' ', $data);

		$fields = sscanf($data, '%d %u %x %x %u %d %d %f %u %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f %f%n');
error_log(print_r($fields,1));
		if (count($fields) != 45)
			throw new Exception('Unable to parse particle system definition');

		$res = array(
			'version' => $fields[0],
			'type' => $fields[1],
			'blend' => array('source' => $fields[2], 'dest' => $fields[3]),
			'count' => $fields[4],
			'time_to_live' => $fields[5] < 0 ? -1 : 18*4*$fields[5],
			'texture_fname' => "textures/particle{$fields[6]}.dds",
			'size' => $fields[7],
			'random_function' => $fields[8],
			'min_position' => array($fields[9], $fields[10], $fields[11]),
			'max_position' => array($fields[12], $fields[13], $fields[14]),
			'radius_squared' => $fields[15],
			'min_velocity' => array($fields[16], $fields[17], $fields[18]),
			'max_velocity' => array($fields[19], $fields[20], $fields[21]),
			'min_color' => array($fields[22], $fields[23], $fields[24], $fields[25]),
			'max_color' => array($fields[26], $fields[27], $fields[28], $fields[29]),
			'min_acceleration' => array($fields[30], $fields[31], $fields[32]),
			'max_acceleration' => array($fields[33], $fields[34], $fields[35]),
			'min_color_diff' => array($fields[36], $fields[37], $fields[38], $fields[39]),
			'max_color_diff' => array($fields[40], $fields[41], $fields[42], $fields[43]),
			'use_light' => false,
			'light_position' => null,
			'light_color' => null,
			'sound' => -1
		);

		$data = trim(substr($data, $fields[44]));
		if ($data)
		{
			$fields = sscanf($data, '%d %f %f %f %f %f %f%n');
			if (count($fields) == 8)
			{
				$res['use_light'] = !!$fields[0];
				$res['light_position'] = array($fields[1], $fields[2], $fields[3]);
				$res['light_color'] = array($fields[4], $fields[5], $fields[6]);

				$data = trim(substr($data, $fields[7]));
				if ($data)
				{
					$fields = sscanf($data, '%d');
					if ($fields)
						$res['sound'] = $fields[0];
				}
			}
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
