/**
 * ITECH Blockplanung Parser
 * Parst die bekannten Blockdaten von der ITECH Website
 */
class ITechBlockParser {
    constructor() {
        this.blocks = [];
    }

    /**
     * Parst die Blockdaten basierend auf den bekannten Informationen
     */
    parseBlocks() {
        this.blocks = [];

        // Blockzeiten Winterhalbjahr (Sep – Feb) 2025/26
        this.addBlocksForSemester('Winterhalbjahr 2025/26', [
            {
                blockType: 'A-Block',
                courses: ['CK 2a', 'CK 3a', 'CK 3b', 'KT 3a', 'PH 2a', 'UT 3a', 'IT 3a', 'IT 3b', 'IT 3c', 'IT 3d', 'IT 3e', 'IT 3f', 'IT 3g', 'IT 3h', 'IT 3i', 'IT 3j', 'IT 3k', 'IT 3l', 'IT 3m', 'IT 3n', 'IT 3o', 'IT 3p', 'IT 3s', 'IT 3x', 'IT 3y', 'IT 3z'],
                timeRanges: [
                    { start: '2025-09-04', end: '2025-09-25', notes: 'Organisationstag: 26.09.25' },
                    { start: '2025-11-24', end: '2025-12-12', notes: '' }
                ]
            },
            {
                blockType: 'B-Block',
                courses: ['CK 4a', 'CK 4b', 'KT 4a', 'PC 4a', 'PH 4a', 'UT 4a', 'IT 4a', 'IT 4b', 'IT 4c', 'IT 4d', 'IT 4g', 'IT 4h', 'IT 4i', 'IT 4j', 'IT 4k', 'IT 4l', 'IT 4n', 'IT 4o', 'IT 4p', 'IT 4r', 'IT 4s', 'IT 4x', 'IT 4y', 'IT 4z'],
                timeRanges: [
                    { start: '2025-09-29', end: '2025-10-17', notes: 'Herbstferien: 20.10. – 30.10.25' },
                    { start: '2025-12-15', end: '2025-12-16', notes: '' },
                    { start: '2026-01-05', end: '2026-01-22', notes: 'Weihnachtsferien: 17.12.25 – 02.01.26, Organisationstag: 23.01.26' }
                ]
            },
            {
                blockType: 'C-Block',
                courses: ['A 2a', 'CK 5a', 'CK 5b', 'KT 5a', 'PC 5a', 'PH 5a', 'UT 5a', 'IT 5a', 'IT 5b', 'IT 5c', 'IT 5d', 'IT 5g', 'IT 5h', 'IT 5i', 'IT 5j', 'IT 5k', 'IT 5l', 'IT 5n', 'IT 5o', 'IT 5p', 'IT 5r', 'IT 5s', 'IT 5x', 'IT 5y', 'IT 5z'],
                timeRanges: [
                    { start: '2025-11-03', end: '2025-11-21', notes: '' },
                    { start: '2026-01-26', end: '2026-02-13', notes: 'Organisationstag: 23.01.26, Ferientag/Halbjahrespause: 30.01.26' }
                ]
            },
            {
                blockType: 'BHH-Block',
                courses: ['BH 3a', 'BH 3b'],
                timeRanges: [
                    { start: '2025-09-04', end: '2025-10-19', notes: '' },
                    { start: '2026-02-02', end: '2026-04-05', notes: 'Frühjahresferien: 28.02. – 15.03.2026' }
                ]
            }
        ]);

        // Blockzeiten Sommerhalbjahr (Feb – Jul) 2026
        this.addBlocksForSemester('Sommerhalbjahr 2026', [
            {
                blockType: 'A-Block',
                courses: ['CK 3a', 'CK 3b', 'KT 3a', 'UT 3a', 'IT 3a', 'IT 3b', 'IT 3c', 'IT 3d', 'IT 3e', 'IT 3g', 'IT 3h', 'IT 3i', 'IT 3j', 'IT 3k', 'IT 3l', 'IT 3n', 'IT 3o', 'IT 3p', 'IT 3r', 'IT 3s', 'IT 4x', 'IT 4y', 'IT 4z'],
                timeRanges: [
                    { start: '2026-02-16', end: '2026-02-27', notes: '' },
                    { start: '2026-03-16', end: '2026-03-20', notes: 'Märzferien: 02.03. – 13.03.26' },
                    { start: '2026-05-04', end: '2026-05-08', notes: '' },
                    { start: '2026-05-18', end: '2026-05-29', notes: 'Maiferien: 11.05. – 15.05.26' }
                ]
            },
            {
                blockType: 'B-Block',
                courses: ['CK 4a', 'CK 4b', 'KT 4a', 'PH 4a', 'UT 4a', 'IT 4a', 'IT 4b', 'IT 4c', 'IT 4d', 'IT 4g', 'IT 4h', 'IT 4i', 'IT 4j', 'IT 4k', 'IT 4l', 'IT 4n', 'IT 4o', 'IT 4p', 'IT 4r', 'IT 4s', 'IT 5x', 'IT 5y', 'IT 5z'],
                timeRanges: [
                    { start: '2026-03-02', end: '2026-03-13', notes: '' },
                    { start: '2026-06-01', end: '2026-06-19', notes: 'Organisationstag: 22.06.26' }
                ]
            },
            {
                blockType: 'C-Block',
                courses: ['CK 5a', 'CK 5b', 'KT 5a', 'PH 5a', 'UT 5a', 'IT 5a', 'IT 5b', 'IT 5c', 'IT 5d', 'IT 5g', 'IT 5h', 'IT 5i', 'IT 5j', 'IT 5k', 'IT 5l', 'IT 5n', 'IT 5o', 'IT 5p', 'IT 5r', 'IT 5s', 'IT 6x', 'IT 6y', 'IT 6z'],
                timeRanges: [
                    { start: '2026-03-23', end: '2026-04-17', notes: '' },
                    { start: '2026-06-22', end: '2026-07-10', notes: '' }
                ]
            }
        ]);

        // Weitere Semester können hier hinzugefügt werden...

        console.log(`✅ ${this.blocks.length} Blöcke erfolgreich geparst`);
        return this.blocks;
    }

    /**
     * Fügt Blöcke für ein Semester hinzu
     */
    addBlocksForSemester(semester, blockDefinitions) {
        blockDefinitions.forEach(blockDef => {
            blockDef.courses.forEach(course => {
                blockDef.timeRanges.forEach(timeRange => {
                    this.blocks.push({
                        course: course,
                        blockType: blockDef.blockType,
                        semester: semester,
                        startDate: timeRange.start,
                        endDate: timeRange.end,
                        notes: timeRange.notes || '',
                        source: 'ITECH Blockplanung (Parsed)'
                    });
                });
            });
        });
    }

    /**
     * Filtert Blöcke nach Kurs
     */
    filterByCourse(courseFilter) {
        if (!courseFilter || courseFilter.trim() === '') {
            return this.blocks;
        }

        const filter = courseFilter.toLowerCase().trim();

        return this.blocks.filter(block => {
            const course = block.course.toLowerCase();

            // Exakte Übereinstimmung hat Priorität
            if (course === filter) {
                return true;
            }

            // Beginnt mit dem Filter (z.B. "IT 3" findet "IT 3a", "IT 3b", etc.)
            if (course.startsWith(filter)) {
                return true;
            }

            // Für Eingaben wie "IT3" ohne Leerzeichen
            const filterNoSpace = filter.replace(/\s+/g, '');
            const courseNoSpace = course.replace(/\s+/g, '');
            if (courseNoSpace.startsWith(filterNoSpace)) {
                return true;
            }

            return false;
        });
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
        const toIso = (d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };

        const buildEvent = (block, startInclusiveDate, endInclusiveDate) => {
            const endExclusive = new Date(endInclusiveDate);
            endExclusive.setDate(endExclusive.getDate() + 1);
            const startStr = toIso(startInclusiveDate);
            const endExclusiveStr = toIso(endExclusive);
            const endInclusiveStr = toIso(endInclusiveDate);

            // Format: DD.MM.YYYY für bessere Lesbarkeit
            const formatDate = (dateStr) => {
                const [y, m, d] = dateStr.split('-');
                return `${d}.${m}.${y}`;
            };

            return {
                subject: `${block.course} - ${block.blockType} (${formatDate(startStr)} - ${formatDate(endInclusiveStr)})`,
                body: {
                    contentType: 'HTML',
                    content: `
                    <h3>${block.course} - ${block.blockType}</h3>
                    <p><strong>Semester:</strong> ${block.semester}</p>
                    <p><strong>Zeitraum:</strong> ${startStr} bis ${endInclusiveStr}</p>
                    ${block.notes ? `<p><strong>Hinweise:</strong> ${block.notes}</p>` : ''}
                    <p><em>Quelle: ${block.source}</em></p>
                `
                },
                start: { dateTime: `${startStr}T00:00:00`, timeZone: 'Europe/Berlin' },
                end: { dateTime: `${endExclusiveStr}T00:00:00`, timeZone: 'Europe/Berlin' },
                isAllDay: true,
                showAs: 'oof',
                categories: ['Schule', 'ITECH', block.blockType]
            };
        };

        const events = [];

        // Pro Block wird 1 Event erstellt für den gesamten Zeitraum (inkl. Wochenenden)
        for (const block of blocks) {
            const start = new Date(`${block.startDate}T00:00:00`);
            const end = new Date(`${block.endDate}T00:00:00`);

            events.push(buildEvent(block, start, end));
        }

        return events;
    }
}

module.exports = ITechBlockParser;
