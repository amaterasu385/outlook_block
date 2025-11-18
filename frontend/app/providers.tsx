'use client';

import { ChakraProvider } from '@chakra-ui/react';
import theme from '@/lib/theme';
import { HelpModeProvider } from '@/contexts/HelpModeContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ChakraProvider theme={theme}>
            <HelpModeProvider>
                {children}
            </HelpModeProvider>
        </ChakraProvider>
    );
}

