import axios from 'axios';

export const APP_BASE_URL =
    import.meta.env.VITE_API_ORIGIN || 'http://localhost:8000';

export const API_BASE_URL = `${APP_BASE_URL}/api`;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.dispatchEvent(new Event('assetiq:unauthorized'));
        }

        return Promise.reject(error);
    }
);

export default apiClient;
