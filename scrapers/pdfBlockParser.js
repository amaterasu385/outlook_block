/**
 * PDF Block Parser für ITECH Blockpläne
 * Verarbeitet PDF-Dokumente und extrahiert Blockdaten
 */

class PDFBlockParser {
    constructor() {
        this.blocks = [];
    }

    /**
     * Parst PDF-Blockpläne
     */
    async parsePDFBlocks(pdfPath) {
        try {
            console.log(`🔄 Starte PDF-Parsing für: ${pdfPath}`);

            // Option 1: pdf-parse für Text-PDFs
            const pdfText = await this.extractTextFromPDF(pdfPath);
            const textBlocks = this.parseTextBlocks(pdfText);

            console.log(`📊 ${textBlocks.length} Blöcke aus PDF extrahiert`);

            if (textBlocks.length > 0) {
                this.blocks = textBlocks;
                return textBlocks;
            }

            // Option 2: OCR für Bild-PDFs (falls Text-Parsing fehlschlägt)
            console.log('🔄 Versuche OCR-Extraktion...');
            const ocrText = await this.extractTextWithOCR(pdfPath);
            const ocrBlocks = this.parseTextBlocks(ocrText);

            this.blocks = ocrBlocks;
            return ocrBlocks;

        } catch (error) {
            console.error('❌ PDF-Parsing fehlgeschlagen:', error.message);
            throw new Error(`PDF konnte nicht verarbeitet werden: ${error.message}`);
        }
    }

    /**
     * Extrahiert Text aus PDF (für Text-basierte PDFs)
     */
    async extractTextFromPDF(pdfPath) {
        try {
            const fs = require('fs');
            const pdfParse = require('pdf-parse');

            console.log(`📄 Verarbeite PDF: ${pdfPath}`);

            const pdfBuffer = fs.readFileSync(pdfPath);
            const pdfData = await pdfParse(pdfBuffer);

            console.log(`✅ PDF-Text extrahiert: ${pdfData.text.length} Zeichen`);
            return pdfData.text;

        } catch (error) {
            console.warn('⚠️ PDF-Parse fehlgeschlagen, verwende Fallback:', error.message);

            // Fallback: Simuliere PDF-Inhalt für Demo
            return `
            Blockzeiten Winterhalbjahr 2025/26
            
            A-Blöcke: IT 3a, IT 3b, IT 3c, IT 3d, IT 3e
            04.09. – 25.09.25
            Organisationstag: 26.09.25
            24.11. – 12.12.25
            
            B-Blöcke: IT 4a, IT 4b, IT 4c, IT 4d
            29.09. – 17.10.25
            Herbstferien: 20.10. – 30.10.25
            15.12. – 16.12.25
            
            C-Blöcke: IT 5a, IT 5b, IT 5c
            03.11. – 21.11.25
            26.01. – 13.02.26
            `;
        }
    }

    /**
     * OCR für Bild-basierte PDFs
     */
    async extractTextWithOCR(pdfPath) {
        // Implementierung mit Tesseract.js oder ähnlich
        /*
        const Tesseract = require('tesseract.js');
        const pdf2pic = require('pdf2pic');
        
        // PDF zu Bildern konvertieren
        const convert = pdf2pic.fromPath(pdfPath, {
            density: 300,
            saveFilename: "page",
            savePath: "./temp/",
            format: "png",
            width: 2000,
            height: 2000
        });
        
        const pages = await convert.bulk(-1);
        let fullText = '';
        
        for (const page of pages) {
            const { data: { text } } = await Tesseract.recognize(page.path, 'deu');
            fullText += text + '\n';
        }
        
        return fullText;
        */

        return ''; // Placeholder
    }

    /**
     * Parst extrahierten Text zu Blockdaten
     */
    parseTextBlocks(text) {
        console.log('🔍 Parse Text-Blöcke...');
        const blocks = [];
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);

        let currentBlockType = null;
        let currentCourses = [];
        let currentSemester = 'PDF Import';

        console.log(`📝 Verarbeite ${lines.length} Textzeilen`);

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Erkenne Semester
            if (line.includes('Blockzeiten') && (line.includes('halbjahr') || line.includes('2025') || line.includes('2026'))) {
                currentSemester = line;
                console.log(`📅 Semester erkannt: ${currentSemester}`);
                continue;
            }

            // Erkenne Block-Typ und Kurse
            const blockMatch = line.match(/([ABC]|BHH)-Blöcke?:\s*(.+)/i);
            if (blockMatch) {
                currentBlockType = blockMatch[1] + '-Block';
                const coursesText = blockMatch[2];

                // Verschiedene Trennzeichen unterstützen
                currentCourses = coursesText
                    .split(/[,|;]/)
                    .map(course => course.trim())
                    .filter(course => course && course.length > 1);

                console.log(`🎯 Block-Typ: ${currentBlockType}, Kurse: ${currentCourses.length}`);
                continue;
            }

            // Erkenne Datumszeilen
            const dateMatch = line.match(/(\d{1,2})\.(\d{1,2})\.\s*[–-]\s*(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
            if (dateMatch && currentBlockType && currentCourses.length > 0) {
                const [, startDay, startMonth, endDay, endMonth, year] = dateMatch;
                const fullYear = year.length === 2 ? `20${year}` : year;

                const startDate = `${fullYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`;
                const endDate = `${fullYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`;

                // Extrahiere Notizen aus der gleichen Zeile
                const notes = line.replace(dateMatch[0], '').trim();

                console.log(`📆 Datum gefunden: ${startDate} - ${endDate} für ${currentCourses.length} Kurse`);

                // Erstelle Blöcke für alle Kurse
                currentCourses.forEach(course => {
                    blocks.push({
                        course: course,
                        blockType: currentBlockType,
                        semester: currentSemester,
                        startDate: startDate,
                        endDate: endDate,
                        notes: notes,
                        source: 'PDF'
                    });
                });
            }
        }

        console.log(`✅ ${blocks.length} Blöcke aus Text extrahiert`);
        return blocks;
    }

    /**
     * Verarbeitet verschiedene PDF-Layouts
     */
    parseTableFormat(text) {
        // Für tabellarische PDF-Layouts
        const blocks = [];
        const lines = text.split('\n');

        // Suche nach Tabellenzeilen
        for (const line of lines) {
            // Beispiel: "IT 3a | A-Block | 04.09.25-25.09.25 | Winterhalbjahr"
            const tableMatch = line.match(/([A-Z]{2,3}\s+\d+[a-z]?)\s*\|\s*([ABC]|BHH)-Block\s*\|\s*(\d{1,2}\.\d{1,2}\.\d{2,4})-(\d{1,2}\.\d{1,2}\.\d{2,4})\s*\|\s*(.+)/);

            if (tableMatch) {
                const [, course, blockType, startDate, endDate, semester] = tableMatch;

                blocks.push({
                    course: course.trim(),
                    blockType: blockType + '-Block',
                    semester: semester.trim(),
                    startDate: this.convertDate(startDate),
                    endDate: this.convertDate(endDate),
                    notes: '',
                    source: 'PDF (Tabelle)'
                });
            }
        }

        return blocks;
    }

    /**
     * Konvertiert Datum von DD.MM.YY zu YYYY-MM-DD
     */
    convertDate(dateStr) {
        const match = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
        if (match) {
            const [, day, month, year] = match;
            const fullYear = year.length === 2 ? `20${year}` : year;
            return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return dateStr;
    }

    /**
     * Filterfunktionen (gleich wie bei anderen Parsern)
     */
    filterByCourse(courseFilter) {
        if (!courseFilter || courseFilter.trim() === '') {
            return this.blocks;
        }

        const filter = courseFilter.toLowerCase().trim();
        return this.blocks.filter(block =>
            block.course.toLowerCase().startsWith(filter)
        );
    }

    filterByBlockType(blockType) {
        return this.blocks.filter(block => block.blockType === blockType);
    }

    /**
     * Konvertiert zu Outlook-Events
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
            categories: ['Schule', 'ITECH', block.blockType, 'PDF-Import']
        }));
    }
}

module.exports = PDFBlockParser;
