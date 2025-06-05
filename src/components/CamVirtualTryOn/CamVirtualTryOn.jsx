import React, { useRef, useEffect } from 'react';
import './CamVirtualTryOn.css';

const CamVirtualTryOn = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        let stream;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                // Optionally handle error
            }
        };
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="container">
            <div className="video-container">
                <div className="video-feed">
                    <video
                        ref={videoRef}
                        width="640"
                        height="480"
                        autoPlay
                        playsInline
                        muted
                        style={{ background: '#222', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CamVirtualTryOn;