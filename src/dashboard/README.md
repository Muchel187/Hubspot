# NOBA ATS Dashboard

Ein modernes, vollständiges Applicant Tracking System (ATS) für die Personalvermittlung NOBA Experts.

## Features

- **Dashboard**: Übersicht mit wichtigen Metriken und Aktivitäten
- **Kandidatenverwaltung**: Vollständige Kandidatendatenbank mit Profilen
- **Jobverwaltung**: Verwaltung offener Stellen
- **Pipeline/Kanban Board**: Drag-and-Drop Interface für Bewerbungsprozesse
- **AI Integration**: CV-Upload mit automatischer Datenextraktion (Simulation)

## Tech Stack

- **React 18** - UI Framework
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Heroicons** - Icons

## Installation & Start

```bash
# 1. In das Projektverzeichnis wechseln
cd /home/jbk/HomepageNoba/admin/ats-dashboard

# 2. Dependencies installieren
npm install

# 3. Entwicklungsserver starten
npm run dev
```

Die Anwendung läuft dann unter: http://localhost:5173

## Projekt-Struktur

```
ats-dashboard/
├── src/
│   ├── App.jsx        # Haupt-Komponente mit allen Views
│   ├── main.jsx       # React Entry Point
│   └── index.css      # Tailwind CSS und Custom Styles
├── index.html         # HTML Template
├── package.json       # Dependencies
├── vite.config.js     # Vite Konfiguration
├── tailwind.config.js # Tailwind Konfiguration
└── postcss.config.js  # PostCSS Konfiguration
```

## Funktionen im Detail

### Dashboard
- Willkommensbereich mit Statistik-Karten
- Quick Actions für neue Kandidaten/Jobs
- Activity Feed mit letzten Aktivitäten

### Kandidaten-Datenbank
- Tabellenansicht aller Kandidaten
- Status-Badges (Verfügbar, In Prozess, Vermittelt, Inaktiv)
- Detaillierte Profilansicht mit Tabs
- CV-Upload mit KI-Simulation

### Job-Verwaltung
- Übersicht aller offenen Stellen
- Status-Tracking (Offen, Besetzt, Archiviert)
- Direkte Pipeline-Verlinkung

### Pipeline (Kanban Board)
- Drag-and-Drop zwischen Phasen
- Phasen: Neue Bewerber → Screening → Interview → Angebot → Eingestellt → Abgelehnt
- Echtzeit-Updates der Kandidatenposition
- Statistiken pro Job

### KI-Features (Simulation)
- CV-Upload erkennt automatisch Kandidatendaten
- Pre-filling von Formularen
- Console-Logging der extrahierten Daten

## Mock-Daten

Die Anwendung enthält umfangreiche Mock-Daten:
- 8 Beispiel-Kandidaten
- 5 Beispiel-Jobs
- Vorgefüllte Pipeline für Demo-Zwecke

## Entwicklung

```bash
# Build für Produktion
npm run build

# Preview des Production Builds
npm run preview
```

## Anpassungen

### Farben ändern
Die Farbpalette kann in `tailwind.config.js` angepasst werden.

### Mock-Daten erweitern
Mock-Daten befinden sich direkt in `App.jsx` am Anfang der Datei.

## Browser-Kompatibilität

- Chrome/Edge (empfohlen)
- Firefox
- Safari

## Lizenz

Proprietär - NOBA Experts GmbH