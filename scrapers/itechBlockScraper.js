const puppeteer = require('puppeteer');

/**
 * ITECH Blockplanung Web Scraper
 * Extrahiert Schulblöcke von der ITECH Website
 */
class ITechBlockScraper {
    constructor() {
        this.baseUrl = 'https://www.itech-bs14.de/service/blockplanung/';
        this.blocks = [];
    }

    /**
     * Hauptmethode zum Scrapen der Blockdaten
     */
    async scrapeBlocks() {
        let browser = null;
        try {
            console.log('🔍 Lade ITECH Blockplanung...');

            // Starte Browser
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

            // Lade die Seite
            await page.goto(this.baseUrl, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            // Warte bis der Inhalt geladen ist
            await page.waitForSelector('h3, h2', { timeout: 10000 });

            this.blocks = [];

            // Extrahiere alle Blockdaten basierend auf der tatsächlichen Website-Struktur
            await this.extractBlocksFromPage(page);

            console.log(`✅ ${this.blocks.length} Blöcke erfolgreich extrahiert`);
            return this.blocks;

        } catch (error) {
            console.error('❌ Fehler beim Scrapen:', error.message);
            throw new Error(`Scraping fehlgeschlagen: ${error.message}`);
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    /**
     * Extrahiert Blockdaten von der geladenen Seite
     */
    async extractBlocksFromPage(page) {
        try {
            // Extrahiere alle relevanten Daten von der Seite
            const blockData = await page.evaluate(() => {
                const blocks = [];

                // Suche nach allen Überschriften, die Blockzeiten enthalten
                const headings = document.querySelectorAll('h3, h4, h5');

                headings.forEach(heading => {
                    const headingText = heading.textContent.trim();

                    // Prüfe ob es sich um eine Blockzeiten-Überschrift handelt
                    if (headingText.includes('Blockzeiten') || headingText.includes('halbjahr')) {
                        const semester = headingText;

                        // Suche nach dem nächsten Inhalt
                        let currentElement = heading.nextElementSibling;

                        while (currentElement && !currentElement.matches('h3, h4, h5')) {
                            const text = currentElement.textContent.trim();

                            // Suche nach Block-Definitionen
                            if (text.includes('-Blöcke:') || text.includes('-Block:')) {
                                const blockType = text.match(/([ABC]|BHH)-Blöcke?:/)?.[1] + '-Block' || 'Unbekannt';

                                // Extrahiere Kurse
                                const coursesMatch = text.match(/:\s*\*\*(.*?)\*\*/);
                                const courses = coursesMatch ?
                                    coursesMatch[1].split('|').map(c => c.trim()).filter(c => c) : [];

                                // Suche nach Zeiträumen in nachfolgenden Elementen
                                let timeElement = currentElement.nextElementSibling;
                                while (timeElement && !timeElement.textContent.includes('-Blöcke:') &&
                                    !timeElement.textContent.includes('-Block:') &&
                                    !timeElement.matches('h3, h4, h5')) {

                                    const timeText = timeElement.textContent.trim();

                                    // Suche nach Datumsmustern
                                    const dateMatches = timeText.match(/(\d{1,2})\.(\d{1,2})\.\s*[–-]\s*(\d{1,2})\.(\d{1,2})\.(\d{2,4})/g);

                                    if (dateMatches) {
                                        dateMatches.forEach(dateMatch => {
                                            const match = dateMatch.match(/(\d{1,2})\.(\d{1,2})\.\s*[–-]\s*(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
                                            if (match) {
                                                const [, startDay, startMonth, endDay, endMonth, year] = match;
                                                const fullYear = year.length === 2 ? `20${year}` : year;

                                                const startDate = `${fullYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`;
                                                const endDate = `${fullYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`;

                                                // Extrahiere Notizen
                                                const notes = [];
                                                if (timeText.includes('ferien')) {
                                                    const ferienMatch = timeText.match(/_([^_]*ferien[^_]*)_/i);
                                                    if (ferienMatch) notes.push(`Ferien: ${ferienMatch[1]}`);
                                                }
                                                if (timeText.includes('Organisationstag')) {
                                                    const orgMatch = timeText.match(/_([^_]*Organisationstag[^_]*)_/i);
                                                    if (orgMatch) notes.push(orgMatch[1]);
                                                }

                                                // Erstelle Blöcke für alle Kurse
                                                courses.forEach(course => {
                                                    blocks.push({
                                                        course: course,
                                                        blockType: blockType,
                                                        semester: semester,
                                                        startDate: startDate,
                                                        endDate: endDate,
                                                        notes: notes.join(', '),
                                                        source: 'ITECH Blockplanung'
                                                    });
                                                });
                                            }
                                        });
                                    }

                                    timeElement = timeElement.nextElementSibling;
                                }
                            }

                            currentElement = currentElement.nextElementSibling;
                        }
                    }
                });

                return blocks;
            });

            this.blocks = blockData;

        } catch (error) {
            console.error('Fehler beim Extrahieren der Blockdaten:', error.message);
            throw error;
        }
    }

    /**
     * Extrahiert Block-Typ (A, B, C, BHH)
     */
    extractBlockType(text) {
        if (text.includes('A-Blöcke:')) return 'A-Block';
        if (text.includes('B-Blöcke:')) return 'B-Block';
        if (text.includes('C-Blöcke:')) return 'C-Block';
        if (text.includes('BHH-Block:')) return 'BHH-Block';
        return 'Unbekannt';
    }

    /**
     * Extrahiert Kurse aus dem Text
     */
    extractCourses(text) {
        const courseMatch = text.match(/:\s*\*\*(.*?)\*\*/);
        if (courseMatch) {
            return courseMatch[1]
                .split('|')
                .map(course => course.trim())
                .filter(course => course.length > 0);
        }
        return [];
    }

    /**
     * Parst Datumsbereich aus Text
     */
    parseDateRange(text) {
        try {
            // Entferne Formatierungen und Notizen
            const cleanText = text.replace(/_([^_]+)_/g, '').replace(/\*\*([^*]+)\*\*/g, '');

            // Suche nach Datumsmustern (dd.mm. – dd.mm.yy)
            const datePattern = /(\d{1,2})\.(\d{1,2})\.\s*[–-]\s*(\d{1,2})\.(\d{1,2})\.(\d{2,4})/;
            const match = cleanText.match(datePattern);

            if (match) {
                const [, startDay, startMonth, endDay, endMonth, year] = match;
                const fullYear = year.length === 2 ? `20${year}` : year;

                const startDate = new Date(`${fullYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`);
                const endDate = new Date(`${fullYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`);

                // Extrahiere Notizen (Ferienzeiten, Organisationstage)
                const notes = this.extractNotes(text);

                return {
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    notes: notes
                };
            }

            return null;
        } catch (error) {
            console.warn('Fehler beim Parsen des Datums:', text, error.message);
            return null;
        }
    }

    /**
     * Extrahiert Notizen aus dem Text (Ferienzeiten, etc.)
     */
    extractNotes(text) {
        const notes = [];

        // Ferienzeiten
        if (text.includes('ferien:')) {
            const ferienMatch = text.match(/_([^_]*ferien[^_]*)_/i);
            if (ferienMatch) notes.push(`Ferien: ${ferienMatch[1]}`);
        }

        // Organisationstage
        if (text.includes('Organisationstag:')) {
            const orgMatch = text.match(/_([^_]*Organisationstag[^_]*)_/i);
            if (orgMatch) notes.push(orgMatch[1]);
        }

        return notes.join(', ');
    }

    /**
     * Filtert Blöcke nach Kurs
     */
    filterByCourse(courseFilter) {
        return this.blocks.filter(block =>
            block.course.toLowerCase().includes(courseFilter.toLowerCase())
        );
    }

    /**
     * Filtert Blöcke nach Block-Typ
     */
    filterByBlockType(blockType) {
        return this.blocks.filter(block => block.blockType === blockType);
    }

    /**
     * Konvertiert Blöcke zu Outlook-Event Format
     */
    convertToOutlookEvents(blocks = this.blocks) {
        // Hilfsfunktion: Format YYYY-MM-DD zu DD.MM.YYYY
        const formatDate = (dateStr) => {
            const [y, m, d] = dateStr.split('-');
            return `${d}.${m}.${y}`;
        };

        return blocks.map(block => ({
            subject: `${block.course} - ${block.blockType} (${formatDate(block.startDate)} - ${formatDate(block.endDate)})`,
            body: {
                contentType: 'HTML',
                content: `
                    <h3>${block.course} - ${block.blockType}</h3>
                    <p><strong>Semester:</strong> ${block.semester}</p>
                    <p><strong>Zeitraum:</strong> ${block.startDate} bis ${block.endDate}</p>
                    ${block.notes ? `<p><strong>Hinweise:</strong> ${block.notes}</p>` : ''}
                    <p><em>Quelle: ${block.source}</em></p>
                `
            },
            start: {
                dateTime: `${block.startDate}T08:00:00`,
                timeZone: 'Europe/Berlin'
            },
            end: {
                dateTime: `${block.endDate}T17:00:00`,
                timeZone: 'Europe/Berlin'
            },
            isAllDay: false,
            showAs: 'busy',
            categories: ['Schule', 'ITECH', block.blockType]
        }));
    }
}

module.exports = ITechBlockScraper;
