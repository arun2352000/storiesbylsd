const AALY_BASE_URL = 'https://api.aaly.io/arunachalam_organization/lsd_portfolio';

export const api = {
    // Get all projects via Aaly Custom Public Endpoint
    getAllProjects: async () => {
        try {
            const response = await fetch(`${AALY_BASE_URL}/portfolio_items/public`);
            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }
            const data = await response.json();
            // Map Aaly structure to the expected frontend structure if necessary
            // Aaly collections return { items: [...] }
            return data.items || [];
        } catch (error) {
            console.error('API failed:', error);
            return [];
        }
    },

    // Get single project by ID using the new detail endpoint to fetch fully hydrated 100 images
    getProjectById: async (id) => {
        try {
            const response = await fetch(`${AALY_BASE_URL}/portfolio_items/public-detail`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (!response.ok) {
                throw new Error('Project not found');
            }
            return await response.json();
        } catch (error) {
            console.error('API failed:', error);
            throw error;
        }
    },

    // Get site config
    getSiteConfig: async () => {
        try {
            const response = await fetch(`${AALY_BASE_URL}/site_config/public`);
            if (!response.ok) {
                return null;
            }
            const data = await response.json();
            return (data.items && data.items.length > 0) ? data.items[0] : null;
        } catch (error) {
            console.error('API failed:', error);
            return null;
        }
    },

    // Get all films
    getAllFilms: async () => {
        try {
            const response = await fetch(`${AALY_BASE_URL}/films/public`);
            if (!response.ok) {
                throw new Error('Failed to fetch films');
            }
            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error('API failed:', error);
            return [];
        }
    },

    // Send contact form message
    postMessage: async (messageData) => {
        try {
            const response = await fetch(`${AALY_BASE_URL}/messages/public`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            return await response.json();
        } catch (error) {
            console.error('API failed:', error);
            throw error;
        }
    }
};
