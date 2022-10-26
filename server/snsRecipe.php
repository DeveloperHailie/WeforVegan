<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

<?php
session_start();

header("Content-Type:text/html;charset=utf8");

$con=mysqli_connect("dbinstance.c4nf0uecennm.us-east-2.rds.amazonaws.com", "weforvegan", "sungshin18" , "weforvegan");

if(mysqli_connect_errno($con))
{
	echo "Failed to connect to MySQL: " . mysqli_connect_errno();
}

mysqli_set_charset($con, "utf8");

$search_key='%'.$_POST['recipe'].'%';
$recipe_sql = "SELECT * FROM recipe WHERE rp_name LIKE '{$search_key}'" ;
$res = mysqli_query($con, $recipe_sql) or die(mysqli_error($con));

$result = array();

while($row = mysqli_fetch_array($res)){

		array_push($result, 
		array('rp_idx'=>$row[0], 'rp_source'=>$row[2]
		));
	}


$snsrecipe_sql = "SELECT * FROM snsrecipe WHERE recipe_rp_name LIKE '{$search_key}'" ;


$snsres = mysqli_query($con, $snsrecipe_sql) or die(mysqli_error($con));

$finalresult = array();

if($row[2] = 'twitter' or $row[2]= 'instagram' or $row[2] = '10000 recipe'){
while($snsrow = mysqli_fetch_array($snsres)){

		array_push($finalresult, 
		array('sns_idx'=>$snsrow[2], 'sns_url'=>$snsrow[0], 'sns_imgurl'=>$snsrow[1]
		));
	}

}

echo json_encode(array("finalresult"=>$finalresult), JSON_UNESCAPED_UNICODE);


mysqli_close($con);

?>
