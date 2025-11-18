export interface User {
    name: string;
}

export interface Session {
    authenticated: boolean;
    user?: User;
}

export interface Block {
    course: string;
    blockType: string;
    semester?: string;
    startDate: string;
    endDate: string;
    notes?: string;
}

export interface Course {
    name: string;
}

export interface EventData {
    subject: string;
    description?: string;
    startDate: string;
    startTime?: string;
    endDate: string;
    endTime?: string;
    eventType: 'meeting' | 'absence';
    attendees?: string[];
    isOnlineMeeting?: boolean;
}

export interface ImportResult {
    success: boolean;
    message: string;
    createdEvents: Array<{
        id: string;
        subject: string;
        start: string;
        end: string;
    }>;
    errors: Array<{
        event: string;
        error: string;
    }>;
    totalBlocks: number;
}

export interface ApiError {
    error: string;
    details?: string;
}

