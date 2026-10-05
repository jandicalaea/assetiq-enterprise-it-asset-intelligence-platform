import axios from 'axios';

import apiClient, { APP_BASE_URL } from './client';

export const getCsrfCookie = async () => {
    await axios.get(`${APP_BASE_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
        withXSRFToken: true,
        headers: {
            Accept: 'application/json',
        },
    });
};

export const getCurrentUser = async () => {
    const response = await apiClient.get('/user');
    return response.data;
};

export const signIn = async ({ email, password }) => {
    await getCsrfCookie();

    const response = await apiClient.post('/login', {
        email,
        password,
    });

    return response.data.user;
};

export const signOut = async () => {
    const response = await apiClient.post('/logout');
    return response.data;
};
