<?php

function typify($str)
{
	$vval = strtolower($str);
	if ( ($fval = filter_var($vval, FILTER_VALIDATE_INT,
		array('flags' => FILTER_FLAG_ALLOW_OCTAL|FILTER_FLAG_ALLOW_HEX))) !== false )
	{
		return $fval;
	}
	if ( ($fval = filter_var($vval, FILTER_VALIDATE_FLOAT)) !== false )
	{
		return $fval;
	}
	if ( ($fval = filter_var($vval, FILTER_VALIDATE_BOOLEAN,
		array('flags' => FILTER_NULL_ON_FAILURE))) !== null )
	{
		return $fval;
	}
	return $str;
}

function skyboxXMLToArray($node)
{
	if (!$node->hasAttributes() && $node->childNodes->length == 1
		&& $node->childNodes->item(0)->nodeType == XML_TEXT_NODE)
	{
		return typify($node->textContent);
	}

	$res = array();
	foreach ($node->attributes as $name => $val)
	{
		$res[$name] = typify(strtolower($val->value));
	}

	foreach ($node->childNodes as $child)
	{
		if ($child->nodeType == XML_ELEMENT_NODE)
		{
			$child_data = skyboxXMLToArray($child);
			if ($child->tagName == 'map')
			{
				$name = $child_data['name'];
				unset($child_data['name']);
				$res[$name] = $child_data;
			}
			else
			{
				$res[$child->tagName] = $child_data;
			}
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
