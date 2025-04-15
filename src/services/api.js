import axios from 'axios';
const API_BASE_URL = 'https://fashion-studio-ai.onrender.com';
//const API_BASE_URL='';

export const generateDesign = async (prompt, style) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/designs/${encodeURIComponent(prompt)}?style=${style}`, null, {
            responseType: 'arraybuffer',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error generating design:', error);
        throw error;
    }
};