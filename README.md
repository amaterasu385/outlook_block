# Outlook Kalender Web-Plattform

🎉 **Neu:** Jetzt mit Next.js und Chakra UI!

Eine moderne Web-Plattform zum Buchen von Terminen und Abwesenheitsmeldungen in Outlook-Kalender über die Microsoft Graph API.

## 🚀 Features

- ✅ **Web-basierte Benutzeroberfläche** - Moderne, responsive Design
- ✅ **Automatische Microsoft-Authentifizierung** - Ein-Klick-Anmeldung
- ✅ **Termin-Erstellung** - Mit Teilnehmern und Teams-Meetings
- ✅ **Abwesenheitsmeldungen** - Urlaub, Krankheit, etc.
- ✅ **Session-Management** - Sichere Benutzersitzungen
- ✅ **Responsive Design** - Funktioniert auf allen Geräten

## 📋 Voraussetzungen

1. **Microsoft Azure App Registration:**
   - Erstellen Sie eine App-Registrierung im Azure Portal
   - Notieren Sie sich die Client ID, Client Secret und Tenant ID
   - Fügen Sie die Berechtigung `Calendars.ReadWrite` hinzu
   - Setzen Sie Redirect URI: `http://localhost:3000/auth/callback`

2. **Node.js:**
   - Node.js Version 14 oder höher installiert

## 🛠️ Installation

1. **Abhängigkeiten installieren:**
```bash
npm install
```

2. **Umgebungsvariablen setzen:**
```bash
# Windows (PowerShell)
$env:CLIENT_ID="your-client-id"
$env:CLIENT_SECRET="your-client-secret"
$env:TENANT_ID="your-tenant-id"

# Linux/Mac
export CLIENT_ID="your-client-id"
export CLIENT_SECRET="your-client-secret"
export TENANT_ID="your-tenant-id"
```

3. **Server starten:**
```bash
npm start
```

4. **Browser öffnen:**
```
http://localhost:3000
```

## 🎯 Verwendung

### **1. Anmeldung**
- Klicken Sie auf "Mit Microsoft anmelden"
- Melden Sie sich mit Ihrem Microsoft-Konto an
- Sie werden automatisch zur Plattform weitergeleitet

### **2. Termin erstellen**
- **Normaler Termin:** Mit Teilnehmern, Uhrzeiten, Teams-Meeting
- **Abwesenheitsmeldung:** Ganztägig, automatisch "Out of Office"

### **3. Funktionen**
- **Dynamische Teilnehmer:** Hinzufügen/Entfernen von Teilnehmern
- **Teams-Integration:** Automatische Meeting-Links
- **Responsive Design:** Funktioniert auf Desktop und Mobile

## 🏗️ Projektstruktur

⚠️ **Neue Architektur:** Next.js Frontend + Express.js Backend

```
Graph_outlook/
├── server.js              # Express.js REST API (Backend)
├── package.json           # Backend Dependencies
├── scrapers/             # Block-Scraping Module
├── services/             # Notification Service
└── frontend/             # Next.js Frontend
    ├── app/              # Next.js Pages (App Router)
    ├── components/       # React Components
    ├── lib/              # API Client & Theme
    └── types/            # TypeScript Types
```

Siehe **[MIGRATION.md](MIGRATION.md)** für Details zur neuen Architektur.

## 🔧 API Endpoints

### Authentifizierung
- `GET /api/auth/session` - Session-Status prüfen
- `GET /api/auth/login-url` - Microsoft Login URL abrufen
- `GET /api/auth/callback` - OAuth Callback
- `POST /api/auth/logout` - Abmelden

### Events & Blöcke
- `POST /api/create-event` - Event erstellen
- `GET /api/blocks/courses` - Kurse abrufen
- `GET /api/blocks/filter` - Blöcke filtern
- `POST /api/import-blocks` - Blöcke importieren

Vollständige API-Dokumentation in **[SETUP.md](SETUP.md)**

## 🎨 Design Features

- **Next.js 16** - React Framework mit App Router
- **Chakra UI** - Moderne, zugängliche UI-Komponenten
- **TypeScript** - Type Safety
- **Glassmorphism** - Moderne Card-Effekte
- **Framer Motion** - Smooth Animations
- **Responsive Design** - Mobile-first
- **Gradient Backgrounds** - Grünes Farbschema
- **Toast Notifications** - Benutzerfreundliche Rückmeldungen

## 🔒 Sicherheit

- **Session-basierte Authentifizierung**
- **Microsoft OAuth 2.0** - Sichere Anmeldung
- **CSRF-Schutz** - Eingebaute Sicherheit
- **Umgebungsvariablen** - Sichere Konfiguration

## 🚀 Deployment

### **Heroku:**
```bash
# Umgebungsvariablen in Heroku setzen
heroku config:set CLIENT_ID="your-client-id"
heroku config:set CLIENT_SECRET="your-client-secret"
heroku config:set TENANT_ID="your-tenant-id"

# Deploy
git push heroku main
```

### **Azure App Service:**
- Konfigurieren Sie die Umgebungsvariablen in den App-Einstellungen
- Setzen Sie die Redirect URI entsprechend an

## 📱 Mobile Support

Die Plattform ist vollständig responsive und funktioniert optimal auf:
- 📱 Smartphones
- 📱 Tablets  
- 💻 Desktop-Computern

## 🆘 Fehlerbehebung

### **Authentifizierungsfehler:**
- Überprüfen Sie Client ID, Client Secret und Tenant ID
- Stellen Sie sicher, dass die Redirect URI korrekt ist
- Überprüfen Sie die App-Berechtigungen

### **API-Fehler:**
- Überprüfen Sie Ihre Internetverbindung
- Stellen Sie sicher, dass die Microsoft Graph API erreichbar ist

## 📚 Dokumentation

- **[SETUP.md](SETUP.md)** - Detaillierte Setup-Anleitung
- **[MIGRATION.md](MIGRATION.md)** - Migration von EJS zu Next.js
- **[TESTING.md](TESTING.md)** - Test-Anleitung
- **[PROJEKT-ZUSAMMENFASSUNG.md](PROJEKT-ZUSAMMENFASSUNG.md)** - Projekt-Übersicht
- **[frontend/README.md](frontend/README.md)** - Frontend-Dokumentation

## 📄 Lizenz

MIT
