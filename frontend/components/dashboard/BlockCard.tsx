'use client';

import {
    Box,
    Badge,
    Checkbox,
    Text,
    VStack,
} from '@chakra-ui/react';
import { Block } from '@/types';

interface BlockCardProps {
    block: Block;
    isSelected: boolean;
    onToggle: () => void;
}

export default function BlockCard({ block, isSelected, onToggle }: BlockCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('de-DE');
    };

    return (
        <Box
            position="relative"
            p={4}
            borderRadius="14px"
            bg="linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))"
            border="1px solid"
            borderColor={isSelected ? 'brand.500' : 'rgba(255, 255, 255, 0.08)'}
            cursor="pointer"
            onClick={onToggle}
            transition="all 0.2s"
            _hover={{
                boxShadow: '0 10px 24px rgba(0, 0, 0, 0.25)',
                borderColor: isSelected ? 'brand.500' : 'rgba(255, 255, 255, 0.18)',
                transform: 'translateY(-2px)',
            }}
        >
            <Checkbox
                position="absolute"
                top={3}
                right={3}
                isChecked={isSelected}
                onChange={onToggle}
                onClick={(e) => e.stopPropagation()}
                colorScheme="green"
                size="lg"
            />

            <VStack align="stretch" spacing={2}>
                <Text fontWeight="700" fontSize="lg" pr={8}>
                    {block.course} - {block.blockType}
                </Text>

                {block.semester && (
                    <Text color="brand.400" fontSize="sm">
                        {block.semester}
                    </Text>
                )}

                <Badge
                    display="inline-block"
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg="rgba(61, 163, 93, 0.15)"
                    color="brand.50"
                    border="1px solid"
                    borderColor="rgba(61, 163, 93, 0.35)"
                    fontSize="xs"
                    fontWeight="medium"
                >
                    {formatDate(block.startDate)} - {formatDate(block.endDate)}
                </Badge>

                {block.notes && (
                    <Text color="brand.400" fontSize="sm" mt={2}>
                        {block.notes}
                    </Text>
                )}
            </VStack>
        </Box>
    );
}

