import React from 'react';

const DesignDisplay = ({ image }) => {
    return (
        <div>
            {image ? (
                <img src={`data:image/png;base64,${image}`} alt="Generated Clothing Design" />
            ) : (
                <p>No design generated yet.</p>
            )}
        </div>
    );
};

export default DesignDisplay;