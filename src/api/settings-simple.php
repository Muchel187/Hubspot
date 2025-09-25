<?php
/**
 * Simplified Settings API für ATS Dashboard
 * Verwendet Datei-basierte Speicherung statt Datenbank
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Settings-Datei
$settingsFile = __DIR__ . '/../data/settings.json';
$settingsDir = dirname($settingsFile);

// Verzeichnis erstellen falls nicht vorhanden
if (!is_dir($settingsDir)) {
    mkdir($settingsDir, 0777, true);
}

// Default Settings
$defaultSettings = [
    'hubspot_api_key' => '',
    'hubspot_sync_enabled' => false,
    'email_notifications' => true,
    'company_name' => 'NOBA Experts'
];

// Settings laden
function loadSettings() {
    global $settingsFile, $defaultSettings;

    if (file_exists($settingsFile)) {
        $content = file_get_contents($settingsFile);
        return json_decode($content, true) ?: $defaultSettings;
    }

    return $defaultSettings;
}

// Settings speichern
function saveSettings($settings) {
    global $settingsFile;
    return file_put_contents($settingsFile, json_encode($settings, JSON_PRETTY_PRINT));
}

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'get':
            $settings = loadSettings();

            // API Key maskieren
            if (!empty($settings['hubspot_api_key'])) {
                $key = $settings['hubspot_api_key'];
                $settings['hubspot_api_key_masked'] = substr($key, 0, 10) . '...' . substr($key, -4);
                $settings['hubspot_configured'] = true;
            } else {
                $settings['hubspot_configured'] = false;
            }

            // Format für Frontend
            $formattedSettings = [];
            foreach ($settings as $key => $value) {
                $formattedSettings[$key] = [
                    'value' => $value,
                    'type' => is_bool($value) ? 'boolean' : (is_numeric($value) ? 'number' : 'string')
                ];
            }

            echo json_encode(['success' => true, 'data' => $formattedSettings]);
            break;

        case 'update':
            $data = json_decode(file_get_contents('php://input'), true);

            // Aktuelle Settings laden
            $currentSettings = loadSettings();

            // Neue Werte übernehmen
            foreach ($data as $key => $value) {
                $currentSettings[$key] = $value;
            }

            // Speichern
            if (saveSettings($currentSettings)) {
                echo json_encode(['success' => true, 'message' => 'Einstellungen gespeichert']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Fehler beim Speichern']);
            }
            break;

        case 'test-hubspot':
            $data = json_decode(file_get_contents('php://input'), true);
            $apiKey = $data['api_key'] ?? '';

            if (empty($apiKey)) {
                echo json_encode(['success' => false, 'error' => 'API Key ist leer']);
                break;
            }

            // DEMO-MODUS: Akzeptiere Test-Keys für Demonstration
            if ($apiKey === 'demo-key' || $apiKey === 'test-1234') {
                echo json_encode([
                    'success' => true,
                    'message' => '✅ DEMO-MODUS: Test-Key akzeptiert! In Production benötigen Sie einen echten HubSpot Private App Token.'
                ]);
                break;
            }

            // Prüfe ob es wie ein echter HubSpot Key aussieht
            if (!str_starts_with($apiKey, 'pat-')) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Ungültiges Format. HubSpot Private App Tokens beginnen mit "pat-"',
                    'hint' => 'Für Demo-Zwecke verwenden Sie "demo-key" oder holen Sie sich einen echten Token von HubSpot.'
                ]);
                break;
            }

            // Test mit echter HubSpot API
            $ch = curl_init('https://api.hubapi.com/crm/v3/objects/contacts?limit=1');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $apiKey,
                'Content-Type: application/json'
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                echo json_encode(['success' => false, 'error' => 'Verbindungsfehler: ' . $curlError]);
            } elseif ($httpCode === 200) {
                echo json_encode([
                    'success' => true,
                    'message' => '✅ Verbindung erfolgreich! HubSpot API Key ist gültig und funktioniert.'
                ]);
            } elseif ($httpCode === 401) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Ungültiger API Key',
                    'hint' => 'Der Token wurde von HubSpot abgelehnt. Bitte prüfen Sie: 1) Ist der Token korrekt kopiert? 2) Ist die Private App aktiv? 3) Hat sie die nötigen Scopes?'
                ]);
            } else {
                echo json_encode(['success' => false, 'error' => 'HubSpot Fehler (HTTP ' . $httpCode . ')', 'response' => substr($response, 0, 200)]);
            }
            break;

        case 'sync-status':
            // Dummy-Status für Demo
            echo json_encode([
                'success' => true,
                'data' => [
                    'synced_candidates' => 0,
                    'unsynced_candidates' => 8,
                    'synced_jobs' => 0,
                    'unsynced_jobs' => 5,
                    'last_sync' => null
                ]
            ]);
            break;

        default:
            echo json_encode(['success' => false, 'error' => 'Unknown action']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>