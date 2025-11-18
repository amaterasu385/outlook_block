const express = require('express');
const axios = require('axios');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs');
const ITechBlockParser = require('./scrapers/itechBlockParser');
const BlockScraperManager = require('./scrapers/blockScraperManager');
const NotificationService = require('./services/notificationService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

// Dynamisches SESSION_SECRET generieren
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// Konfiguration
const CLIENT_ID = process.env.CLIENT_ID || 'your-client-id';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'your-client-secret';
const TENANT_ID = process.env.TENANT_ID || 'your-tenant-id';
const REDIRECT_URI = `http://localhost:${PORT}/auth/callback`;

// Middleware
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Multer für File Uploads konfigurieren
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        cb(null, `blockplan-${timestamp}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Nur PDF-Dateien sind erlaubt'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB Limit
    }
});

// Initialisiere Services
const scraperManager = new BlockScraperManager();
const notificationService = new NotificationService();

// Starte Benachrichtigungsservice
notificationService.startMonitoring();

// Microsoft Graph API Helper
class GraphAPI {
    static async getAccessToken(authCode) {
        try {
            const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

            const params = new URLSearchParams();
            params.append('client_id', CLIENT_ID);
            params.append('client_secret', CLIENT_SECRET);
            params.append('code', authCode);
            params.append('redirect_uri', REDIRECT_URI);
            params.append('grant_type', 'authorization_code');

            const response = await axios.post(tokenUrl, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return response.data.access_token;
        } catch (error) {
            throw new Error(`Authentifizierung fehlgeschlagen: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    static async createEvent(accessToken, eventData) {
        try {
            const response = await axios.post(
                'https://graph.microsoft.com/v1.0/me/events',
                eventData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(`Fehler beim Erstellen des Termins: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    static async getUserInfo(accessToken) {
        try {
            const response = await axios.get(
                'https://graph.microsoft.com/v1.0/me',
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(`Fehler beim Abrufen der Benutzerinformationen: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    static async listEvents(accessToken, startDateTimeISO, endDateTimeISO) {
        try {
            const url = `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${encodeURIComponent(startDateTimeISO)}&endDateTime=${encodeURIComponent(endDateTimeISO)}`;
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Prefer': 'outlook.timezone="Europe/Berlin"'
                }
            });
            return response.data.value || [];
        } catch (error) {
            throw new Error(`Fehler beim Abrufen der Kalenderansicht: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    static async eventExists(accessToken, subject, startDate, endDate) {
        // Nutze ganztägigen Bereich (00:00 bis 00:00 des Folgetages) zur Suche
        const startISO = `${startDate}T00:00:00`;
        const endExclusive = new Date(endDate);
        endExclusive.setDate(endExclusive.getDate() + 1);
        const endISO = `${endExclusive.toISOString().slice(0, 10)}T00:00:00`;
        const events = await this.listEvents(accessToken, startISO, endISO);

        return events.some(evt => {
            const evtSubject = (evt.subject || '').trim();
            const isAllDay = !!evt.isAllDay;
            const showAs = evt.showAs || '';
            const evtStart = (evt.start?.dateTime || '').slice(0, 19);
            const evtEnd = (evt.end?.dateTime || '').slice(0, 19);
            const expectedStart = `${startDate}T00:00:00`;
            const expectedEnd = `${endExclusive.toISOString().slice(0, 10)}T00:00:00`;

            return evtSubject === subject && isAllDay && (showAs === 'oof') && evtStart === expectedStart && evtEnd === expectedEnd;
        });
    }
}

// API Routen
// Auth Status prüfen
app.get('/api/auth/session', (req, res) => {
    if (req.session.accessToken) {
        res.json({
            authenticated: true,
            user: req.session.user
        });
    } else {
        res.json({
            authenticated: false
        });
    }
});

// Microsoft Authentifizierung URL generieren
app.get('/api/auth/login-url', (req, res) => {
    const authUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?` +
        `client_id=${CLIENT_ID}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `scope=Calendars.ReadWrite&` +
        `response_mode=query`;

    res.json({ authUrl });
});

// Microsoft Authentifizierung Callback (ohne /api für Azure-Kompatibilität)
app.get('/auth/callback', async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.redirect(`${FRONTEND_URL}?error=Autorisierungscode nicht gefunden`);
        }

        const accessToken = await GraphAPI.getAccessToken(code);

        // Benutzerinformationen über Graph API abrufen
        const userInfo = await GraphAPI.getUserInfo(accessToken);

        // Token und Benutzerinfo in Session speichern
        req.session.accessToken = accessToken;
        req.session.user = {
            name: userInfo.displayName || userInfo.userPrincipalName || 'Benutzer',
            email: userInfo.mail || userInfo.userPrincipalName
        };

        // Redirect zum Frontend Dashboard
        res.redirect(`${FRONTEND_URL}/dashboard`);
    } catch (error) {
        res.redirect(`${FRONTEND_URL}?error=${encodeURIComponent(error.message)}`);
    }
});

// Termin erstellen
app.post('/api/create-event', async (req, res) => {
    try {
        if (!req.session.accessToken) {
            return res.status(401).json({ error: 'Nicht authentifiziert' });
        }

        const { subject, description, startDate, startTime, endDate, endTime, eventType, attendees, isOnlineMeeting } = req.body;

        let eventData;

        // Abwesenheitsmeldung
        if (eventType === 'absence') {
            // Enddatum exklusiv (Graph-Anforderung: mindestens 24h)
            const endExclusive = new Date(endDate);
            endExclusive.setDate(endExclusive.getDate() + 1);

            eventData = {
                subject: subject,
                body: {
                    contentType: 'HTML',
                    content: description || ''
                },
                start: {
                    dateTime: `${startDate}T00:00:00`,
                    timeZone: 'Europe/Berlin'
                },
                end: {
                    dateTime: `${endExclusive.toISOString().slice(0, 10)}T00:00:00`,
                    timeZone: 'Europe/Berlin'
                },
                isAllDay: true,
                showAs: 'oof'
            };
        } else {
            // Normaler Termin
            eventData = {
                subject: subject,
                body: {
                    contentType: 'HTML',
                    content: description
                },
                start: {
                    dateTime: `${startDate}T${startTime}:00`,
                    timeZone: 'Europe/Berlin'
                },
                end: {
                    dateTime: `${endDate}T${endTime}:00`,
                    timeZone: 'Europe/Berlin'
                }
            };
            if (attendees && attendees.length > 0) {
                eventData.attendees = attendees.map(email => ({
                    emailAddress: {
                        address: email,
                        name: email
                    },
                    type: 'required'
                }));
            }

            if (isOnlineMeeting === 'true') {
                eventData.isOnlineMeeting = true;
                eventData.onlineMeetingProvider = 'teamsForBusiness';
            }
        }

        // Duplikat-Prüfung für Abwesenheiten (optional auch für Meetings mit ganztägig)
        if (eventType === 'absence') {
            const startIncl = eventData.start.dateTime.slice(0, 10);
            // eventData.end ist exklusiv → inklusives Ende = -1 Tag
            const endExclusive = new Date(eventData.end.dateTime.slice(0, 10));
            endExclusive.setDate(endExclusive.getDate() - 1);
            const endIncl = endExclusive.toISOString().slice(0, 10);

            const exists = await GraphAPI.eventExists(req.session.accessToken, eventData.subject, startIncl, endIncl);
            if (exists) {
                return res.json({ success: true, event: { subject: eventData.subject, start: eventData.start.dateTime, end: eventData.end.dateTime, duplicate: true } });
            }
        }

        const createdEvent = await GraphAPI.createEvent(req.session.accessToken, eventData);

        res.json({
            success: true,
            event: {
                id: createdEvent.id,
                subject: createdEvent.subject,
                start: createdEvent.start.dateTime,
                end: createdEvent.end.dateTime,
                onlineMeeting: createdEvent.onlineMeeting
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ITECH Blockplanung scrapen (mit Manager)
app.get('/api/scrape-blocks', async (req, res) => {
    try {
        if (!req.session.accessToken) {
            return res.status(401).json({ error: 'Nicht authentifiziert' });
        }

        const result = await scraperManager.scrapeBlocks({
            preferredStrategy: 'static',
            fallback: true
        });

        res.json({
            success: true,
            message: `${result.blocks.length} Blöcke erfolgreich extrahiert`,
            blocks: result.blocks,
            strategy: result.strategy,
            strategyName: scraperManager.strategies.get(result.strategy)?.name || result.strategy
        });
    } catch (error) {
        res.status(500).json({
            error: 'Fehler beim Scrapen der Blockdaten',
            details: error.message
        });
    }
});

// Gefilterte Blöcke abrufen
app.get('/api/blocks/filter', async (req, res) => {
    try {
        if (!req.session.accessToken) {
            return res.status(401).json({ error: 'Nicht authentifiziert' });
        }

        const { course, blockType } = req.query;

        // DEBUG: Log die Filter-Parameter mit Typen
        console.log('\n=== FILTER REQUEST ===');
        console.log('Course:', JSON.stringify(course), 'Type:', typeof course);
        console.log('BlockType:', JSON.stringify(blockType), 'Type:', typeof blockType);

        const result = await scraperManager.scrapeBlocks({
            preferredStrategy: 'static',
            fallback: true
        });

        let filteredBlocks = result.blocks;
        console.log('📦 TOTAL Blöcke:', filteredBlocks.length);

        // Zeige die ersten 3 Blöcke zum Vergleich
        console.log('Beispiel Blöcke:', filteredBlocks.slice(0, 3).map(b => `${b.course} - ${b.blockType}`));

        // Filtere nach Kurs UND Block-Typ gleichzeitig
        filteredBlocks = filteredBlocks.filter(block => {
            let matchesCourse = true;
            let matchesBlockType = true;

            // Wenn Kurs ausgewählt wurde, prüfe ob er übereinstimmt
            if (course && course !== '' && course !== 'undefined') {
                matchesCourse = block.course === course;
            }

            // Wenn Block-Typ ausgewählt wurde, prüfe ob er übereinstimmt
            if (blockType && blockType !== '' && blockType !== 'undefined') {
                matchesBlockType = block.blockType === blockType;
            }

            // Beide Bedingungen müssen erfüllt sein
            const matches = matchesCourse && matchesBlockType;

            return matches;
        });

        console.log('✅ Nach Filterung:', filteredBlocks.length);
        console.log('Gefilterte Blöcke:', filteredBlocks.slice(0, 5).map(b => `${b.course} - ${b.blockType}`));
        console.log('===================\n');

        // Vergangene Blöcke ausfiltern (Ende vor heutigem Datum)
        const today = new Date().toISOString().split('T')[0];
        const upcomingBlocks = filteredBlocks.filter(block => (block.endDate || block.startDate) >= today);

        console.log('📅 Blöcke nach Datum-Filter:', upcomingBlocks.length);

        res.json({
            success: true,
            blocks: upcomingBlocks,
            total: upcomingBlocks.length
        });
    } catch (error) {
        console.error('❌ Filter Error:', error);
        res.status(500).json({
            error: 'Fehler beim Filtern der Blöcke',
            details: error.message
        });
    }
});

// Verfügbare Kurse abrufen (für Dropdown)
app.get('/api/blocks/courses', async (req, res) => {
    try {
        if (!req.session.accessToken) {
            return res.status(401).json({ error: 'Nicht authentifiziert' });
        }

        const result = await scraperManager.scrapeBlocks({
            preferredStrategy: 'static',
            fallback: true
        });

        // Nur Kurse mit zukünftigen Blöcken berücksichtigen
        const today = new Date().toISOString().split('T')[0];
        const futureBlocks = (result.blocks || []).filter(block => (block.endDate || block.startDate) >= today);

        const courseSet = new Set();
        futureBlocks.forEach(block => {
            if (block.course) {
                courseSet.add(block.course);
            }
        });

        const courses = Array.from(courseSet).sort((a, b) => a.localeCompare(b, 'de'));

        res.json({ success: true, courses, total: courses.length });
    } catch (error) {
        res.status(500).json({
            error: 'Fehler beim Abrufen der Kurse',
            details: error.message
        });
    }
});

// Blöcke in Outlook Kalender importieren
app.post('/api/import-blocks', async (req, res) => {
    try {
        if (!req.session.accessToken) {
            return res.status(401).json({ error: 'Nicht authentifiziert' });
        }

        const { course, blockType, selectedBlocks } = req.body;
        const parser = new ITechBlockParser();

        let blocksToImport = [];

        if (selectedBlocks && selectedBlocks.length > 0) {
            // Spezifische Blöcke importieren
            parser.parseBlocks();
            blocksToImport = parser.blocks.filter(block =>
                selectedBlocks.some(selected =>
                    selected.course === block.course &&
                    selected.startDate === block.startDate
                )
            );
        } else {
            // Alle Blöcke oder gefilterte Blöcke importieren
            parser.parseBlocks();

            if (course) {
                blocksToImport = parser.filterByCourse(course);
            } else if (blockType) {
                blocksToImport = parser.filterByBlockType(blockType);
            } else {
                blocksToImport = parser.blocks;
            }
        }

        // Konvertiere zu Outlook Events (ganztägig, OOF)
        const outlookEvents = parser.convertToOutlookEvents(blocksToImport);

        // Erstelle Events in Outlook
        const createdEvents = [];
        const errors = [];

        for (const eventData of outlookEvents) {
            try {
                // Duplicate-Check: gleicher Betreff und gleicher ganztägiger Zeitraum bereits vorhanden?
                const startDate = (eventData.start?.dateTime || '').slice(0, 10);
                // end ist exklusiv → inklusiv = -1 Tag
                const endExclusive = new Date((eventData.end?.dateTime || '').slice(0, 10));
                endExclusive.setDate(endExclusive.getDate() - 1);
                const endDate = endExclusive.toISOString().slice(0, 10);
                const exists = await GraphAPI.eventExists(req.session.accessToken, eventData.subject, startDate, endDate);

                if (exists) {
                    errors.push({
                        event: eventData.subject,
                        error: 'Übersprungen (bereits vorhanden)'
                    });
                    continue;
                }
                const createdEvent = await GraphAPI.createEvent(req.session.accessToken, eventData);
                createdEvents.push({
                    id: createdEvent.id,
                    subject: createdEvent.subject,
                    start: createdEvent.start.dateTime,
                    end: createdEvent.end.dateTime
                });
            } catch (error) {
                errors.push({
                    event: eventData.subject,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `${createdEvents.length} von ${outlookEvents.length} Terminen erfolgreich erstellt`,
            createdEvents: createdEvents,
            errors: errors,
            totalBlocks: blocksToImport.length
        });

    } catch (error) {
        res.status(500).json({
            error: 'Fehler beim Importieren der Blöcke',
            details: error.message
        });
    }
});

// PDF-Upload für Blockpläne
// PDF-Upload wurde entfernt

// Verfügbare Scraping-Strategien abrufen
app.get('/api/scraping-strategies', async (req, res) => {
    try {
        if (!req.session.accessToken) {
            return res.status(401).json({ error: 'Nicht authentifiziert' });
        }

        const strategies = scraperManager.getAvailableStrategies();
        const config = await scraperManager.autoConfigureStrategies();

        res.json({
            success: true,
            strategies: strategies,
            configuration: config
        });
    } catch (error) {
        res.status(500).json({
            error: 'Fehler beim Abrufen der Strategien',
            details: error.message
        });
    }
});

// Test aller Scraping-Strategien
app.get('/api/test-strategies', async (req, res) => {
    try {
        if (!req.session.accessToken) {
            return res.status(401).json({ error: 'Nicht authentifiziert' });
        }

        const results = await scraperManager.testAllStrategies();

        res.json({
            success: true,
            testResults: results
        });
    } catch (error) {
        res.status(500).json({
            error: 'Fehler beim Testen der Strategien',
            details: error.message
        });
    }
});

// Benachrichtigungsservice Routen
app.post('/api/notifications/subscribe', (req, res) => {
    try {
        if (!req.session.accessToken) {
            return res.status(401).json({ error: 'Nicht authentifiziert' });
        }

        const { method, config } = req.body;
        const userId = req.session.user?.name || 'anonymous';

        notificationService.subscribe(userId, method, config);

        res.json({
            success: true,
            message: 'Erfolgreich für Benachrichtigungen angemeldet'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Fehler bei Benachrichtigungs-Anmeldung',
            details: error.message
        });
    }
});

app.delete('/api/notifications/unsubscribe', (req, res) => {
    try {
        if (!req.session.accessToken) {
            return res.status(401).json({ error: 'Nicht authentifiziert' });
        }

        const userId = req.session.user?.name || 'anonymous';
        notificationService.unsubscribe(userId);

        res.json({
            success: true,
            message: 'Erfolgreich von Benachrichtigungen abgemeldet'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Fehler bei Benachrichtigungs-Abmeldung',
            details: error.message
        });
    }
});

app.get('/api/notifications/status', (req, res) => {
    try {
        if (!req.session.accessToken) {
            return res.status(401).json({ error: 'Nicht authentifiziert' });
        }

        const status = notificationService.getStatus();

        res.json({
            success: true,
            status: status
        });
    } catch (error) {
        res.status(500).json({
            error: 'Fehler beim Abrufen des Benachrichtigungsstatus',
            details: error.message
        });
    }
});

app.post('/api/notifications/force-check', async (req, res) => {
    try {
        if (!req.session.accessToken) {
            return res.status(401).json({ error: 'Nicht authentifiziert' });
        }

        await notificationService.forceCheck();

        res.json({
            success: true,
            message: 'Update-Prüfung erfolgreich durchgeführt'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Fehler bei der Update-Prüfung',
            details: error.message
        });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Fehler beim Abmelden' });
        }
        res.json({ success: true, message: 'Erfolgreich abgemeldet' });
    });
});

// Server starten
app.listen(PORT, () => {
    console.log(`🚀 API Server läuft auf http://localhost:${PORT}`);
    console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
    console.log(`🔐 SESSION_SECRET wurde automatisch generiert`);
    console.log(`📝 Vergessen Sie nicht, die Umgebungsvariablen zu setzen:`);
    console.log(`   CLIENT_ID, CLIENT_SECRET, TENANT_ID`);
    console.log(`   FRONTEND_URL (Standard: http://localhost:3001)`);
});

module.exports = app;
