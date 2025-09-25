# 🚀 NOBA ATS Dashboard - Deployment Anleitung

## ✅ Was wurde implementiert

1. **HubSpot API Integration**
   - Vollständige API-Anbindung für Contacts, Deals, Companies
   - Sync-Funktionen für Kandidaten und Jobs
   - Pipeline Management

2. **Build-System**
   - Production-optimierter Build mit Vite
   - Komprimierte Assets (54KB gzipped)
   - Optimierte Performance

3. **Sicherheit**
   - .htaccess Passwortschutz
   - Security Headers
   - CORS-Konfiguration für HubSpot

## 📁 Generierte Dateien

```
/admin/ats-dashboard/
├── dist/                        # ← DIESEN ORDNER HOCHLADEN
│   ├── index.html
│   ├── assets/
│   │   ├── index-[hash].css
│   │   └── index-[hash].js
│   ├── .htaccess               # Passwortschutz
│   └── .htpasswd               # Benutzerdaten
├── src/
│   ├── App.jsx                 # Hauptkomponente mit HubSpot Integration
│   └── hubspotAPI.js           # HubSpot API Service
├── .env                        # Ihre API Keys (NICHT hochladen!)
└── .env.example                # Beispiel-Konfiguration
```

## 🔑 HubSpot API einrichten

### 1. HubSpot Private App erstellen:
1. Gehen Sie zu: https://app.hubspot.com/settings/integrations/private-apps
2. Klicken Sie "Create a private app"
3. Name: "NOBA ATS Dashboard"
4. Scopes auswählen:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.objects.companies.read`
   - `crm.objects.companies.write`
   - `crm.objects.deals.read`
   - `crm.objects.deals.write`
5. Access Token kopieren

### 2. Environment Variables konfigurieren:
Bearbeiten Sie die `.env` Datei:
```env
VITE_HUBSPOT_ACCESS_TOKEN=pat-eu1-xxxxx-xxxxx
VITE_API_MODE=live  # Für echte HubSpot-Verbindung
```

### 3. Neu builden mit API Keys:
```bash
cd /home/jbk/HomepageNoba/admin/ats-dashboard
npm run build
```

## 📤 Upload auf Webserver

### Option A: Via FTP/SFTP
```bash
# 1. Verbindung zum Server
sftp user@ihre-domain.de

# 2. Navigieren zum Admin-Bereich
cd /var/www/html/admin/

# 3. Neuen Ordner erstellen
mkdir ats

# 4. Lokalen dist-Ordner hochladen
put -r /home/jbk/HomepageNoba/admin/ats-dashboard/dist/* ats/
```

### Option B: Via SCP
```bash
scp -r /home/jbk/HomepageNoba/admin/ats-dashboard/dist/* user@ihre-domain.de:/var/www/html/admin/ats/
```

### Option C: Via ZIP
```bash
# 1. ZIP erstellen
cd /home/jbk/HomepageNoba/admin/ats-dashboard
zip -r ats-dashboard.zip dist/*

# 2. ZIP hochladen und auf Server entpacken
```

## 🔒 Passwortschutz anpassen

### Aktueller Standard-Login:
- **Benutzername:** admin
- **Passwort:** noba2024admin

### Passwort ändern:
```bash
# Auf dem Server:
htpasswd -b /pfad/zu/ats/.htpasswd admin neuesPasswort

# Oder neuen Benutzer hinzufügen:
htpasswd -b /pfad/zu/ats/.htpasswd neuerUser neuesPasswort
```

### .htaccess Pfad anpassen:
Bearbeiten Sie die `.htaccess` Datei auf dem Server:
```apache
AuthUserFile /absoluter/pfad/zu/ihrem/ats/.htpasswd
```

## 🌐 Zugriff & URLs

Nach dem Upload erreichen Sie das Dashboard unter:
```
https://ihre-domain.de/admin/ats/
```

Mit Passwortschutz werden Sie nach Login-Daten gefragt.

## ⚙️ HubSpot Features aktivieren

1. **Mock-Modus (Standard):**
   - Arbeitet mit lokalen Mock-Daten
   - Kein HubSpot-Sync Button sichtbar
   - Gut zum Testen

2. **Live-Modus:**
   - Setzen Sie in `.env`: `VITE_API_MODE=live`
   - Fügen Sie Ihren HubSpot Access Token ein
   - Neu builden: `npm run build`
   - HubSpot-Sync Button erscheint in der UI

## 🔧 Troubleshooting

### Problem: 500 Internal Server Error
- Prüfen Sie den .htaccess Pfad
- Stellen Sie sicher, dass mod_auth_basic aktiviert ist

### Problem: HubSpot API funktioniert nicht
- Prüfen Sie den Access Token
- Überprüfen Sie die CORS-Einstellungen
- Schauen Sie in die Browser-Konsole (F12)

### Problem: Passwortschutz funktioniert nicht
```bash
# Absolute Pfade verwenden:
AuthUserFile /var/www/html/admin/ats/.htpasswd

# Permissions prüfen:
chmod 644 .htaccess
chmod 644 .htpasswd
```

## 📊 Monitoring

Browser-Konsole öffnen (F12) für:
- HubSpot API Calls: `[HubSpot Sync]`
- Fehler: `[HubSpot API Error]`
- CV-Upload: `[AI Integration]`

## 🎯 Nächste Schritte

1. **HubSpot Private App erstellen**
2. **Access Token in .env eintragen**
3. **Neu builden mit `npm run build`**
4. **dist/ Ordner auf Server hochladen**
5. **.htaccess Pfade anpassen**
6. **Testen unter: https://ihre-domain.de/admin/ats/**

## 📞 Support

Bei Fragen zur HubSpot Integration:
- HubSpot Docs: https://developers.hubspot.com/docs/api/crm/contacts
- API Status: https://status.hubspot.com/

---

**Wichtig:** Committen Sie niemals die `.env` Datei mit echten API Keys!