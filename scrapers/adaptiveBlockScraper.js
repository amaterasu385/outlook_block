/**
 * Adaptiver ITECH Block Scraper
 * Kann verschiedene Datenquellen und Formate verarbeiten
 */
const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');

class AdaptiveBlockScraper {
    constructor() {
        this.fallbackStrategies = [
            'parseFromWebsite',
            'parseFromStaticData',
            'parseFromPDF',
            'parseFromAPI'
        ];
    }

    /**
     * Hauptmethode - versucht verschiedene Strategien
     */
    async scrapeBlocks() {
        console.log('🔄 Starte adaptives Scraping...');

        for (const strategy of this.fallbackStrategies) {
            try {
                console.log(`📥 Versuche Strategie: ${strategy}`);
                const result = await this[strategy]();

                if (result && result.length > 0) {
                    console.log(`✅ Erfolgreich mit ${strategy}: ${result.length} Blöcke`);
                    return result;
                }
            } catch (error) {
                console.warn(`⚠️ Strategie ${strategy} fehlgeschlagen:`, error.message);
                continue;
            }
        }

        throw new Error('Alle Scraping-Strategien fehlgeschlagen');
    }

    /**
     * Strategie 1: Dynamisches Website-Scraping
     */
    async parseFromWebsite() {
        let browser = null;
        try {
            browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();

            await page.goto('https://www.itech-bs14.de/service/blockplanung/', {
                waitUntil: 'networkidle0',
                timeout: 15000
            });

            // Versuche verschiedene Selektoren
            const selectors = [
                'h3:contains("Blockzeiten")',
                '.blockplanung',
                '[data-block]',
                'table',
                '.calendar'
            ];

            let blocks = [];
            for (const selector of selectors) {
                try {
                    await page.waitForSelector(selector, { timeout: 3000 });
                    blocks = await this.extractBlocksFromPage(page, selector);
                    if (blocks.length > 0) break;
                } catch (e) {
                    continue;
                }
            }

            return blocks;
        } finally {
            if (browser) await browser.close();
        }
    }

    /**
     * Strategie 2: Fallback auf statische Daten (aktueller Parser)
     */
    async parseFromStaticData() {
        const ITechBlockParser = require('./itechBlockParser');
        const parser = new ITechBlockParser();
        return parser.parseBlocks();
    }

    /**
     * Strategie 3: PDF-Parsing
     */
    async parseFromPDF() {
        // Suche nach PDF-Links auf der Website
        const pdfUrls = await this.findPDFLinks();

        if (pdfUrls.length === 0) {
            throw new Error('Keine PDF-Blockpläne gefunden');
        }

        const blocks = [];
        for (const pdfUrl of pdfUrls) {
            try {
                const pdfBlocks = await this.parsePDFBlocks(pdfUrl);
                blocks.push(...pdfBlocks);
            } catch (error) {
                console.warn(`PDF ${pdfUrl} konnte nicht geparst werden:`, error.message);
            }
        }

        return blocks;
    }

    /**
     * Strategie 4: API-Fallback (falls verfügbar)
     */
    async parseFromAPI() {
        // Versuche verschiedene mögliche API-Endpunkte
        const apiEndpoints = [
            'https://www.itech-bs14.de/api/blockplanung',
            'https://api.itech-bs14.de/blocks',
            'https://www.itech-bs14.de/service/blockplanung/api'
        ];

        for (const endpoint of apiEndpoints) {
            try {
                const response = await axios.get(endpoint, { timeout: 5000 });
                if (response.data && Array.isArray(response.data)) {
                    return this.normalizeAPIData(response.data);
                }
            } catch (error) {
                continue;
            }
        }

        throw new Error('Keine API-Endpunkte verfügbar');
    }

    /**
     * Sucht nach PDF-Links auf der Website
     */
    async findPDFLinks() {
        try {
            const response = await axios.get('https://www.itech-bs14.de/service/blockplanung/');
            const $ = cheerio.load(response.data);

            const pdfLinks = [];
            $('a[href$=".pdf"]').each((i, link) => {
                const href = $(link).attr('href');
                const fullUrl = href.startsWith('http') ? href : `https://www.itech-bs14.de${href}`;
                pdfLinks.push(fullUrl);
            });

            return pdfLinks;
        } catch (error) {
            return [];
        }
    }

    /**
     * Parst Blockdaten aus PDF
     */
    async parsePDFBlocks(pdfUrl) {
        // Hier würde PDF-Parsing implementiert werden
        // Benötigt Libraries wie pdf-parse oder pdf2pic + OCR

        console.log(`📄 PDF-Parsing für ${pdfUrl} würde hier implementiert`);

        // Beispiel-Implementierung:
        /*
        const pdfParse = require('pdf-parse');
        const pdfBuffer = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
        const pdfData = await pdfParse(pdfBuffer.data);
        
        return this.extractBlocksFromPDFText(pdfData.text);
        */

        return []; // Placeholder
    }

    /**
     * Extrahiert Blöcke aus PDF-Text
     */
    extractBlocksFromPDFText(text) {
        const blocks = [];
        const lines = text.split('\n');

        // Regex-Patterns für verschiedene PDF-Formate
        const patterns = [
            /(\w+\s+\d+[a-z]?)\s+(\d{1,2}\.\d{1,2}\.\d{2,4})\s*[-–]\s*(\d{1,2}\.\d{1,2}\.\d{2,4})/gi,
            /Block\s+([ABC])\s*:\s*(.+)/gi,
            // Weitere Patterns je nach PDF-Format
        ];

        for (const line of lines) {
            for (const pattern of patterns) {
                const matches = [...line.matchAll(pattern)];
                for (const match of matches) {
                    // Extrahiere und normalisiere Daten
                    blocks.push(this.createBlockFromMatch(match));
                }
            }
        }

        return blocks;
    }

    /**
     * Erstellt Block-Objekt aus Regex-Match
     */
    createBlockFromMatch(match) {
        // Implementierung abhängig vom PDF-Format
        return {
            course: match[1] || 'Unbekannt',
            blockType: 'Unbekannt',
            semester: 'PDF Import',
            startDate: this.parseDate(match[2]),
            endDate: this.parseDate(match[3]),
            notes: 'Aus PDF importiert',
            source: 'PDF'
        };
    }

    /**
     * Normalisiert API-Daten
     */
    normalizeAPIData(apiData) {
        return apiData.map(item => ({
            course: item.course || item.name || 'Unbekannt',
            blockType: item.type || item.block_type || 'Unbekannt',
            semester: item.semester || item.term || 'API Import',
            startDate: item.start_date || item.startDate,
            endDate: item.end_date || item.endDate,
            notes: item.notes || item.description || '',
            source: 'API'
        }));
    }

    /**
     * Parst Datum in verschiedenen Formaten
     */
    parseDate(dateString) {
        if (!dateString) return null;

        // Verschiedene Datumsformate unterstützen
        const formats = [
            /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/,  // DD.MM.YYYY
            /(\d{4})-(\d{1,2})-(\d{1,2})/,      // YYYY-MM-DD
            /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/   // MM/DD/YYYY
        ];

        for (const format of formats) {
            const match = dateString.match(format);
            if (match) {
                // Normalisiere zu YYYY-MM-DD Format
                const [, p1, p2, p3] = match;

                if (format.source.includes('-')) {
                    return `${p1}-${p2.padStart(2, '0')}-${p3.padStart(2, '0')}`;
                } else {
                    const year = p3.length === 2 ? `20${p3}` : p3;
                    return `${year}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')}`;
                }
            }
        }

        return null;
    }

    /**
     * Extrahiert Blöcke von der Seite mit verschiedenen Selektoren
     */
    async extractBlocksFromPage(page, selector) {
        // Implementierung für dynamisches Extrahieren
        // Je nach gefundenem Selector
        return [];
    }
}

module.exports = AdaptiveBlockScraper;
