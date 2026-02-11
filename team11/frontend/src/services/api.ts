import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const destinationApi = {
    suggest: (data: any) => api.post('/destination', data),
};

export default api;