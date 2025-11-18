'use client';

import {
    Card,
    CardBody,
    Heading,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Box,
    Text,
    VStack,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    List,
    ListItem,
    Icon,
} from '@chakra-ui/react';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { ImportResult } from '@/types';

interface ImportResultsProps {
    result: ImportResult;
}

export default function ImportResults({ result }: ImportResultsProps) {
    return (
        <Card
            bg="linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.08)"
            borderRadius="18px"
            backdropFilter="blur(10px)"
            boxShadow="0 10px 30px rgba(0, 0, 0, 0.35)"
        >
            <CardBody>
                <Heading size="md" mb={4} display="flex" alignItems="center">
                    <Icon as={FaCheckCircle} mr={3} color="brand.500" />
                    Ergebnisse
                </Heading>

                <Alert
                    status="success"
                    borderRadius="md"
                    bg="rgba(61, 163, 93, 0.15)"
                    border="1px solid"
                    borderColor="rgba(61, 163, 93, 0.35)"
                >
                    <AlertIcon />
                    <Box flex="1">
                        <AlertTitle>{result.message}</AlertTitle>
                        <AlertDescription>
                            <VStack align="stretch" spacing={1} mt={2}>
                                <Text>
                                    <strong>Erfolgreich erstellt:</strong> {result.createdEvents.length} Termine
                                </Text>
                                {result.errors && result.errors.length > 0 && (
                                    <Text>
                                        <strong>Fehler:</strong> {result.errors.length}
                                    </Text>
                                )}
                            </VStack>
                        </AlertDescription>
                    </Box>
                </Alert>

                {result.errors && result.errors.length > 0 && (
                    <Box mt={4}>
                        <Accordion allowToggle>
                            <AccordionItem
                                border="1px solid"
                                borderColor="rgba(255, 255, 255, 0.08)"
                                borderRadius="md"
                            >
                                <AccordionButton
                                    _hover={{
                                        bg: 'rgba(255, 255, 255, 0.05)',
                                    }}
                                >
                                    <Box flex="1" textAlign="left" display="flex" alignItems="center">
                                        <Icon as={FaExclamationTriangle} mr={2} color="yellow.400" />
                                        Fehlerdetails anzeigen
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel pb={4}>
                                    <List spacing={2}>
                                        {result.errors.map((error, index) => (
                                            <ListItem
                                                key={index}
                                                p={2}
                                                borderRadius="md"
                                                bg="rgba(255, 255, 255, 0.02)"
                                            >
                                                <Text>
                                                    <strong>{error.event}:</strong> {error.error}
                                                </Text>
                                            </ListItem>
                                        ))}
                                    </List>
                                </AccordionPanel>
                            </AccordionItem>
                        </Accordion>
                    </Box>
                )}
            </CardBody>
        </Card>
    );
}

