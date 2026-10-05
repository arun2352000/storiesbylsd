const AALY_BASE_URL = 'https://api.aaly.io/arunachalam_organization/lsd_portfolio';

const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

// Auto-refresh wrapper
const fetchWithAuth = async (url, options = {}) => {
    let res = await fetch(url, options);
    
    // If token expired, try to refresh
    if (res.status === 401) {
        const rToken = localStorage.getItem('adminRefreshToken');
        if (rToken) {
            try {
                const refreshRes = await fetch(`${AALY_BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken: rToken })
                });
                
                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    localStorage.setItem('adminToken', data.jwt);
                    if (data.refreshToken) {
                        localStorage.setItem('adminRefreshToken', data.refreshToken);
                    }
                    
                    // Update headers and retry original request
                    if (options.headers && options.headers['Authorization']) {
                        options.headers['Authorization'] = `Bearer ${data.jwt}`;
                    } else if (!options.headers) {
                        options.headers = getAuthHeaders();
                    } else {
                        options.headers = { ...options.headers, ...getAuthHeaders() };
                    }
                    
                    res = await fetch(url, options);
                } else {
                    // Refresh failed, clear tokens
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminRefreshToken');
                    window.location.href = '/admin/login';
                }
            } catch (err) {
                console.error('Refresh token error:', err);
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminRefreshToken');
                window.location.href = '/admin/login';
            }
        } else {
            // No refresh token available, force logout
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login';
        }
    }
    
    return res;
};

export const adminApi = {
    login: async (email, password) => {
        const res = await fetch(`${AALY_BASE_URL}/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error('Login failed');
        const data = await res.json();
        localStorage.setItem('adminToken', data.jwt);
        if (data.refreshToken) {
            localStorage.setItem('adminRefreshToken', data.refreshToken);
        }
        return data;
    },

    logout: () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRefreshToken');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('adminToken');
    },

    // A helper to upload files directly to Aaly's S3 storage
    uploadFile: async (file) => {
        if (!file || file.size === 0) {
            throw new Error('Cannot upload empty or invalid file');
        }
        const fileSize = file.size;

        // 1. Get presigned URL
        const presignRes = await fetchWithAuth(`${AALY_BASE_URL}/files/presigned-url`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify([{
                filename: file.name || 'upload.bin',
                mimeType: file.type || 'application/octet-stream',
                size: fileSize
            }])
        });
        
        if (!presignRes.ok) throw new Error('Failed to get presigned URL');
        const presignData = await presignRes.json();
        const fileInfo = presignData.files[0];

        // 2. Upload to S3 (No auth headers needed for S3)
        const form = new FormData();
        Object.entries(fileInfo.uploadFields).forEach(([k, v]) => form.append(k, v));
        form.append("file", file, file.name || fileInfo.filename || "upload.bin"); 
        
        const uploadRes = await fetch(fileInfo.uploadUrl, {
            method: "POST",
            body: form
        });
        
        if (!uploadRes.ok) {
            const errText = await uploadRes.text();
            console.error("S3 upload failed:", uploadRes.status, errText);
            throw new Error(`Failed to upload file to S3 (${uploadRes.status})`);
        }

        // 3. Register file in Aaly
        const registerRes = await fetchWithAuth(`${AALY_BASE_URL}/files`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                filename: fileInfo.filename,
                mimeType: file.type || 'application/octet-stream',
                size: file.size,
                s3Key: fileInfo.s3Key
            })
        });
        
        if (!registerRes.ok) throw new Error('Failed to register file');
        return await registerRes.json();
    },

    // Portfolio Items
    getPortfolioItems: async () => {
        const res = await fetchWithAuth(`${AALY_BASE_URL}/portfolio_items/public`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return (await res.json()).items || [];
    },

    getFiles: async (ids) => {
        if (!ids || ids.length === 0) return [];
        const idString = ids.join(',');
        const res = await fetchWithAuth(`${AALY_BASE_URL}/files?id=${idString}&presign=true&limit=200`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to fetch files');
        return (await res.json()).items || [];
    },
    getPortfolioItem: async (id) => {
        const res = await fetchWithAuth(`${AALY_BASE_URL}/portfolio_items/${id}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to fetch portfolio item');
        return await res.json();
    },
    createPortfolioItem: async (data) => {
        const res = await fetchWithAuth(`${AALY_BASE_URL}/portfolio_items`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create portfolio item');
        return await res.json();
    },
    deletePortfolioItem: async (id) => {
        const res = await fetchWithAuth(`${AALY_BASE_URL}/portfolio_items/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete portfolio item');
    },
    updatePortfolioItem: async (id, data) => {
        const res = await fetchWithAuth(`${AALY_BASE_URL}/portfolio_items/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const errText = await res.text();
            console.error("Aaly API Error (PATCH portfolio):", errText);
            throw new Error(`Failed to update portfolio item: ${errText}`);
        }
        return await res.json();
    },

    // Films
    getFilms: async () => {
        const res = await fetchWithAuth(`${AALY_BASE_URL}/films/public`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return (await res.json()).items || [];
    },
    createFilm: async (data) => {
        const res = await fetchWithAuth(`${AALY_BASE_URL}/films`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create film');
        return await res.json();
    },
    deleteFilm: async (id) => {
        const res = await fetchWithAuth(`${AALY_BASE_URL}/films/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete film');
    },

    // Messages
    getMessages: async () => {
        const res = await fetchWithAuth(`${AALY_BASE_URL}/messages`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return (await res.json()).items || [];
    },
    deleteMessage: async (id) => {
        const res = await fetchWithAuth(`${AALY_BASE_URL}/messages/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete message');
    },

    // Site Config
    getSiteConfig: async () => {
        try {
            const pubRes = await fetch(`${AALY_BASE_URL}/site_config/public`);
            if (pubRes.ok) {
                const pubData = await pubRes.json();
                if (pubData.items && pubData.items.length > 0) {
                    return pubData.items[0];
                }
            }
        } catch (e) {
            console.warn("Public site_config hydration failed, falling back to authenticated CRUD:", e);
        }

        const res = await fetchWithAuth(`${AALY_BASE_URL}/site_config`, { headers: getAuthHeaders() });
        if (!res.ok) {
            if (res.status === 401) throw new Error('Unauthorized');
            return null; // config might not exist
        }
        const data = await res.json();
        const config = (data.items && data.items.length > 0) ? data.items[0] : null;
        if (!config) return null;

        // Hydrate files if present
        const fileIds = [];
        if (config.heroVideo && config.heroVideo.id) fileIds.push(config.heroVideo.id);
        if (config.heroVideoThumb && config.heroVideoThumb.id) fileIds.push(config.heroVideoThumb.id);
        if (Array.isArray(config.folioImages)) {
            config.folioImages.forEach(img => { if (img && img.id) fileIds.push(img.id); });
        }
        if (Array.isArray(config.teamImages)) {
            config.teamImages.forEach(img => { if (img && img.id) fileIds.push(img.id); });
        }

        if (fileIds.length > 0) {
            try {
                const files = await adminApi.getFiles(fileIds);
                const fileMap = {};
                files.forEach(f => {
                    fileMap[f.id] = f.downloadUrl || f.url;
                });
                if (config.heroVideo && fileMap[config.heroVideo.id]) {
                    config.heroVideo.url = fileMap[config.heroVideo.id];
                }
                if (config.heroVideoThumb && fileMap[config.heroVideoThumb.id]) {
                    config.heroVideoThumb.url = fileMap[config.heroVideoThumb.id];
                }
                if (Array.isArray(config.folioImages)) {
                    config.folioImages = config.folioImages.map(img => ({
                        ...img,
                        url: fileMap[img.id] || img.url
                    }));
                }
                if (Array.isArray(config.teamImages)) {
                    config.teamImages = config.teamImages.map(img => ({
                        ...img,
                        url: fileMap[img.id] || img.url
                    }));
                }
            } catch (e) {
                console.error("Failed to hydrate site_config files in adminApi:", e);
            }
        }
        return config;
    },
    updateSiteConfig: async (data, existingId = null) => {
        if (existingId) {
            const res = await fetchWithAuth(`${AALY_BASE_URL}/site_config/${existingId}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update site config');
            return await res.json();
        } else {
            const res = await fetchWithAuth(`${AALY_BASE_URL}/site_config`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to create site config');
            return await res.json();
        }
    }
};