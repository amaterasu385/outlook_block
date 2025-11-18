import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
    initialColorMode: 'dark',
    useSystemColorMode: false,
};

const theme = extendTheme({
    config,
    colors: {
        brand: {
            50: '#e0f2fe',
            100: '#bae6fd',
            200: '#7dd3fc',
            300: '#38bdf8',
            400: '#0ea5e9',
            500: '#0284c7',
            600: '#0369a1',
            700: '#075985',
            800: '#0c4a6e',
            900: '#082f49',
        },
        accent: {
            50: '#fdf4ff',
            100: '#fae8ff',
            200: '#f5d0fe',
            300: '#f0abfc',
            400: '#e879f9',
            500: '#d946ef',
            600: '#c026d3',
            700: '#a21caf',
            800: '#86198f',
            900: '#701a75',
        },
        background: {
            primary: '#0f172a',
            secondary: '#1e293b',
            card: '#1e293b',
        },
    },
    styles: {
        global: {
            body: {
                bg: 'background.primary',
                color: 'brand.50',
            },
        },
    },
    components: {
        Button: {
            baseStyle: {
                fontWeight: 'bold',
                borderRadius: '16px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            variants: {
                solid: {
                    bgGradient: 'linear(to-r, brand.500, accent.500)',
                    color: 'white',
                    _hover: {
                        bgGradient: 'linear(to-r, brand.400, accent.400)',
                        transform: 'translateY(-3px) scale(1.02)',
                        boxShadow: '0 20px 40px -12px rgba(14, 165, 233, 0.5)',
                    },
                    _active: {
                        transform: 'translateY(-1px) scale(0.98)',
                    },
                },
                outline: {
                    borderColor: 'brand.500',
                    color: 'brand.50',
                    _hover: {
                        bg: 'brand.500',
                        color: 'background.primary',
                    },
                },
            },
        },
        Card: {
            baseStyle: {
                container: {
                    bg: 'linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))',
                    border: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '18px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                },
            },
        },
        Input: {
            variants: {
                filled: {
                    field: {
                        bg: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid',
                        borderColor: 'rgba(255, 255, 255, 0.12)',
                        color: 'brand.50',
                        _hover: {
                            bg: 'rgba(255, 255, 255, 0.06)',
                        },
                        _focus: {
                            bg: 'rgba(255, 255, 255, 0.06)',
                            borderColor: 'brand.500',
                            boxShadow: '0 0 0 1px #3da35d',
                        },
                    },
                },
            },
            defaultProps: {
                variant: 'filled',
            },
        },
        Select: {
            variants: {
                filled: {
                    field: {
                        bg: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid',
                        borderColor: 'rgba(255, 255, 255, 0.12)',
                        color: 'brand.50',
                        _hover: {
                            bg: 'rgba(255, 255, 255, 0.06)',
                        },
                        _focus: {
                            bg: 'rgba(255, 255, 255, 0.06)',
                            borderColor: 'brand.500',
                            boxShadow: '0 0 0 1px #3da35d',
                        },
                    },
                },
            },
            defaultProps: {
                variant: 'filled',
            },
        },
    },
});

export default theme;

