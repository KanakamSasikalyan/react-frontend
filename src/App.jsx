import React, { useState } from 'react';
import DesignForm from './components/DesignForm';
import DesignDisplay from './components/DesignDisplay';

const App = () => {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('casual');
    const [designImage, setDesignImage] = useState(null);

    const handleFormSubmit = async (formPrompt, formStyle) => {
        setPrompt(formPrompt);
        setStyle(formStyle);
        try {
            const response = await fetch(`/api/designs/${encodeURIComponent(formPrompt)}?style=${formStyle}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const imageBlob = await response.blob();
                const imageObjectURL = URL.createObjectURL(imageBlob);
                setDesignImage(imageObjectURL);
            } else {
                console.error('Error generating design:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="App">
            <h1>Clothing Design Generator</h1>
            <DesignForm onSubmit={handleFormSubmit} />
            {designImage && <DesignDisplay image={designImage} />}
        </div>
    );
};

export default App;