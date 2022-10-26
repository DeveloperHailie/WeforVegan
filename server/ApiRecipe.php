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

$apirecipe_sql = "SELECT * FROM apirecipe WHERE recipe_rp_name LIKE '{$search_key}'" ;

$apires = mysqli_query($con, $apirecipe_sql) or die(mysqli_error($con));

$finalresult = array();

if($row[2]= 'api'){
while($apirow = mysqli_fetch_array($apires)){

		array_push($finalresult, 
		array('api_idx'=>$apirow[10], 'api_category'=>$apirow[0], 'api_imgurlsmall'=>$apirow[6], 'api_imgurlbig'=>$apirow[7], 'api_recipe'=>$apirow[8], 'api_ingredient'=>$apirow[9]
		));
	}

} 

echo json_encode(array("finalresult"=>$finalresult), JSON_UNESCAPED_UNICODE);


mysqli_close($con);

?>
