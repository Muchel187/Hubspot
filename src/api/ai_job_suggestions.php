<?php
/**
 * API-Endpunkt für KI-basierte Jobvorschläge
 * 
 * Diese API verwendet KI, um passende Jobs für einen Kandidaten vorzuschlagen.
 * 
 * Verwendung:
 * GET /admin/api/ai_job_suggestions.php?candidate_id=123
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
    
    if ($candidateId <= 0) {
        throw new Exception('Ungültige Kandidaten-ID');
    }
    
    // JobMatcher initialisieren
    $jobMatcher = new JobMatcher();
    
    // KI-Jobvorschläge abrufen
    $suggestions = $jobMatcher->getAIJobSuggestions($candidateId);
    
    // Erfolgsantwort
    echo json_encode([
        'success' => true,
        'data' => [
            'candidate_id' => $candidateId,
            'suggestions' => $suggestions
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
