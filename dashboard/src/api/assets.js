import apiClient from './client';

export const getAssets = async (page = 1, perPage = 20, search = '') => {
    const response = await apiClient.get('/assets', {
        params: {
            page,
            per_page: perPage,
            search: search.trim() || undefined,
        },
    });

    return response.data;
};

export const getAsset = async (pcName) => {
    const response = await apiClient.get(
        `/assets/${encodeURIComponent(pcName)}`
    );

    return response.data;
};

export const getAssetSoftware = async (pcName) => {
    const response = await apiClient.get(
        `/assets/${encodeURIComponent(pcName)}/software`
    );

    return response.data;
};