import apiClient from './client';

export const getOverview = async () => {
    const response = await apiClient.get('/analytics/overview');
    return response.data;
};

export const getSecurityAnalytics = async () => {
    const response = await apiClient.get('/analytics/security');
    return response.data;
};

export const getHardwareAnalytics = async () => {
    const response = await apiClient.get('/analytics/hardware');
    return response.data;
};