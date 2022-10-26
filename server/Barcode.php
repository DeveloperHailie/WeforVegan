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

$search_key= $_POST['BAR_NUM'];
$bar_sql = "SELECT * FROM barcode WHERE pt_barcode =" .$search_key ;
$res = mysqli_query($con, $bar_sql);

$result = array();

while($row = mysqli_fetch_array($res)){
		array_push($result, 
		array('pt_name'=>$row[1], 'pt_rawmtr'=>$row[2]
		));
	}
	

echo json_encode(array("result"=>$result), JSON_UNESCAPED_UNICODE);


mysqli_close($con);

?>