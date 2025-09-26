# 🚀 NOBA ATS Dashboard + HubSpot OAuth Integration

Ein vollständiges Applicant Tracking System (ATS) mit React Dashboard und HubSpot OAuth 2.0 Integration für NOBA Experts GmbH.

## 📋 Features

### Dashboard Features
- 📊 **Übersichtliches Dashboard** mit Statistiken und Aktivitäten
- 👥 **Kandidatenverwaltung** mit vollständiger CRUD-Funktionalität
- 💼 **Job-Management** mit Status-Tracking
- 📌 **Drag & Drop Pipeline** (Kanban Board) für Bewerbungsprozesse
- 🔗 **HubSpot Integration** mit Live-Sync
- ⚙️ **Settings-Seite** zur API-Key Konfiguration
- 📤 **CV-Upload** mit KI-gestützter Datenextraktion (Mock)

### HubSpot OAuth 2.0 Integration
- ✅ OAuth 2.0 Authentication Flow
- ✅ Automatische Token-Refresh
- ✅ Sync von Kandidaten als HubSpot Contacts
- ✅ Sync von Jobs als HubSpot Deals
- ✅ Webhook-Support für Echtzeit-Updates
- ✅ Pipeline-Management
- ✅ Multi-Portal Support

## 🏗️ Projektstruktur

```
.
├── hsproject.json          # ⚠️ WICHTIG: HubSpot Projektkonfiguration
├── app.json               # App-Metadaten für HubSpot
├── hubspot.config.js      # HubSpot Build-Konfiguration
├── src/
│   ├── index.js           # Backend Express Server mit OAuth
│   ├── auth/
│   │   └── oauth.js       # OAuth 2.0 Flow Implementation
│   ├── api/               # PHP Backend APIs
│   │   ├── ats-api.php
│   │   ├── settings-simple.php
│   │   └── ...
│   └── dashboard/         # React Frontend
│       ├── src/
│       │   ├── App.jsx    # Haupt React Komponente
│       │   ├── HubSpotOAuth.jsx  # OAuth UI Komponente
│       │   ├── HubSpotAuth.jsx   # Auth Status Komponente
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
# OAuth 2.0 Configuration
HUBSPOT_CLIENT_ID=1f511560-e8a1-4e5f-a192-5e960797f9ea
HUBSPOT_CLIENT_SECRET=your-client-secret-here
HUBSPOT_REDIRECT_URI=http://localhost:3000/auth/callback
PORT=3000
DASHBOARD_URL=http://localhost:5173
```

### 4. Development Server starten
```bash
# Startet Backend & Frontend gleichzeitig
npm run dev
```

- Backend API: http://localhost:3000
- React Dashboard: http://localhost:5173

## 🔑 HubSpot OAuth Setup

### 1. Public App erstellen (für OAuth)
1. Gehen Sie zu: https://developers.hubspot.com/
2. Create an app → "NOBA ATS Integration"
3. App ID: `1f511560-e8a1-4e5f-a192-5e960797f9ea`

### 2. OAuth Konfiguration
1. Auth → OAuth
2. Redirect URL hinzufügen: `http://localhost:3000/auth/callback`
3. Install URL: `http://localhost:3000/auth/connect`

### 3. Erforderliche Scopes
- `crm.objects.contacts.read`
- `crm.objects.contacts.write`
- `crm.objects.companies.read`
- `crm.objects.companies.write`
- `crm.objects.deals.read`
- `crm.objects.deals.write`
- `oauth`

### 4. Client Secret kopieren
Kopieren Sie das Client Secret und fügen Sie es in die `.env` Datei ein

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

### HubSpot OAuth Verbindung
1. Gehen Sie zu "Einstellungen"
2. Klicken Sie auf "Mit HubSpot verbinden"
3. Autorisieren Sie die App in HubSpot
4. Sie werden zurück zum Dashboard geleitet
5. Die Verbindung ist hergestellt!
6. Tokens werden automatisch verwaltet und erneuert

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

### OAuth Endpoints
- `GET /auth/connect` - OAuth Flow starten
- `GET /auth/callback` - OAuth Callback Handler
- `GET /auth/status` - Auth Status prüfen
- `POST /auth/refresh` - Token erneuern
- `POST /auth/disconnect` - Verbindung trennen

### Backend APIs (Express)
- `GET /api/contacts` - HubSpot Kontakte abrufen (OAuth)
- `POST /api/contacts` - Neuen Kontakt erstellen (OAuth)
- `GET /api/deals` - HubSpot Deals abrufen (OAuth)
- `POST /api/deals` - Neues Deal erstellen (OAuth)
- `POST /api/webhook` - HubSpot Webhook Empfänger

### PHP APIs (für lokale Datenbank)
- `/src/api/ats-api.php` - Kandidaten & Jobs CRUD
- `/src/api/settings-simple.php` - Settings Management

## 🔐 Sicherheit

- Verwenden Sie NIEMALS API Keys im Frontend Code
- Alle API Keys gehören in `.env` Dateien
- `.env` Dateien niemals committen

## 🐛 Troubleshooting

### HubSpot OAuth Verbindung schlägt fehl
- Prüfen Sie das Client Secret in `.env`
- Stellen Sie sicher, dass die Redirect URL korrekt ist
- Überprüfen Sie die Scopes in der HubSpot App
- Backend Server muss auf Port 3000 laufen

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