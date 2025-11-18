/**
 * Benachrichtigungssystem für Blockplan-Änderungen
 * Überwacht Änderungen und benachrichtigt Benutzer
 */

const fs = require('fs');
const path = require('path');

class NotificationService {
    constructor() {
        this.dataFile = path.join(__dirname, '../data/blockplan-cache.json');
        this.subscribers = new Map();
        this.lastCheck = null;
        this.checkInterval = 24 * 60 * 60 * 1000; // 24 Stunden
    }

    /**
     * Startet den Überwachungsservice
     */
    startMonitoring() {
        console.log('📡 Benachrichtigungsservice gestartet');

        // Initiale Prüfung
        this.checkForUpdates();

        // Regelmäßige Prüfungen
        setInterval(() => {
            this.checkForUpdates();
        }, this.checkInterval);
    }

    /**
     * Prüft auf Aktualisierungen der Blockpläne
     */
    async checkForUpdates() {
        try {
            console.log('🔍 Prüfe auf Blockplan-Updates...');

            const BlockScraperManager = require('../scrapers/blockScraperManager');
            const manager = new BlockScraperManager();

            // Versuche aktuelle Daten zu laden
            const result = await manager.scrapeBlocks({
                preferredStrategy: 'adaptive', // Versuche zuerst Website
                fallback: true
            });

            const currentBlocks = result.blocks;
            const cachedBlocks = this.loadCachedBlocks();

            // Vergleiche mit gecachten Daten
            const changes = this.compareBlocks(cachedBlocks, currentBlocks);

            if (changes.hasChanges) {
                console.log('📢 Änderungen erkannt!', changes);

                // Speichere neue Daten
                this.saveCachedBlocks(currentBlocks);

                // Benachrichtige Abonnenten
                this.notifySubscribers(changes);
            } else {
                console.log('✅ Keine Änderungen gefunden');
            }

            this.lastCheck = new Date();

        } catch (error) {
            console.error('❌ Fehler bei Update-Prüfung:', error.message);
        }
    }

    /**
     * Lädt gecachte Blockdaten
     */
    loadCachedBlocks() {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = fs.readFileSync(this.dataFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.warn('Fehler beim Laden der gecachten Daten:', error.message);
        }
        return [];
    }

    /**
     * Speichert Blockdaten im Cache
     */
    saveCachedBlocks(blocks) {
        try {
            const dataDir = path.dirname(this.dataFile);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            fs.writeFileSync(this.dataFile, JSON.stringify(blocks, null, 2));
            console.log('💾 Blockdaten gecacht');
        } catch (error) {
            console.error('Fehler beim Speichern der Daten:', error.message);
        }
    }

    /**
     * Vergleicht alte und neue Blockdaten
     */
    compareBlocks(oldBlocks, newBlocks) {
        const changes = {
            hasChanges: false,
            added: [],
            removed: [],
            modified: [],
            summary: ''
        };

        // Erstelle Maps für einfachen Vergleich
        const oldMap = new Map();
        const newMap = new Map();

        oldBlocks.forEach(block => {
            const key = `${block.course}-${block.startDate}-${block.endDate}`;
            oldMap.set(key, block);
        });

        newBlocks.forEach(block => {
            const key = `${block.course}-${block.startDate}-${block.endDate}`;
            newMap.set(key, block);
        });

        // Suche nach neuen Blöcken
        for (const [key, block] of newMap) {
            if (!oldMap.has(key)) {
                changes.added.push(block);
                changes.hasChanges = true;
            }
        }

        // Suche nach entfernten Blöcken
        for (const [key, block] of oldMap) {
            if (!newMap.has(key)) {
                changes.removed.push(block);
                changes.hasChanges = true;
            }
        }

        // Erstelle Zusammenfassung
        if (changes.hasChanges) {
            const parts = [];
            if (changes.added.length > 0) {
                parts.push(`${changes.added.length} neue Blöcke`);
            }
            if (changes.removed.length > 0) {
                parts.push(`${changes.removed.length} entfernte Blöcke`);
            }
            changes.summary = parts.join(', ');
        }

        return changes;
    }

    /**
     * Registriert einen Abonnenten für Benachrichtigungen
     */
    subscribe(userId, notificationMethod, config = {}) {
        this.subscribers.set(userId, {
            method: notificationMethod, // 'email', 'webhook', 'console'
            config: config,
            lastNotified: null
        });

        console.log(`📧 Benutzer ${userId} für Benachrichtigungen registriert`);
    }

    /**
     * Entfernt einen Abonnenten
     */
    unsubscribe(userId) {
        this.subscribers.delete(userId);
        console.log(`🚫 Benutzer ${userId} von Benachrichtigungen abgemeldet`);
    }

    /**
     * Benachrichtigt alle Abonnenten über Änderungen
     */
    async notifySubscribers(changes) {
        const message = this.createNotificationMessage(changes);

        for (const [userId, subscriber] of this.subscribers) {
            try {
                await this.sendNotification(userId, subscriber, message, changes);
                subscriber.lastNotified = new Date();
            } catch (error) {
                console.error(`Fehler beim Benachrichtigen von ${userId}:`, error.message);
            }
        }
    }

    /**
     * Erstellt Benachrichtigungsnachricht
     */
    createNotificationMessage(changes) {
        let message = `🔔 ITECH Blockplan-Update\n\n`;
        message += `Änderungen erkannt: ${changes.summary}\n\n`;

        if (changes.added.length > 0) {
            message += `➕ Neue Blöcke (${changes.added.length}):\n`;
            changes.added.slice(0, 5).forEach(block => {
                message += `• ${block.course} - ${block.blockType} (${block.startDate} - ${block.endDate})\n`;
            });
            if (changes.added.length > 5) {
                message += `... und ${changes.added.length - 5} weitere\n`;
            }
            message += '\n';
        }

        if (changes.removed.length > 0) {
            message += `➖ Entfernte Blöcke (${changes.removed.length}):\n`;
            changes.removed.slice(0, 5).forEach(block => {
                message += `• ${block.course} - ${block.blockType} (${block.startDate} - ${block.endDate})\n`;
            });
            if (changes.removed.length > 5) {
                message += `... und ${changes.removed.length - 5} weitere\n`;
            }
        }

        message += `\n⏰ Geprüft am: ${new Date().toLocaleString('de-DE')}`;

        return message;
    }

    /**
     * Sendet Benachrichtigung an einen Abonnenten
     */
    async sendNotification(userId, subscriber, message, changes) {
        switch (subscriber.method) {
            case 'console':
                console.log(`📢 Benachrichtigung für ${userId}:`);
                console.log(message);
                break;

            case 'webhook':
                await this.sendWebhookNotification(subscriber.config.url, message, changes);
                break;

            case 'email':
                // Hier würde E-Mail-Versand implementiert werden
                console.log(`📧 E-Mail-Benachrichtigung für ${userId} (nicht implementiert)`);
                break;

            default:
                console.warn(`Unbekannte Benachrichtigungsmethode: ${subscriber.method}`);
        }
    }

    /**
     * Sendet Webhook-Benachrichtigung
     */
    async sendWebhookNotification(url, message, changes) {
        try {
            const axios = require('axios');

            const payload = {
                text: message,
                changes: changes,
                timestamp: new Date().toISOString(),
                source: 'ITECH Blockplan Monitor'
            };

            await axios.post(url, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000
            });

            console.log('✅ Webhook-Benachrichtigung gesendet');
        } catch (error) {
            console.error('❌ Webhook-Fehler:', error.message);
        }
    }

    /**
     * Gibt Status des Services zurück
     */
    getStatus() {
        return {
            isRunning: true,
            lastCheck: this.lastCheck,
            subscriberCount: this.subscribers.size,
            checkInterval: this.checkInterval,
            nextCheck: this.lastCheck ? new Date(this.lastCheck.getTime() + this.checkInterval) : null
        };
    }

    /**
     * Erzwingt eine sofortige Prüfung
     */
    async forceCheck() {
        console.log('🔄 Erzwinge Update-Prüfung...');
        await this.checkForUpdates();
    }
}

module.exports = NotificationService;
