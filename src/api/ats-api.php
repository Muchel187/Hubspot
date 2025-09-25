<?php
/**
 * ATS Dashboard API Endpoint
 * Verbindet React Dashboard mit der existierenden NOBA SQLite Datenbank
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Datenbankverbindung
require_once '../db.php';
$pdo = db();

// Router
$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['endpoint'] ?? '';

try {
    switch ($path) {
        // ==================== KANDIDATEN ====================
        case 'candidates':
            if ($method === 'GET') {
                // Alle Kandidaten abrufen
                $stmt = $pdo->query('SELECT * FROM candidates ORDER BY created_at DESC');
                $candidates = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Format für React App anpassen
                $formatted = array_map(function($c) {
                    return [
                        'id' => $c['id'],
                        'name' => $c['name'],
                        'email' => $c['email'] ?? '',
                        'phone' => $c['phone'] ?? '',
                        'location' => $c['location'] ?? '',
                        'primarySkill' => $c['primary_skill'] ?? '',
                        'skills' => explode(',', $c['skills'] ?? ''),
                        'status' => $c['status'] ?? 'available',
                        'addedAt' => $c['created_at'],
                        'avatar' => strtoupper(substr($c['name'], 0, 1) . substr(explode(' ', $c['name'])[1] ?? '', 0, 1)),
                        'notes' => $c['notes'] ?? '',
                        'cv_path' => $c['cv_path'] ?? null,
                        'hubspot_id' => $c['hubspot_id'] ?? null
                    ];
                }, $candidates);

                echo json_encode(['success' => true, 'data' => $formatted]);
            }
            elseif ($method === 'POST') {
                // Neuen Kandidaten erstellen
                $data = json_decode(file_get_contents('php://input'), true);

                $stmt = $pdo->prepare('
                    INSERT INTO candidates (name, email, phone, location, primary_skill, skills, status, notes, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))
                ');

                $stmt->execute([
                    $data['name'],
                    $data['email'] ?? '',
                    $data['phone'] ?? '',
                    $data['location'] ?? '',
                    $data['primarySkill'] ?? '',
                    is_array($data['skills']) ? implode(',', $data['skills']) : ($data['skills'] ?? ''),
                    $data['status'] ?? 'available',
                    $data['notes'] ?? ''
                ]);

                $id = $pdo->lastInsertId();

                // Optional: Sync mit HubSpot
                if (!empty($data['syncToHubspot']) && !empty($_ENV['HUBSPOT_TOKEN'])) {
                    syncCandidateToHubspot($data);
                }

                echo json_encode(['success' => true, 'id' => $id]);
            }
            elseif ($method === 'PUT') {
                // Kandidat aktualisieren
                $data = json_decode(file_get_contents('php://input'), true);
                $id = $data['id'];

                $stmt = $pdo->prepare('
                    UPDATE candidates
                    SET name = ?, email = ?, phone = ?, location = ?,
                        primary_skill = ?, skills = ?, status = ?, notes = ?
                    WHERE id = ?
                ');

                $stmt->execute([
                    $data['name'],
                    $data['email'],
                    $data['phone'],
                    $data['location'],
                    $data['primarySkill'],
                    is_array($data['skills']) ? implode(',', $data['skills']) : $data['skills'],
                    $data['status'],
                    $data['notes'],
                    $id
                ]);

                echo json_encode(['success' => true]);
            }
            elseif ($method === 'DELETE') {
                // Kandidat löschen
                $id = $_GET['id'];
                $stmt = $pdo->prepare('DELETE FROM candidates WHERE id = ?');
                $stmt->execute([$id]);
                echo json_encode(['success' => true]);
            }
            break;

        // ==================== JOBS ====================
        case 'jobs':
            if ($method === 'GET') {
                $stmt = $pdo->query('SELECT * FROM jobs ORDER BY created_at DESC');
                $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $formatted = array_map(function($j) {
                    return [
                        'id' => $j['id'],
                        'title' => $j['title'],
                        'company' => $j['company'] ?? 'NOBA Experts',
                        'location' => $j['location'] ?? '',
                        'status' => $j['status'] ?? 'open',
                        'description' => $j['description'] ?? '',
                        'requirements' => $j['requirements'] ?? '',
                        'salary' => $j['salary'] ?? '',
                        'createdAt' => $j['created_at'],
                        'hubspot_id' => $j['hubspot_id'] ?? null
                    ];
                }, $jobs);

                echo json_encode(['success' => true, 'data' => $formatted]);
            }
            elseif ($method === 'POST') {
                $data = json_decode(file_get_contents('php://input'), true);

                $stmt = $pdo->prepare('
                    INSERT INTO jobs (title, company, location, status, description, requirements, salary, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))
                ');

                $stmt->execute([
                    $data['title'],
                    $data['company'] ?? 'NOBA Experts',
                    $data['location'] ?? '',
                    $data['status'] ?? 'open',
                    $data['description'] ?? '',
                    $data['requirements'] ?? '',
                    $data['salary'] ?? null
                ]);

                echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            }
            break;

        // ==================== PIPELINE ====================
        case 'pipeline':
            if ($method === 'GET') {
                // Pipeline für einen bestimmten Job abrufen
                $jobId = $_GET['job_id'];

                // Hier würden Sie eine pipeline_stages Tabelle benötigen
                // Für jetzt geben wir Mock-Daten zurück
                $pipeline = [
                    'Neue Bewerber' => [],
                    'Screening' => [],
                    'Interview' => [],
                    'Angebot' => [],
                    'Eingestellt' => [],
                    'Abgelehnt' => []
                ];

                echo json_encode(['success' => true, 'data' => $pipeline]);
            }
            elseif ($method === 'POST') {
                // Kandidat in Pipeline Stage verschieben
                $data = json_decode(file_get_contents('php://input'), true);

                // Hier würde die Pipeline-Logik implementiert
                // Speichern in pipeline_stages Tabelle

                echo json_encode(['success' => true]);
            }
            break;

        // ==================== ACTIVITIES ====================
        case 'activities':
            if ($method === 'GET') {
                // Letzte Aktivitäten abrufen (aus einer activities Tabelle)
                $activities = [
                    ['id' => 1, 'text' => 'Neuer Kandidat hinzugefügt', 'time' => 'vor 1 Stunde'],
                    ['id' => 2, 'text' => 'Job Status geändert', 'time' => 'vor 2 Stunden']
                ];

                echo json_encode(['success' => true, 'data' => $activities]);
            }
            break;

        // ==================== CV UPLOAD ====================
        case 'upload-cv':
            if ($method === 'POST') {
                if (isset($_FILES['cv'])) {
                    $uploadDir = '../uploads/cvs/';
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0777, true);
                    }

                    $fileName = time() . '_' . basename($_FILES['cv']['name']);
                    $uploadPath = $uploadDir . $fileName;

                    if (move_uploaded_file($_FILES['cv']['tmp_name'], $uploadPath)) {
                        // Hier könnte CV-Parsing mit AI stattfinden
                        // Z.B. mit OpenAI API oder lokal mit PDF-Parser

                        echo json_encode([
                            'success' => true,
                            'path' => $uploadPath,
                            'extracted' => [
                                'name' => 'Extrahierter Name',
                                'email' => 'email@example.com',
                                'skills' => ['PHP', 'MySQL', 'React']
                            ]
                        ]);
                    }
                }
            }
            break;

        // ==================== STATISTICS ====================
        case 'stats':
            if ($method === 'GET') {
                $stats = [
                    'totalCandidates' => $pdo->query('SELECT COUNT(*) FROM candidates')->fetchColumn(),
                    'openJobs' => $pdo->query('SELECT COUNT(*) FROM jobs WHERE status = "open"')->fetchColumn(),
                    'inInterviews' => 8, // Würde aus pipeline_stages Tabelle kommen
                    'placementsThisQuarter' => 4
                ];

                echo json_encode(['success' => true, 'data' => $stats]);
            }
            break;

        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

// Hilfsfunktion für HubSpot Sync (optional)
function syncCandidateToHubspot($candidate) {
    $token = $_ENV['HUBSPOT_TOKEN'] ?? '';
    if (empty($token)) return;

    $data = [
        'properties' => [
            'firstname' => explode(' ', $candidate['name'])[0] ?? '',
            'lastname' => explode(' ', $candidate['name'])[1] ?? '',
            'email' => $candidate['email'],
            'phone' => $candidate['phone'],
            'jobtitle' => $candidate['primarySkill']
        ]
    ];

    $ch = curl_init('https://api.hubapi.com/crm/v3/objects/contacts');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Content-Type: application/json'
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}
?>