<?php

header("Content-Type:text/html;charset=utf8");

$con=mysqli_connect("dbinstance.c4nf0uecennm.us-east-2.rds.amazonaws.com", "weforvegan", "sungshin18" , "weforvegan");

if(mysqli_connect_errno($con))
{
	echo "Failed to connect to MySQL: " . mysqli_connect_errno();
}

mysqli_set_charset($con, "utf8");

$res = mysqli_query($con, "select * from recipe");

$result = array();

while($row = mysqli_fetch_array($res)){

	array_push($result, 
		array('rp_inx'=>$row[0], 'rp_name'=>$row[1], 'rp_source'=>$row[2]
		));
	}
	

echo json_encode(array("result"=>$result), JSON_UNESCAPED_UNICODE);


mysqli_close($con);

?>