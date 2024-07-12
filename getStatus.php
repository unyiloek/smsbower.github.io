<?php
$api_key = "fww6AZ8Ib7ddaJyqqPbrPZrCIOByeSXd"; // Ganti dengan API key Anda
$id = $_GET['id'];

$url = "https://smsbower.com/stubs/handler_api.php?api_key=$api_key&action=getStatus&id=$id";

$response = file_get_contents($url);
echo $response;
?>
