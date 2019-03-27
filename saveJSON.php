<?php
	$b = file_put_contents("maps/".$_POST['filename'], $_POST['json']);
	echo $b;
?>