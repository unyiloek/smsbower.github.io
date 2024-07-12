<?php
$apiKey = 'fww6AZ8Ib7ddaJyqqPbrPZrCIOByeSXd';
$ids = json_decode($_POST['ids'], true);

foreach ($ids as $id) {
    $url = "https://smsbower.com/stubs/handler_api.php?api_key=$apiKey&action=setStatus&status=8&id=$id";
    file_get_contents($url);
}

echo json_encode(['status' => 'success']);
?>