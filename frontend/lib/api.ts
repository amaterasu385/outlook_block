import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth API
export const authAPI = {
    getSession: async () => {
        const response = await apiClient.get('/api/auth/session');
        return response.data;
    },

    getLoginUrl: async () => {
        const response = await apiClient.get('/api/auth/login-url');
        return response.data;
    },

    logout: async () => {
        const response = await apiClient.post('/api/auth/logout');
        return response.data;
    },
};

// Events API
export const eventsAPI = {
    createEvent: async (eventData: any) => {
        const response = await apiClient.post('/api/create-event', eventData);
        return response.data;
    },
};

// Blocks API
export const blocksAPI = {
    getCourses: async () => {
        const response = await apiClient.get('/api/blocks/courses');
        return response.data;
    },

    getFilteredBlocks: async (course?: string, blockType?: string) => {
        const params = new URLSearchParams();
        if (course) params.append('course', course);
        if (blockType) params.append('blockType', blockType);

        const response = await apiClient.get(`/api/blocks/filter?${params.toString()}`);
        return response.data;
    },

    importBlocks: async (selectedBlocks: any[]) => {
        const response = await apiClient.post('/api/import-blocks', { selectedBlocks });
        return response.data;
    },

    scrapeBlocks: async () => {
        const response = await apiClient.get('/api/scrape-blocks');
        return response.data;
    },
};

// Notifications API
export const notificationsAPI = {
    getStatus: async () => {
        const response = await apiClient.get('/api/notifications/status');
        return response.data;
    },

    subscribe: async (method: string, config: any) => {
        const response = await apiClient.post('/api/notifications/subscribe', { method, config });
        return response.data;
    },

    unsubscribe: async () => {
        const response = await apiClient.delete('/api/notifications/unsubscribe');
        return response.data;
    },

    forceCheck: async () => {
        const response = await apiClient.post('/api/notifications/force-check');
        return response.data;
    },
};

// Scraping Strategies API
export const scrapingAPI = {
    getStrategies: async () => {
        const response = await apiClient.get('/api/scraping-strategies');
        return response.data;
    },

    testStrategies: async () => {
        const response = await apiClient.get('/api/test-strategies');
        return response.data;
    },
};

export default apiClient;

