import axios from 'axios';
const API_BASE_URL = 'https://fashion-studio-ai.onrender.com/api/designs'; // Update with your Render backend URL

export const generateDesign = async (prompt, style) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/${encodeURIComponent(prompt)}?style=${style}`, null, {
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