/**
 * Block Scraper Manager
 * Verwaltet verschiedene Scraping-Strategien und Datenquellen
 */

class BlockScraperManager {
    constructor() {
        this.strategies = new Map();
        this.registerStrategies();
    }

    /**
     * Registriert verfügbare Scraping-Strategien
     */
    registerStrategies() {
        // Aktuelle Implementierung (statische Daten)
        this.strategies.set('static', {
            name: 'Statische Daten',
            description: 'Vordefinierte Blockdaten für 2025/26',
            implementation: () => require('./itechBlockParser'),
            priority: 1
        });

        // PDF-Parser
        this.strategies.set('pdf', {
            name: 'PDF-Parser',
            description: 'Extrahiert Daten aus PDF-Blockplänen',
            implementation: () => require('./pdfBlockParser'),
            priority: 2
        });

        // Adaptiver Web-Scraper
        this.strategies.set('adaptive', {
            name: 'Adaptiver Scraper',
            description: 'Dynamisches Scraping der Website',
            implementation: () => require('./adaptiveBlockScraper'),
            priority: 3
        });

        // Manueller Upload
        this.strategies.set('manual', {
            name: 'Manueller Upload',
            description: 'Benutzer lädt eigene Blockplan-Datei hoch',
            implementation: () => require('./manualBlockParser'),
            priority: 4
        });
    }

    /**
     * Hauptmethode: Versucht alle Strategien in Reihenfolge
     */
    async scrapeBlocks(options = {}) {
        const { preferredStrategy, fallback = true, pdfPath } = options;

        // Sortiere Strategien nach Priorität
        const sortedStrategies = Array.from(this.strategies.entries())
            .sort(([, a], [, b]) => a.priority - b.priority);

        // Bevorzugte Strategie zuerst versuchen
        if (preferredStrategy && this.strategies.has(preferredStrategy)) {
            try {
                console.log(`🎯 Versuche bevorzugte Strategie: ${preferredStrategy}`);
                const result = await this.executeStrategy(preferredStrategy, { pdfPath });
                if (result && result.length > 0) {
                    return {
                        blocks: result,
                        strategy: preferredStrategy,
                        success: true
                    };
                }
            } catch (error) {
                console.warn(`⚠️ Bevorzugte Strategie fehlgeschlagen:`, error.message);
            }
        }

        // Fallback: Alle Strategien durchprobieren
        if (fallback) {
            for (const [key, strategy] of sortedStrategies) {
                if (key === preferredStrategy) continue; // Bereits versucht

                try {
                    console.log(`📥 Versuche ${strategy.name}...`);
                    const result = await this.executeStrategy(key, { pdfPath });

                    if (result && result.length > 0) {
                        return {
                            blocks: result,
                            strategy: key,
                            success: true,
                            message: `Erfolgreich mit ${strategy.name}`
                        };
                    }
                } catch (error) {
                    console.warn(`⚠️ ${strategy.name} fehlgeschlagen:`, error.message);
                    continue;
                }
            }
        }

        throw new Error('Alle Scraping-Strategien fehlgeschlagen');
    }

    /**
     * Führt eine spezifische Strategie aus
     */
    async executeStrategy(strategyKey, options = {}) {
        const strategy = this.strategies.get(strategyKey);
        if (!strategy) {
            throw new Error(`Unbekannte Strategie: ${strategyKey}`);
        }

        const StrategyClass = strategy.implementation();
        const instance = new StrategyClass();

        // Verschiedene Methoden je nach Implementierung
        if (typeof instance.scrapeBlocks === 'function') {
            return await instance.scrapeBlocks();
        } else if (typeof instance.parseBlocks === 'function') {
            return instance.parseBlocks();
        } else if (typeof instance.parsePDFBlocks === 'function') {
            // Für PDF-Parser - verwende übergebenen Pfad oder suche nach PDF
            const pdfPath = options.pdfPath || await this.findLatestPDF();
            return await instance.parsePDFBlocks(pdfPath);
        }

        throw new Error(`Strategie ${strategyKey} hat keine gültige Parse-Methode`);
    }

    /**
     * Sucht nach dem neuesten PDF-Blockplan
     */
    async findLatestPDF() {
        // Implementierung zum Finden von PDFs
        // Könnte Downloads-Ordner durchsuchen oder von Website herunterladen
        const fs = require('fs');
        const path = require('path');

        const possiblePaths = [
            './uploads/blockplan.pdf',
            './data/blockplan.pdf',
            path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads', 'blockplan*.pdf')
        ];

        for (const pdfPath of possiblePaths) {
            if (fs.existsSync(pdfPath)) {
                return pdfPath;
            }
        }

        throw new Error('Kein PDF-Blockplan gefunden');
    }

    /**
     * Gibt verfügbare Strategien zurück
     */
    getAvailableStrategies() {
        return Array.from(this.strategies.entries()).map(([key, strategy]) => ({
            key,
            name: strategy.name,
            description: strategy.description,
            priority: strategy.priority
        }));
    }

    /**
     * Testet alle Strategien und gibt Status zurück
     */
    async testAllStrategies() {
        const results = {};

        for (const [key, strategy] of this.strategies.entries()) {
            try {
                console.log(`🧪 Teste ${strategy.name}...`);
                const startTime = Date.now();
                const result = await this.executeStrategy(key);
                const duration = Date.now() - startTime;

                results[key] = {
                    success: true,
                    blocksFound: result ? result.length : 0,
                    duration: duration,
                    message: `${result?.length || 0} Blöcke in ${duration}ms`
                };
            } catch (error) {
                results[key] = {
                    success: false,
                    error: error.message,
                    duration: 0,
                    message: `Fehlgeschlagen: ${error.message}`
                };
            }
        }

        return results;
    }

    /**
     * Konfiguriert Strategien basierend auf verfügbaren Ressourcen
     */
    async autoConfigureStrategies() {
        const config = {
            hasInternet: await this.checkInternetConnection(),
            hasPDFs: await this.checkForPDFs(),
            hasStaticData: true // Immer verfügbar
        };

        // Deaktiviere Strategien basierend auf Verfügbarkeit
        if (!config.hasInternet) {
            this.strategies.delete('adaptive');
        }

        if (!config.hasPDFs) {
            this.strategies.delete('pdf');
        }

        return config;
    }

    /**
     * Prüft Internetverbindung
     */
    async checkInternetConnection() {
        try {
            const axios = require('axios');
            await axios.get('https://www.itech-bs14.de', { timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Prüft auf verfügbare PDFs
     */
    async checkForPDFs() {
        try {
            await this.findLatestPDF();
            return true;
        } catch {
            return false;
        }
    }
}

module.exports = BlockScraperManager;
