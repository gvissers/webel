<?php

function skyboxXMLToArray($node)
{
	$res = array();
	foreach ($node->attributes as $name => $val)
	{
		$vval = strtolower($val->value);
		if ( ($fval = filter_var($vval, FILTER_VALIDATE_BOOLEAN,
			array('flags' => FILTER_NULL_ON_FAILURE))) !== null )
		{
			$vval = $fval;
		}
		else if ( ($fval = filter_var($vval, FILTER_VALIDATE_INT,
			array('flags' => FILTER_FLAG_ALLOW_OCTAL|FILTER_FLAG_ALLOW_HEX))) !== false )
		{
			$vval = $fval;
		}
		else if ( ($fval = filter_var($vval, FILTER_VALIDATE_FLOAT)) !== false )
		{
			$vval = $fval;
		}
		$res[$name] = $vval;
	}

	foreach ($node->childNodes as $child)
	{
		if ($child->nodeType == XML_ELEMENT_NODE)
		{
			$res[$child->tagName] = skyboxXMLToArray($child);
		}
	}

	return $res;
}

header('Content-Type: application/json');
try
{
	$doc = new DomDocument();
	$doc->load('elc/skybox/skybox_defs.xml', LIBXML_NOENT);
	$res = skyboxXMLToArray($doc->documentElement);

	$json_data = json_encode($res);
	echo $json_data;
}
catch (Exception $e)
{
	echo json_encode(array('error' => $e->getMessage()));
}
