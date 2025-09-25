# 🚀 NOBA ATS Dashboard + HubSpot Integration

Ein vollständiges Applicant Tracking System (ATS) mit React Dashboard und HubSpot CRM Integration für NOBA Experts GmbH.

## 📋 Features

### Dashboard Features
- 📊 **Übersichtliches Dashboard** mit Statistiken und Aktivitäten
- 👥 **Kandidatenverwaltung** mit vollständiger CRUD-Funktionalität
- 💼 **Job-Management** mit Status-Tracking
- 📌 **Drag & Drop Pipeline** (Kanban Board) für Bewerbungsprozesse
- 🔗 **HubSpot Integration** mit Live-Sync
- ⚙️ **Settings-Seite** zur API-Key Konfiguration
- 📤 **CV-Upload** mit KI-gestützter Datenextraktion (Mock)

### HubSpot Integration
- Sync von Kandidaten als HubSpot Contacts
- Sync von Jobs als HubSpot Deals
- Webhook-Support für Echtzeit-Updates
- Pipeline-Management

## 🏗️ Projektstruktur

```
.
├── hsproject.json          # ⚠️ WICHTIG: HubSpot Projektkonfiguration
├── src/
│   ├── index.js           # Backend Express Server
│   ├── api/               # PHP Backend APIs
│   │   ├── ats-api.php
│   │   ├── settings-simple.php
│   │   └── ...
│   └── dashboard/         # React Frontend
│       ├── src/
│       │   ├── App.jsx    # Haupt React Komponente
│       │   ├── hubspotAPI.js
│       │   └── ...
│       ├── package.json
│       └── vite.config.js
├── package.json
└── README.md
```

## 🚀 Installation & Setup

### 1. Repository klonen
```bash
git clone https://github.com/Muchel187/Hubspot.git
cd Hubspot
```

### 2. Dependencies installieren
```bash
# Hauptprojekt und Dashboard
npm run install:all
```

### 3. Umgebungsvariablen konfigurieren
```bash
cp .env.example .env
```

Bearbeiten Sie `.env`:
```env
HUBSPOT_API_KEY=pat-eu1-xxxxx-xxxxx
PORT=3000
```

### 4. Development Server starten
```bash
# Startet Backend & Frontend gleichzeitig
npm run dev
```

- Backend API: http://localhost:3000
- React Dashboard: http://localhost:5173

## 🔑 HubSpot Setup

### 1. Private App erstellen
1. Gehen Sie zu: https://app.hubspot.com/
2. Settings → Integrations → Private Apps
3. "Create a private app"
4. Name: "NOBA ATS Integration"

### 2. Erforderliche Scopes
- `crm.objects.contacts.read`
- `crm.objects.contacts.write`
- `crm.objects.companies.read`
- `crm.objects.companies.write`
- `crm.objects.deals.read`
- `crm.objects.deals.write`

### 3. Access Token kopieren
Kopieren Sie den Token (beginnt mit `pat-`) und fügen Sie ihn in:
1. `.env` Datei
2. Dashboard Settings-Seite

## 📱 Dashboard Verwendung

### Kandidaten verwalten
1. Navigieren Sie zu "Kandidaten"
2. Klicken Sie auf "+ Neuen Kandidaten anlegen"
3. Laden Sie einen CV hoch (Mock-Datenextraktion)
4. Speichern und mit HubSpot synchronisieren

### Jobs & Pipeline
1. Erstellen Sie Jobs unter "Jobs"
2. Öffnen Sie die Pipeline-Ansicht
3. Ziehen Sie Kandidaten zwischen den Phasen:
   - Neue Bewerber
   - Screening
   - Interview
   - Angebot
   - Eingestellt
   - Abgelehnt

### HubSpot Sync
1. Gehen Sie zu "Einstellungen"
2. Geben Sie Ihren HubSpot API Key ein
3. Testen Sie die Verbindung
4. Aktivieren Sie "HubSpot Sync"
5. Der Sync-Button erscheint bei Kandidaten

## 🛠️ Build für Production

```bash
# Dashboard builden
npm run build

# Komplettes Build
npm run build:all
```

Die gebauten Dateien befinden sich in:
- `src/dashboard/dist/` - React App

## 📡 API Endpoints

### Backend APIs (Express)
- `GET /api/contacts` - HubSpot Kontakte abrufen
- `POST /api/contacts` - Neuen Kontakt erstellen
- `GET /api/deals` - HubSpot Deals abrufen
- `POST /api/deals` - Neues Deal erstellen
- `POST /api/webhook` - HubSpot Webhook Empfänger

### PHP APIs (für lokale Datenbank)
- `/src/api/ats-api.php` - Kandidaten & Jobs CRUD
- `/src/api/settings-simple.php` - Settings Management

## 🔐 Sicherheit

- Verwenden Sie NIEMALS API Keys im Frontend Code
- Alle API Keys gehören in `.env` Dateien
- `.env` Dateien niemals committen

## 🐛 Troubleshooting

### HubSpot Verbindung schlägt fehl
- Prüfen Sie, ob der API Key mit `pat-` beginnt
- Stellen Sie sicher, dass die Private App aktiv ist
- Überprüfen Sie die Scopes

### Dashboard lädt nicht
```bash
cd src/dashboard
npm install
npm run dev
```

### CORS Fehler
Backend Server muss auf Port 3000 laufen:
```bash
npm run dev:server
```

## 📝 Lizenz

MIT - NOBA Experts GmbH 2024

## 📞 Support

Bei Fragen wenden Sie sich an:
- Email: Jurak.Bahrambaek@noba-experts.de
- Tel: +49-211-975 324 74

---

**Entwickelt mit ❤️ für NOBA Experts GmbH**