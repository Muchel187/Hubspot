<?php
/**
 * Settings API für ATS Dashboard
 * Verwaltet System-Einstellungen inkl. HubSpot API Key
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../db.php';
$pdo = db();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'get':
            // Alle Settings abrufen
            $stmt = $pdo->query('SELECT key, value, type FROM settings');
            $settings = [];

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $settings[$row['key']] = [
                    'value' => $row['value'],
                    'type' => $row['type']
                ];
            }

            // API Key maskieren für Sicherheit
            if (isset($settings['hubspot_api_key']) && !empty($settings['hubspot_api_key']['value'])) {
                $key = $settings['hubspot_api_key']['value'];
                $settings['hubspot_api_key']['masked'] = substr($key, 0, 10) . '...' . substr($key, -4);
                $settings['hubspot_api_key']['configured'] = true;
            } else {
                $settings['hubspot_api_key']['configured'] = false;
            }

            echo json_encode(['success' => true, 'data' => $settings]);
            break;

        case 'update':
            // Settings aktualisieren
            $data = json_decode(file_get_contents('php://input'), true);

            $stmt = $pdo->prepare('
                INSERT OR REPLACE INTO settings (key, value, type, updated_at)
                VALUES (?, ?, ?, datetime("now"))
            ');

            foreach ($data as $key => $value) {
                // Spezielle Behandlung für HubSpot Key
                if ($key === 'hubspot_api_key' && !empty($value)) {
                    // Test HubSpot Verbindung
                    $testResult = testHubSpotConnection($value);
                    if (!$testResult['success']) {
                        echo json_encode([
                            'success' => false,
                            'error' => 'HubSpot API Key ungültig: ' . $testResult['error']
                        ]);
                        exit;
                    }
                }

                $type = is_bool($value) ? 'boolean' : (is_numeric($value) ? 'number' : 'string');
                $stmt->execute([$key, $value, $type]);
            }

            echo json_encode(['success' => true, 'message' => 'Einstellungen gespeichert']);
            break;

        case 'test-hubspot':
            // HubSpot Verbindung testen
            $data = json_decode(file_get_contents('php://input'), true);
            $apiKey = $data['api_key'] ?? '';

            $result = testHubSpotConnection($apiKey);
            echo json_encode($result);
            break;

        case 'sync-status':
            // Sync Status abrufen
            $stmt = $pdo->query('
                SELECT
                    (SELECT COUNT(*) FROM candidates WHERE hubspot_id IS NOT NULL) as synced_candidates,
                    (SELECT COUNT(*) FROM candidates WHERE hubspot_id IS NULL) as unsynced_candidates,
                    (SELECT COUNT(*) FROM jobs WHERE hubspot_id IS NOT NULL) as synced_jobs,
                    (SELECT COUNT(*) FROM jobs WHERE hubspot_id IS NULL) as unsynced_jobs,
                    (SELECT value FROM settings WHERE key = "last_sync") as last_sync
            ');

            $status = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $status]);
            break;

        default:
            echo json_encode(['success' => false, 'error' => 'Unknown action']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

// HubSpot Verbindung testen
function testHubSpotConnection($apiKey) {
    if (empty($apiKey)) {
        return ['success' => false, 'error' => 'API Key ist leer'];
    }

    // Test mit HubSpot API
    $ch = curl_init('https://api.hubapi.com/crm/v3/objects/contacts?limit=1');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $data = json_decode($response, true);
        return [
            'success' => true,
            'message' => 'Verbindung erfolgreich',
            'portal_info' => $data['portal_id'] ?? null
        ];
    } elseif ($httpCode === 401) {
        return ['success' => false, 'error' => 'Ungültiger API Key'];
    } else {
        return ['success' => false, 'error' => 'Verbindungsfehler (HTTP ' . $httpCode . ')'];
    }
}
?>