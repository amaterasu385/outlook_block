'use client';

import { motion } from 'framer-motion';
import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Icon,
    Text,
    Tooltip,
} from '@chakra-ui/react';
import { FaRocket, FaSignOutAlt, FaUser, FaQuestionCircle } from 'react-icons/fa';
import { User } from '@/types';
import { useHelpMode } from '@/contexts/HelpModeContext';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

interface NavbarProps {
    user?: User;
    onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
    const { isHelpModeEnabled, toggleHelpMode } = useHelpMode();

    return (
        <MotionBox
            as="nav"
            position="sticky"
            top={0}
            zIndex={100}
            bg="rgba(15, 23, 42, 0.8)"
            backdropFilter="blur(20px)"
            borderBottom="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
        >
            <Container maxW="container.xl" py={4}>
                <Flex justify="space-between" align="center">
                    <MotionFlex
                        align="center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Box
                            p={2}
                            borderRadius="lg"
                            bgGradient="linear(to-br, brand.400, accent.500)"
                            mr={3}
                            boxShadow="0 0 20px rgba(14, 165, 233, 0.3)"
                        >
                            <Icon as={FaRocket} boxSize={5} color="white" />
                        </Box>
                        <Box>
                            <Heading
                                size="md"
                                fontWeight="900"
                                bgGradient="linear(to-r, brand.300, accent.300)"
                                bgClip="text"
                                letterSpacing="tight"
                            >
                                ITECH Blockplan
                            </Heading>
                            <Text fontSize="xs" color="gray.500">
                                Dashboard
                            </Text>
                        </Box>
                    </MotionFlex>

                    <MotionFlex
                        align="center"
                        gap={4}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        {user && (
                            <Tooltip
                                label="Angemeldet mit deinem Microsoft-Konto"
                                placement="bottom"
                                hasArrow
                                bg="brand.600"
                                isDisabled={!isHelpModeEnabled}
                            >
                                <Flex
                                    align="center"
                                    px={4}
                                    py={2}
                                    borderRadius="xl"
                                    bg="rgba(255, 255, 255, 0.05)"
                                    border="1px solid"
                                    borderColor="rgba(255, 255, 255, 0.1)"
                                >
                                    <Icon as={FaUser} color="brand.400" mr={2} boxSize={4} />
                                    <Text fontSize="sm" color="gray.300">
                                        {user.name}
                                    </Text>
                                </Flex>
                            </Tooltip>
                        )}
                        <Tooltip
                            label={isHelpModeEnabled ? "Hilfe-Tipps ausblenden" : "Hilfe-Tipps einblenden"}
                            placement="bottom"
                            hasArrow
                            bg="brand.600"
                        >
                            <Button
                                leftIcon={<Icon as={FaQuestionCircle} />}
                                variant="ghost"
                                size="sm"
                                color={isHelpModeEnabled ? "brand.400" : "gray.400"}
                                _hover={{
                                    color: 'brand.300',
                                    bg: 'rgba(14, 165, 233, 0.1)',
                                    borderColor: 'brand.500',
                                }}
                                border="1px solid"
                                borderColor={isHelpModeEnabled ? "brand.500" : "rgba(255, 255, 255, 0.1)"}
                                borderRadius="xl"
                                onClick={toggleHelpMode}
                            >
                                Hilfe
                            </Button>
                        </Tooltip>
                        <Button
                            leftIcon={<Icon as={FaSignOutAlt} />}
                            variant="ghost"
                            size="sm"
                            color="gray.400"
                            _hover={{
                                color: 'white',
                                bg: 'rgba(220, 38, 38, 0.2)',
                                borderColor: 'red.500',
                            }}
                            border="1px solid"
                            borderColor="rgba(255, 255, 255, 0.1)"
                            borderRadius="xl"
                            onClick={onLogout}
                        >
                            Abmelden
                        </Button>
                    </MotionFlex>
                </Flex>
            </Container>
        </MotionBox>
    );
}

