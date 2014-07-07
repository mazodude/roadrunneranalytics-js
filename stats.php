<?php
header('Content-Type: application/x-javascript');
include('min/cache.class.php');

$cache = new RoadRunner();

$file = array('min/stats.js');
$fileComp = 'tmp/stats.comp';

$update = $cache->checkCache($file,$fileComp);
if ($update){
	// There is no cache yet
	$fileOut = $cache->openUncompressed($file[0]);
	require_once('min/class.JavaScriptPacker.php');
	$encoding = 62;
	$fast_decode = false;
	$special_char = false;
	$packer = new JavaScriptPacker($fileOut, $encoding, $fast_decode, $special_char);
	$packed = $packer->pack();
	$cache->output = $packed;
	$cache->updateCache($fileComp,$packed);
	$cache->compressgz($packed,$fileComp.'.gz');
	$cache->expiresHeaders();
	echo $cache->finalOutput();
}
?>