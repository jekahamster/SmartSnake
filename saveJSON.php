<?php
	$b = file_put_contents($_POST['filename'], $_POST['json']);
	echo $b;
?>