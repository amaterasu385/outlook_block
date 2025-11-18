'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
    Icon,
    Select,
    SimpleGrid,
    Text,
    useToast,
    VStack,
    HStack,
    Alert,
    AlertIcon,
    AlertDescription,
    Spinner,
    Tooltip,
} from '@chakra-ui/react';
import { FaSchool, FaSearch, FaCheckSquare, FaSquare, FaCalendarPlus } from 'react-icons/fa';
import { blocksAPI } from '@/lib/api';
import { Block } from '@/types';
import BlockCard from './BlockCard';
import ImportResults from './ImportResults';
import { useHelpMode } from '@/contexts/HelpModeContext';
import CourseSelector from './CourseSelector';
import BlockTypeButtons from './BlockTypeButtons';

export default function BlockImport() {
    const toast = useToast();
    const { isHelpModeEnabled } = useHelpMode();
    const [courses, setCourses] = useState<string[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedBlockType, setSelectedBlockType] = useState<string>('');
    const [selectedBlocks, setSelectedBlocks] = useState<Set<number>>(new Set());
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [showBlocks, setShowBlocks] = useState(false);
    const [importResult, setImportResult] = useState<any>(null);
    const [statusMessage, setStatusMessage] = useState<string>('');

    // Kurse beim Laden laden und Präferenzen anwenden
    useEffect(() => {
        loadCourses();
        loadUserPreferences();
    }, []);

    // Präferenzen laden und anwenden
    const loadUserPreferences = async () => {
        try {
            const saved = localStorage.getItem('userPreferences');
            if (saved) {
                const prefs = JSON.parse(saved);

                // Standard-Filter setzen
                const courseToUse = prefs.defaultCourse || '';
                const blockTypeToUse = prefs.defaultBlockType || '';

                setSelectedCourse(courseToUse);
                setSelectedBlockType(blockTypeToUse);

                // Automatisch laden, wenn aktiviert
                if (prefs.autoLoadBlocks && (courseToUse || blockTypeToUse)) {
                    // Kurze Verzögerung, damit die Kurse geladen sind
                    setTimeout(() => {
                        // Direkt mit den Werten aus localStorage laden
                        loadBlocksWithFilters(courseToUse, blockTypeToUse);
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Fehler beim Laden der Präferenzen:', error);
        }
    };

    const loadCourses = async () => {
        setIsLoadingCourses(true);
        try {
            const result = await blocksAPI.getCourses();
            if (result.success) {
                setCourses(result.courses);
                // Keine Status-Nachricht beim automatischen Laden im Hintergrund
            }
        } catch (err: any) {
            toast({
                title: 'Fehler beim Laden der Kurse',
                description: err.response?.data?.error || err.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoadingCourses(false);
        }
    };

    // Hilfsfunktion zum Laden mit spezifischen Filtern
    const loadBlocksWithFilters = async (course?: string, blockType?: string) => {
        setIsLoadingBlocks(true);
        setStatusMessage('Lade Blöcke...');
        try {
            const result = await blocksAPI.getFilteredBlocks(
                course || undefined,
                blockType || undefined
            );

            if (result.success) {
                setBlocks(result.blocks);
                setShowBlocks(true);
                const filterInfo = [];
                if (course) filterInfo.push(`Kurs: ${course}`);
                if (blockType) filterInfo.push(`Typ: ${blockType}`);
                const filterText = filterInfo.length > 0 ? ` (${filterInfo.join(', ')})` : '';
                setStatusMessage(`Blöcke geladen: ${result.total}${filterText}`);
                setSelectedBlocks(new Set()); // Reset selection
            }
        } catch (err: any) {
            toast({
                title: 'Fehler beim Laden der Blöcke',
                description: err.response?.data?.error || err.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            setStatusMessage('Fehler beim Laden der Blöcke');
        } finally {
            setIsLoadingBlocks(false);
        }
    };

    const loadBlocks = async () => {
        await loadBlocksWithFilters(selectedCourse, selectedBlockType);
    };

    const toggleBlockSelection = (index: number) => {
        const newSelection = new Set(selectedBlocks);
        if (newSelection.has(index)) {
            newSelection.delete(index);
        } else {
            newSelection.add(index);
        }
        setSelectedBlocks(newSelection);
    };

    const selectAllBlocks = () => {
        const allIndices = blocks.map((_, index) => index);
        setSelectedBlocks(new Set(allIndices));
    };

    const deselectAllBlocks = () => {
        setSelectedBlocks(new Set());
    };

    const importSelectedBlocks = async () => {
        if (selectedBlocks.size === 0) {
            toast({
                title: 'Keine Blöcke ausgewählt',
                description: 'Bitte wählen Sie mindestens einen Block aus.',
                status: 'warning',
                duration: 3000,
            });
            return;
        }

        setIsImporting(true);
        try {
            const blocksToImport = Array.from(selectedBlocks).map(index => blocks[index]);
            const result = await blocksAPI.importBlocks(blocksToImport);

            if (result.success) {
                setImportResult(result);
                toast({
                    title: 'Import erfolgreich',
                    description: result.message,
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (err: any) {
            toast({
                title: 'Fehler beim Importieren',
                description: err.response?.data?.error || err.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <VStack spacing={6} align="stretch">
            {/* Main Card */}
            <Card
                bg="linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.08)"
                borderRadius="18px"
                backdropFilter="blur(10px)"
                boxShadow="0 10px 30px rgba(0, 0, 0, 0.35)"
            >
                <CardHeader>
                    <Flex justify="space-between" align="center">
                        <Heading size="md" display="flex" alignItems="center">
                            <Icon as={FaSchool} mr={3} color="brand.500" />
                            ITECH Blockplanung Import
                        </Heading>
                        <Tooltip
                            label="Lädt die verfügbaren Schulblöcke von ITECH basierend auf den gewählten Filtern"
                            placement="left"
                            hasArrow
                            bg="brand.600"
                            isDisabled={!isHelpModeEnabled}
                        >
                            <Button
                                leftIcon={<Icon as={FaSearch} />}
                                onClick={loadBlocks}
                                isLoading={isLoadingBlocks}
                                loadingText="Lädt..."
                                bg="linear-gradient(90deg, #3e8914, #3da35d)"
                                color="white"
                                _hover={{
                                    bg: 'linear-gradient(90deg, #3da35d, #96e072)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: 'lg',
                                }}
                            >
                                Blöcke laden
                            </Button>
                        </Tooltip>
                    </Flex>
                </CardHeader>

                <CardBody>
                    {/* Status Message */}
                    {statusMessage && (
                        <Alert status="info" mb={4} borderRadius="md" bg="rgba(61, 163, 93, 0.15)">
                            <AlertIcon />
                            <AlertDescription>{statusMessage}</AlertDescription>
                        </Alert>
                    )}

                    {/* Filters */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                        <Box>
                            <Text mb={3} fontWeight="medium" fontSize="lg">Kurs auswählen</Text>
                            <Tooltip
                                label="Wähle zuerst eine Kategorie, dann deinen spezifischen Kurs"
                                placement="top"
                                hasArrow
                                bg="brand.600"
                                isDisabled={!isHelpModeEnabled}
                            >
                                <Box>
                                    <CourseSelector
                                        courses={courses}
                                        value={selectedCourse}
                                        onChange={setSelectedCourse}
                                        isDisabled={isLoadingCourses}
                                    />
                                </Box>
                            </Tooltip>
                        </Box>

                        <Box>
                            <Text mb={3} fontWeight="medium" fontSize="lg">Block-Typ</Text>
                            <Tooltip
                                label="Wähle den Block-Typ oder 'Alle' für alle Typen"
                                placement="top"
                                hasArrow
                                bg="brand.600"
                                isDisabled={!isHelpModeEnabled}
                            >
                                <Box>
                                    <BlockTypeButtons
                                        value={selectedBlockType}
                                        onChange={setSelectedBlockType}
                                    />
                                </Box>
                            </Tooltip>
                        </Box>

                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 1 }} spacing={4} mb={6}>
                        <Box>
                            <Text mb={2} fontWeight="medium">Schnellaktionen</Text>
                            <HStack spacing={2}>
                                <Tooltip
                                    label="Alle gefundenen Blöcke auswählen"
                                    placement="top"
                                    hasArrow
                                    bg="brand.600"
                                    isDisabled={!isHelpModeEnabled}
                                >
                                    <Button
                                        leftIcon={<Icon as={FaCheckSquare} />}
                                        variant="outline"
                                        size="sm"
                                        onClick={selectAllBlocks}
                                        isDisabled={blocks.length === 0}
                                        flex={1}
                                    >
                                        Alle
                                    </Button>
                                </Tooltip>
                                <Tooltip
                                    label="Alle Auswahlen entfernen"
                                    placement="top"
                                    hasArrow
                                    bg="brand.600"
                                    isDisabled={!isHelpModeEnabled}
                                >
                                    <Button
                                        leftIcon={<Icon as={FaSquare} />}
                                        variant="outline"
                                        size="sm"
                                        onClick={deselectAllBlocks}
                                        isDisabled={blocks.length === 0}
                                        flex={1}
                                    >
                                        Keine
                                    </Button>
                                </Tooltip>
                            </HStack>
                        </Box>
                    </SimpleGrid>

                    {/* Blocks Grid */}
                    {showBlocks && (
                        <Box>
                            <Flex justify="space-between" align="center" mb={4}>
                                <Heading size="sm">Gefundene Blöcke:</Heading>
                                <Text color="brand.400" fontSize="sm">
                                    {selectedBlocks.size} von {blocks.length} ausgewählt
                                </Text>
                            </Flex>

                            {blocks.length === 0 ? (
                                <Alert status="info" borderRadius="md">
                                    <AlertIcon />
                                    <AlertDescription>Keine Blöcke gefunden.</AlertDescription>
                                </Alert>
                            ) : (
                                <>
                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={6}>
                                        {blocks.map((block, index) => (
                                            <BlockCard
                                                key={index}
                                                block={block}
                                                isSelected={selectedBlocks.has(index)}
                                                onToggle={() => toggleBlockSelection(index)}
                                            />
                                        ))}
                                    </SimpleGrid>

                                    <Tooltip
                                        label="Importiert die ausgewählten Blöcke als Abwesenheitstermine in deinen Outlook-Kalender"
                                        placement="top"
                                        hasArrow
                                        bg="brand.600"
                                        isDisabled={!isHelpModeEnabled}
                                    >
                                        <Button
                                            leftIcon={<Icon as={FaCalendarPlus} />}
                                            onClick={importSelectedBlocks}
                                            isLoading={isImporting}
                                            loadingText="Importiere..."
                                            isDisabled={selectedBlocks.size === 0}
                                            size="lg"
                                            bg="linear-gradient(90deg, #3e8914, #3da35d)"
                                            color="white"
                                            _hover={{
                                                bg: 'linear-gradient(90deg, #3da35d, #96e072)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: 'lg',
                                            }}
                                        >
                                            Ausgewählte importieren ({selectedBlocks.size})
                                        </Button>
                                    </Tooltip>
                                </>
                            )}
                        </Box>
                    )}
                </CardBody>
            </Card>

            {/* Import Results */}
            {importResult && <ImportResults result={importResult} />}
        </VStack>
    );
}

