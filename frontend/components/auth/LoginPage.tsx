'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { keyframes as emotionKeyframes } from '@emotion/react';
import {
    Box,
    Button,
    Card,
    CardBody,
    Container,
    Flex,
    Heading,
    Icon,
    Text,
    VStack,
    useToast,
    Alert,
    AlertIcon,
    AlertDescription,
    HStack,
    SimpleGrid,
} from '@chakra-ui/react';
import { FaCalendarAlt, FaMicrosoft, FaShieldAlt, FaRocket, FaBolt, FaStar, FaChartLine } from 'react-icons/fa';
import { authAPI } from '@/lib/api';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionCard = motion(Card);

// Floating animation
const float = emotionKeyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

// Pulse animation
const pulse = emotionKeyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

// Glow animation
const glow = emotionKeyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(14, 165, 233, 0.5); }
  50% { box-shadow: 0 0 40px rgba(217, 70, 239, 0.8), 0 0 60px rgba(14, 165, 233, 0.5); }
`;

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if user is already authenticated
        const checkAuth = async () => {
            try {
                const session = await authAPI.getSession();
                if (session.authenticated) {
                    router.push('/dashboard');
                }
            } catch (err) {
                // Not authenticated, stay on login page
            }
        };

        checkAuth();

        // Check for error in URL params
        const errorParam = searchParams.get('error');
        if (errorParam) {
            setError(decodeURIComponent(errorParam));
            toast({
                title: 'Fehler bei der Anmeldung',
                description: decodeURIComponent(errorParam),
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    }, [router, searchParams, toast]);

    const handleLogin = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { authUrl } = await authAPI.getLoginUrl();
            window.location.href = authUrl;
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Fehler beim Abrufen der Login-URL';
            setError(errorMessage);
            toast({
                title: 'Fehler',
                description: errorMessage,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            setIsLoading(false);
        }
    };

    return (
        <Box minH="100vh" position="relative" overflow="hidden" bg="#0a0e1a">
            {/* Animated Gradient Background */}
            <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bgGradient="linear(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)"
                opacity="0.15"
                filter="blur(100px)"
                sx={{
                    backgroundSize: '400% 400%',
                    animation: `${pulse} 15s ease infinite`,
                }}
            />

            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
                <MotionBox
                    key={i}
                    position="absolute"
                    w={`${Math.random() * 10 + 5}px`}
                    h={`${Math.random() * 10 + 5}px`}
                    borderRadius="full"
                    bg={i % 2 === 0 ? 'brand.400' : 'accent.400'}
                    opacity="0.3"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                    }}
                    animate={{
                        x: [
                            Math.random() * window.innerWidth,
                            Math.random() * window.innerWidth,
                            Math.random() * window.innerWidth,
                        ],
                        y: [
                            Math.random() * window.innerHeight,
                            Math.random() * window.innerHeight,
                            Math.random() * window.innerHeight,
                        ],
                    }}
                    transition={{
                        duration: Math.random() * 20 + 10,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            ))}

            {/* EINFACHES ZENTRIERTES LAYOUT */}
            <Container maxW="container.md" h="100vh" display="flex" alignItems="center" justifyContent="center" position="relative" zIndex={1}>
                <MotionBox
                    w="full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >

                    {/* DEZENTE LOGIN CARD */}
                    <Card
                        w="full"
                        maxW="md"
                        mx="auto"
                        bg="rgba(30, 41, 59, 0.8)"
                        backdropFilter="blur(10px)"
                        border="1px solid"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        borderRadius="2xl"
                        boxShadow="0 20px 40px rgba(0, 0, 0, 0.4)"
                    >
                        <CardBody p={8}>
                            <VStack spacing={8}>
                                {/* Einfaches Icon */}
                                <Box
                                    p={4}
                                    borderRadius="xl"
                                    bgGradient="linear(to-br, brand.500, accent.500)"
                                    boxShadow="0 8px 16px rgba(102, 126, 234, 0.3)"
                                >
                                    <Icon as={FaCalendarAlt} boxSize={10} color="white" />
                                </Box>

                                {/* Titel */}
                                <VStack spacing={2} textAlign="center">
                                    <Heading size="lg" color="white">
                                        ITECH Blockplan
                                    </Heading>
                                    <Text color="gray.400" fontSize="sm">
                                        Schulblöcke in deinen Kalender importieren
                                    </Text>
                                </VStack>

                                {/* Error Alert */}
                                {error && (
                                    <Alert
                                        status="error"
                                        borderRadius="lg"
                                        bg="rgba(239, 68, 68, 0.1)"
                                        border="1px solid"
                                        borderColor="red.500"
                                    >
                                        <AlertIcon />
                                        <AlertDescription fontSize="sm">{error}</AlertDescription>
                                    </Alert>
                                )}

                                {/* Einfacher Login Button */}
                                <Button
                                    size="lg"
                                    w="full"
                                    leftIcon={<Icon as={FaMicrosoft} boxSize={5} />}
                                    onClick={handleLogin}
                                    isLoading={isLoading}
                                    loadingText="Anmeldung läuft..."
                                    bgGradient="linear(to-r, brand.500, accent.500)"
                                    color="white"
                                    _hover={{
                                        bgGradient: 'linear(to-r, brand.400, accent.400)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: 'lg',
                                    }}
                                >
                                    Mit Microsoft anmelden
                                </Button>

                                {/* Dezenter Hinweis */}
                                <Text fontSize="xs" color="gray.500" textAlign="center">
                                    Sichere Anmeldung über Microsoft
                                </Text>
                            </VStack>
                        </CardBody>
                    </Card>
                </MotionBox>
            </Container>
        </Box>
    );
}

