'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Icon,
    Input,
    Select,
    Switch,
    Text,
    useToast,
    VStack,
    Tooltip,
} from '@chakra-ui/react';
import { FaCog, FaUser, FaCheckCircle } from 'react-icons/fa';
import { useHelpMode } from '@/contexts/HelpModeContext';
import { blocksAPI } from '@/lib/api';
import CourseSelector from './CourseSelector';
import BlockTypeButtons from './BlockTypeButtons';

interface UserPreferences {
    defaultCourse: string;
    defaultBlockType: string;
    autoLoadBlocks: boolean;
}

export default function SettingsPanel() {
    const toast = useToast();
    const { isHelpModeEnabled } = useHelpMode();

    // User Preferences State
    const [preferences, setPreferences] = useState<UserPreferences>({
        defaultCourse: '',
        defaultBlockType: '',
        autoLoadBlocks: false,
    });
    const [courses, setCourses] = useState<string[]>([]);

    // Load preferences on mount
    useEffect(() => {
        loadPreferences();
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const result = await blocksAPI.getCourses();
            if (result.success) {
                setCourses(result.courses);
            }
        } catch (error) {
            console.error('Fehler beim Laden der Kurse:', error);
        }
    };

    const loadPreferences = () => {
        try {
            const saved = localStorage.getItem('userPreferences');
            if (saved) {
                setPreferences(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Fehler beim Laden der Präferenzen:', error);
        }
    };

    const savePreferences = () => {
        try {
            localStorage.setItem('userPreferences', JSON.stringify(preferences));
            toast({
                title: 'Einstellungen gespeichert',
                description: 'Deine Präferenzen wurden erfolgreich gespeichert.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Fehler beim Speichern',
                description: 'Einstellungen konnten nicht gespeichert werden.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Card
            bg="linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.08)"
            borderRadius="18px"
            backdropFilter="blur(10px)"
            boxShadow="0 10px 30px rgba(0, 0, 0, 0.35)"
        >
            <CardHeader>
                <Heading size="md" display="flex" alignItems="center">
                    <Icon as={FaCog} mr={3} color="brand.500" />
                    Einstellungen
                </Heading>
            </CardHeader>

            <CardBody>
                <VStack spacing={6} align="stretch">
                    <Flex align="center" mb={2}>
                        <Icon as={FaUser} mr={2} color="brand.400" />
                        <Heading size="sm">Meine Präferenzen</Heading>
                    </Flex>

                    <Text color="gray.400">
                        Speichere deine Standard-Einstellungen, um schneller auf relevante Blöcke zuzugreifen.
                    </Text>

                    <FormControl>
                        <FormLabel>Standard-Kurs</FormLabel>
                        <Tooltip
                            label="Dein Kurs wird automatisch vorausgewählt"
                            placement="top"
                            hasArrow
                            bg="brand.600"
                            isDisabled={!isHelpModeEnabled}
                        >
                            <Box>
                                <CourseSelector
                                    courses={courses}
                                    value={preferences.defaultCourse}
                                    onChange={(value) => setPreferences({
                                        ...preferences,
                                        defaultCourse: value
                                    })}
                                />
                            </Box>
                        </Tooltip>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Standard-Block-Typ</FormLabel>
                        <Tooltip
                            label="Der Block-Typ wird automatisch vorausgewählt"
                            placement="top"
                            hasArrow
                            bg="brand.600"
                            isDisabled={!isHelpModeEnabled}
                        >
                            <Box>
                                <BlockTypeButtons
                                    value={preferences.defaultBlockType}
                                    onChange={(value) => setPreferences({
                                        ...preferences,
                                        defaultBlockType: value
                                    })}
                                />
                            </Box>
                        </Tooltip>
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                        <FormLabel mb={0} flex={1}>
                            Blöcke automatisch laden
                        </FormLabel>
                        <Tooltip
                            label="Lädt Blöcke automatisch mit deinen Standard-Einstellungen"
                            placement="top"
                            hasArrow
                            bg="brand.600"
                            isDisabled={!isHelpModeEnabled}
                        >
                            <Switch
                                colorScheme="green"
                                isChecked={preferences.autoLoadBlocks}
                                onChange={(e) => setPreferences({
                                    ...preferences,
                                    autoLoadBlocks: e.target.checked
                                })}
                            />
                        </Tooltip>
                    </FormControl>

                    <Button
                        onClick={savePreferences}
                        bg="linear-gradient(90deg, #3e8914, #3da35d)"
                        color="white"
                        _hover={{
                            bg: 'linear-gradient(90deg, #3da35d, #96e072)',
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg',
                        }}
                    >
                        <Icon as={FaCheckCircle} mr={2} />
                        Einstellungen speichern
                    </Button>
                </VStack>
            </CardBody>
        </Card>
    );
}

