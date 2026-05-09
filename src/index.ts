<?php

header('Content-Type: application/json');

// Get parameters from URL
$token             = $_GET['token'] ?? 'qNORzRRGvQA_';
$type              = $_GET['type'] ?? 'label';
$page              = $_GET['p'] ?? '';
$n_song            = $_GET['n_song'] ?? '10';
$n_album           = $_GET['n_album'] ?? '14';
$category          = $_GET['category'] ?? 'latest';
$sort_order        = $_GET['sort_order'] ?? 'desc';
$language          = $_GET['language'] ?? 'unknown';
$includeMetaTags   = $_GET['includeMetaTags'] ?? '0';
$ctx               = $_GET['ctx'] ?? 'web6dot0';
$api_version       = $_GET['api_version'] ?? '4';
$format            = $_GET['_format'] ?? 'json';
$marker            = $_GET['_marker'] ?? '0';

// Build API URL
$url = "https://www.jiosaavn.com/api.php?"
    . "__call=webapi.get"
    . "&token=" . urlencode($token)
    . "&type=" . urlencode($type)
    . "&p=" . urlencode($page)
    . "&n_song=" . urlencode($n_song)
    . "&n_album=" . urlencode($n_album)
    . "&category=" . urlencode($category)
    . "&sort_order=" . urlencode($sort_order)
    . "&language=" . urlencode($language)
    . "&includeMetaTags=" . urlencode($includeMetaTags)
    . "&ctx=" . urlencode($ctx)
    . "&api_version=" . urlencode($api_version)
    . "&_format=" . urlencode($format)
    . "&_marker=" . urlencode($marker);

// cURL request
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_USERAGENT => 'Mozilla/5.0'
]);

$response = curl_exec($ch);
$error = curl_error($ch);

curl_close($ch);

// Show error if exists
if ($error) {
    echo json_encode([
        'status' => false,
        'error' => $error
    ], JSON_PRETTY_PRINT);
    exit;
}

// Decode JSON
$data = json_decode($response, true);

// Output
echo json_encode([
    'status' => true,
    'request_url' => $url,
    'parameters' => [
        'token' => $token,
        'type' => $type,
        'p' => $page,
        'n_song' => $n_song,
        'n_album' => $n_album,
        'category' => $category,
        'sort_order' => $sort_order,
        'language' => $language,
        'includeMetaTags' => $includeMetaTags,
        'ctx' => $ctx,
        'api_version' => $api_version,
        '_format' => $format,
        '_marker' => $marker
    ],
    'response' => $data
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>
