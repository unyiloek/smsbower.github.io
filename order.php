<?php
$api_key = "fww6AZ8Ib7ddaJyqqPbrPZrCIOByeSXd"; // Ganti dengan API key Anda
$service = $_GET['service'];
$country = $_GET['country'];
$maxPrice = $_GET['maxPrice'] ?? '';
$phoneException = $_GET['phoneException'] ?? '';
$ref = $_GET['ref'] ?? '';

$url = "https://smsbower.com/stubs/handler_api.php?api_key=$api_key&action=getNumber&service=$service&country=$country&maxPrice=$maxPrice&phoneException=$phoneException&ref=$ref";

$response = file_get_contents($url);
echo $response;
?>
