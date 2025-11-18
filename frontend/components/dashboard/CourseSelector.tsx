'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    ButtonGroup,
    Text,
    SimpleGrid,
    VStack,
    HStack,
    Badge,
    Icon,
} from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';

interface CourseSelectorProps {
    courses: string[];
    value: string;
    onChange: (value: string) => void;
    isDisabled?: boolean;
}

export default function CourseSelector({
    courses,
    value,
    onChange,
    isDisabled = false,
}: CourseSelectorProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [categories, setCategories] = useState<string[]>([]);
    const [coursesByCategory, setCoursesByCategory] = useState<Record<string, string[]>>({});

    useEffect(() => {
        // Gruppiere Kurse nach Kategorie (IT, CK, etc.)
        const grouped: Record<string, string[]> = {};
        courses.forEach(course => {
            const match = course.match(/^([A-Z]+)\s/);
            const category = match ? match[1] : 'Andere';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(course);
        });

        setCoursesByCategory(grouped);
        setCategories(Object.keys(grouped).sort());

        // Setze Kategorie basierend auf aktuellem Wert
        if (value) {
            const match = value.match(/^([A-Z]+)\s/);
            if (match) {
                setSelectedCategory(match[1]);
            }
        }
    }, [courses, value]);

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
    };

    const handleCourseSelect = (course: string) => {
        onChange(course);
    };

    const handleClear = () => {
        onChange('');
        setSelectedCategory('');
    };

    return (
        <VStack align="stretch" spacing={3}>
            {/* Ausgewählter Kurs anzeigen */}
            {value && (
                <HStack
                    p={3}
                    borderRadius="md"
                    bg="rgba(61, 163, 93, 0.15)"
                    border="1px solid"
                    borderColor="brand.400"
                    justify="space-between"
                >
                    <HStack>
                        <Badge colorScheme="green" fontSize="sm" px={2} py={1}>
                            Ausgewählt
                        </Badge>
                        <Text fontWeight="bold" color="brand.300">
                            {value}
                        </Text>
                    </HStack>
                    <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={handleClear}
                        leftIcon={<Icon as={FaTimes} />}
                    >
                        Löschen
                    </Button>
                </HStack>
            )}

            {/* Kategorie-Auswahl */}
            {!value && (
                <>
                    <Text fontSize="sm" color="gray.400">
                        1. Wähle eine Kategorie:
                    </Text>
                    <ButtonGroup spacing={2} flexWrap="wrap">
                        {categories.map((category) => (
                            <Button
                                key={category}
                                onClick={() => handleCategorySelect(category)}
                                size="md"
                                bg={selectedCategory === category ? 'linear-gradient(90deg, #3e8914, #3da35d)' : 'transparent'}
                                color={selectedCategory === category ? 'white' : 'gray.300'}
                                borderColor={selectedCategory === category ? 'brand.500' : 'rgba(255, 255, 255, 0.1)'}
                                border="1px solid"
                                _hover={{
                                    bg: selectedCategory === category
                                        ? 'linear-gradient(90deg, #3da35d, #96e072)'
                                        : 'rgba(61, 163, 93, 0.1)',
                                    borderColor: 'brand.400',
                                    transform: 'translateY(-1px)',
                                }}
                                transition="all 0.2s"
                                fontWeight={selectedCategory === category ? 'bold' : 'normal'}
                                minW="80px"
                            >
                                {category}
                                <Badge ml={2} fontSize="xs" bg="rgba(255,255,255,0.2)">
                                    {coursesByCategory[category].length}
                                </Badge>
                            </Button>
                        ))}
                    </ButtonGroup>
                </>
            )}

            {/* Kurs-Auswahl */}
            {!value && selectedCategory && coursesByCategory[selectedCategory] && (
                <>
                    <Text fontSize="sm" color="gray.400" mt={2}>
                        2. Wähle deinen Kurs:
                    </Text>
                    <SimpleGrid columns={{ base: 3, md: 5, lg: 6 }} spacing={2}>
                        {coursesByCategory[selectedCategory].map((course) => (
                            <Button
                                key={course}
                                onClick={() => handleCourseSelect(course)}
                                size="md"
                                bg="transparent"
                                color="gray.300"
                                borderColor="rgba(255, 255, 255, 0.1)"
                                border="1px solid"
                                _hover={{
                                    bg: 'rgba(61, 163, 93, 0.2)',
                                    borderColor: 'brand.400',
                                    transform: 'scale(1.05)',
                                    color: 'brand.300',
                                }}
                                transition="all 0.2s"
                                fontSize="sm"
                                isDisabled={isDisabled}
                            >
                                {course.replace(`${selectedCategory} `, '')}
                            </Button>
                        ))}
                    </SimpleGrid>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedCategory('')}
                        mt={2}
                    >
                        ← Zurück zur Kategorie-Auswahl
                    </Button>
                </>
            )}

            {/* "Alle Kurse" Option wenn nichts ausgewählt */}
            {!value && !selectedCategory && (
                <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
                    Keine Auswahl = Alle Kurse werden angezeigt
                </Text>
            )}
        </VStack>
    );
}

