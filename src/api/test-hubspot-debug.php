<?php
/**
 * HubSpot API Test mit detailliertem Debugging
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents('php://input'), true);
$apiKey = $data['api_key'] ?? '';

if (empty($apiKey)) {
    echo json_encode(['success' => false, 'error' => 'Kein API Key angegeben']);
    exit;
}

// Debug-Informationen sammeln
$debug = [
    'api_key_length' => strlen($apiKey),
    'api_key_prefix' => substr($apiKey, 0, 7),
    'curl_version' => curl_version()['version']
];

// Test 1: Einfacher Test mit dem neuen v3 Endpoint
$testUrl = 'https://api.hubapi.com/crm/v3/objects/contacts?limit=1';

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $testUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "GET",
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer " . $apiKey,
        "Content-Type: application/json",
        "Accept: application/json"
    ],
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_VERBOSE => true,
    CURLOPT_FOLLOWLOCATION => true
]);

// Fehler-Buffer für detaillierte Infos
$verbose = fopen('php://temp', 'w+');
curl_setopt($ch, CURLOPT_STDERR, $verbose);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
$curlInfo = curl_getinfo($ch);

// Verbose-Output lesen
rewind($verbose);
$verboseLog = stream_get_contents($verbose);
fclose($verbose);

curl_close($ch);

// Response vorbereiten
$result = [
    'http_code' => $httpCode,
    'curl_error' => $curlError,
    'response_preview' => substr($response, 0, 500),
    'debug' => $debug,
    'curl_info' => [
        'url' => $curlInfo['url'],
        'total_time' => $curlInfo['total_time'],
        'ssl_verify_result' => $curlInfo['ssl_verify_result']
    ]
];

// Auswertung
if ($curlError) {
    $result['success'] = false;
    $result['error'] = 'cURL Fehler: ' . $curlError;
    $result['suggestion'] = 'Netzwerkproblem - bitte prüfen Sie Ihre Internetverbindung';
} elseif ($httpCode === 200) {
    $result['success'] = true;
    $result['message'] = '✅ Verbindung erfolgreich! Der API Key ist gültig.';

    // Versuche Portal-Info zu extrahieren
    $responseData = json_decode($response, true);
    if (isset($responseData['results'])) {
        $result['info'] = 'HubSpot Account ist aktiv und erreichbar';
    }
} elseif ($httpCode === 401) {
    $result['success'] = false;
    $result['error'] = 'Ungültiger API Key';
    $result['suggestion'] = 'Bitte überprüfen Sie:\n1. Ist es ein Private App Access Token? (beginnt mit "pat-")\n2. Hat die App die richtigen Scopes (CRM)?';
} elseif ($httpCode === 403) {
    $result['success'] = false;
    $result['error'] = 'Zugriff verweigert';
    $result['suggestion'] = 'Der API Key ist gültig, aber hat keine Berechtigung für Contacts. Bitte CRM-Scopes in der Private App aktivieren.';
} elseif ($httpCode === 0) {
    $result['success'] = false;
    $result['error'] = 'Keine Verbindung möglich';
    $result['suggestion'] = 'SSL/TLS Problem oder Firewall blockiert die Verbindung';
} else {
    $result['success'] = false;
    $result['error'] = 'Unerwarteter HTTP Code: ' . $httpCode;
    $result['response'] = $response;
}

echo json_encode($result, JSON_PRETTY_PRINT);
?>