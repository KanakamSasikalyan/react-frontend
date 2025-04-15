import React, { useState } from 'react';
import axios from 'axios';

const DesignForm = ({ onDesignGenerated }) => {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('casual');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/api/designs/${encodeURIComponent(prompt)}?style=${style}`, null, {
                responseType: 'arraybuffer',
            });
            const imageBlob = new Blob([response.data], { type: 'image/png' });
            const imageUrl = URL.createObjectURL(imageBlob);
            onDesignGenerated(imageUrl);
        } catch (error) {
            console.error('Error generating design:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="prompt">Prompt:</label>
                <input
                    type="text"
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="style">Style:</label>
                <select
                    id="style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                >
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="sporty">Sporty</option>
                </select>
            </div>
            <button type="submit">Generate Design</button>
        </form>
    );
};

export default DesignForm;