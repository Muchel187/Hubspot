<?php
/**
 * API für den Zugriff auf interaktive Jobs und Kandidatenprofile
 */

// Konfiguration und Datenbankverbindung laden
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

// CORS-Header setzen
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

// Verbindung zur Datenbank herstellen
try {
    $pdo = db();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Datenbankfehler: ' . $e->getMessage()]);
    exit;
}

// Parameter auslesen
$type = isset($_GET['type']) ? $_GET['type'] : '';
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

// Antwort vorbereiten
$response = [];

// Anfrage verarbeiten
if ($type === 'job' && $id > 0) {
    // Einzelnen Job abrufen
    $stmt = $pdo->prepare('SELECT id, title, location, type, interactive_filename FROM jobs WHERE id = ? AND interactive_filename IS NOT NULL');
    $stmt->execute([$id]);
    $job = $stmt->fetch();
    
    if ($job && file_exists(__DIR__ . '/../generated/jobs/' . $job['interactive_filename'])) {
        $response = [
            'id' => $job['id'],
            'title' => $job['title'],
            'location' => $job['location'],
            'type' => $job['type'],
            'url' => '/admin/generated/jobs/' . $job['interactive_filename']
        ];
    } else {
        http_response_code(404);
        $response = ['error' => 'Job nicht gefunden oder kein interaktiver Job verfügbar.'];
    }
} elseif ($type === 'jobs') {
    // Alle interaktiven Jobs abrufen
    $stmt = $pdo->query('SELECT id, title, location, type, interactive_filename FROM jobs WHERE interactive_filename IS NOT NULL ORDER BY created_at DESC');
    $jobs = $stmt->fetchAll();
    
    $response = [];
    foreach ($jobs as $job) {
        if (file_exists(__DIR__ . '/../generated/jobs/' . $job['interactive_filename'])) {
            $response[] = [
                'id' => $job['id'],
                'title' => $job['title'],
                'location' => $job['location'],
                'type' => $job['type'],
                'url' => '/admin/generated/jobs/' . $job['interactive_filename']
            ];
        }
    }
} elseif ($type === 'candidate' && $id > 0) {
    // Einzelnen Kandidaten abrufen
    $stmt = $pdo->prepare('SELECT id, name, skills, interactive_filename FROM candidates WHERE id = ? AND interactive_filename IS NOT NULL');
    $stmt->execute([$id]);
    $candidate = $stmt->fetch();
    
    if ($candidate && file_exists(__DIR__ . '/../generated/profiles/' . $candidate['interactive_filename'])) {
        $response = [
            'id' => $candidate['id'],
            'name' => $candidate['name'],
            'skills' => $candidate['skills'],
            'url' => '/admin/generated/profiles/' . $candidate['interactive_filename']
        ];
    } else {
        http_response_code(404);
        $response = ['error' => 'Kandidat nicht gefunden oder kein interaktives Profil verfügbar.'];
    }
} elseif ($type === 'candidates') {
    // Alle interaktiven Kandidatenprofile abrufen
    $stmt = $pdo->query('SELECT id, name, skills, interactive_filename FROM candidates WHERE interactive_filename IS NOT NULL ORDER BY created_at DESC');
    $candidates = $stmt->fetchAll();
    
    $response = [];
    foreach ($candidates as $candidate) {
        if (file_exists(__DIR__ . '/../generated/profiles/' . $candidate['interactive_filename'])) {
            $response[] = [
                'id' => $candidate['id'],
                'name' => $candidate['name'],
                'skills' => $candidate['skills'],
                'url' => '/admin/generated/profiles/' . $candidate['interactive_filename']
            ];
        }
    }
} else {
    http_response_code(400);
    $response = ['error' => 'Ungültiger Anfrageparameter. Verwenden Sie type=jobs, type=job&id=X, type=candidates oder type=candidate&id=X.'];
}

// Antwort senden
echo json_encode($response);
?>
