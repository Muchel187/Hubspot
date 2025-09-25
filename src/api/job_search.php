<?php
/**
 * API-Endpunkt für die Jobsuche mit Radius-Filter
 * 
 * Diese API ermöglicht die Suche nach passenden Jobs für einen Kandidaten
 * unter Berücksichtigung eines geografischen Radius.
 * 
 * Verwendung:
 * GET /admin/api/job_search.php?candidate_id=123&radius=50&limit=10
 */

require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../job_matcher.php';

// Nur für authentifizierte Benutzer
require_login();

// CORS-Header für API-Anfragen
header('Content-Type: application/json');

// Fehlerbehandlung
try {
    // Parameter validieren
    $candidateId = isset($_GET['candidate_id']) ? (int)$_GET['candidate_id'] : 0;
    $radius = isset($_GET['radius']) ? (int)$_GET['radius'] : 50;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    
    if ($candidateId <= 0) {
        throw new Exception('Ungültige Kandidaten-ID');
    }
    
    // Radius auf sinnvollen Bereich begrenzen
    $radius = max(1, min(500, $radius));
    $limit = max(1, min(50, $limit));
    
    // JobMatcher initialisieren
    $jobMatcher = new JobMatcher();
    
    // Passende Jobs suchen
    $matchingJobs = $jobMatcher->findMatchingJobs($candidateId, $radius, $limit);
    
    // Erfolgsantwort
    echo json_encode([
        'success' => true,
        'data' => [
            'candidate_id' => $candidateId,
            'radius' => $radius,
            'limit' => $limit,
            'jobs' => $matchingJobs
        ]
    ]);
    
} catch (Exception $e) {
    // Fehlerantwort
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
