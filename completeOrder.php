<?php
$apiKey = 'fww6AZ8Ib7ddaJyqqPbrPZrCIOByeSXd';
$id = $_GET['id'];

$url = "https://smsbower.com/stubs/handler_api.php?api_key=$apiKey&action=setStatus&status=6&id=$id";
$response = file_get_contents($url);
echo $response;
?>