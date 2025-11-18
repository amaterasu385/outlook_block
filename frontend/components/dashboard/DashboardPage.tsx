'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Box,
    Container,
    Heading,
    Spinner,
    Center,
    useToast,
    Text,
    Icon,
} from '@chakra-ui/react';
import { FaRocket } from 'react-icons/fa';
import { authAPI } from '@/lib/api';
import { Session } from '@/types';
import Navbar from '@/components/layout/Navbar';
import BlockImport from '@/components/dashboard/BlockImport';
import SettingsPanel from '@/components/dashboard/SettingsPanel';

const MotionBox = motion(Box);
const MotionContainer = motion(Container);

export default function DashboardPage() {
    const router = useRouter();
    const toast = useToast();
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const sessionData = await authAPI.getSession();
                if (!sessionData.authenticated) {
                    router.push('/');
                } else {
                    setSession(sessionData);
                }
            } catch (err) {
                toast({
                    title: 'Fehler',
                    description: 'Sitzung konnte nicht überprüft werden',
                    status: 'error',
                    duration: 3000,
                });
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router, toast]);

    const handleLogout = async () => {
        try {
            await authAPI.logout();
            toast({
                title: 'Erfolgreich abgemeldet',
                status: 'success',
                duration: 2000,
            });
            router.push('/');
        } catch (err) {
            toast({
                title: 'Fehler beim Abmelden',
                status: 'error',
                duration: 3000,
            });
        }
    };

    if (isLoading) {
        return (
            <Center h="100vh" bgGradient="linear(to-br, #0f172a, #1e293b)">
                <MotionBox
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Box position="relative">
                        <Spinner
                            size="xl"
                            color="brand.400"
                            thickness="4px"
                            speed="0.8s"
                        />
                        <Icon
                            as={FaRocket}
                            position="absolute"
                            top="50%"
                            left="50%"
                            transform="translate(-50%, -50%)"
                            color="brand.400"
                            boxSize={6}
                        />
                    </Box>
                </MotionBox>
            </Center>
        );
    }

    return (
        <Box
            minH="100vh"
            bgGradient="linear(to-br, #0f172a, #1e293b, #0f172a)"
            position="relative"
            overflow="hidden"
        >
            {/* Animated background circles */}
            <MotionBox
                position="absolute"
                top="10%"
                right="5%"
                w="500px"
                h="500px"
                borderRadius="full"
                bgGradient="radial(circle, brand.500, transparent)"
                opacity="0.1"
                filter="blur(100px)"
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <MotionBox
                position="absolute"
                bottom="10%"
                left="5%"
                w="400px"
                h="400px"
                borderRadius="full"
                bgGradient="radial(circle, accent.500, transparent)"
                opacity="0.1"
                filter="blur(100px)"
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, -50, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <Navbar user={session?.user} onLogout={handleLogout} />

            <MotionContainer
                maxW="container.xl"
                py={12}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <MotionBox
                    mb={10}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Heading
                        size="2xl"
                        mb={2}
                        fontWeight="900"
                        bgGradient="linear(to-r, brand.300, accent.300)"
                        bgClip="text"
                    >
                        Dein Dashboard
                    </Heading>
                    <Text color="gray.400" fontSize="lg">
                        Importiere Schulblöcke direkt in deinen Outlook-Kalender
                    </Text>
                </MotionBox>

                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <BlockImport />
                </MotionBox>

                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    mt={10}
                >
                    <SettingsPanel />
                </MotionBox>
            </MotionContainer>
        </Box>
    );
}

