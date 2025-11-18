'use client';

import { Button, ButtonGroup, Box } from '@chakra-ui/react';

interface BlockTypeButtonsProps {
    value: string;
    onChange: (value: string) => void;
}

const blockTypes = [
    { value: '', label: 'Alle' },
    { value: 'A-Block', label: 'A-Block' },
    { value: 'B-Block', label: 'B-Block' },
    { value: 'C-Block', label: 'C-Block' },
    { value: 'BHH-Block', label: 'BHH' },
];

export default function BlockTypeButtons({ value, onChange }: BlockTypeButtonsProps) {
    return (
        <ButtonGroup
            isAttached
            variant="outline"
            width="100%"
            spacing={0}
        >
            {blockTypes.map((type) => (
                <Button
                    key={type.value}
                    onClick={() => onChange(type.value)}
                    flex={1}
                    size="md"
                    bg={value === type.value ? 'linear-gradient(90deg, #3e8914, #3da35d)' : 'transparent'}
                    color={value === type.value ? 'white' : 'gray.300'}
                    borderColor={value === type.value ? 'brand.500' : 'rgba(255, 255, 255, 0.1)'}
                    _hover={{
                        bg: value === type.value
                            ? 'linear-gradient(90deg, #3da35d, #96e072)'
                            : 'rgba(61, 163, 93, 0.1)',
                        borderColor: 'brand.400',
                        transform: 'translateY(-1px)',
                    }}
                    transition="all 0.2s"
                    fontWeight={value === type.value ? 'bold' : 'normal'}
                    fontSize={{ base: 'xs', md: 'sm' }}
                >
                    {type.label}
                </Button>
            ))}
        </ButtonGroup>
    );
}

