import React, { useRef, useEffect, useState } from 'react';
import './CamVirtualTryOn.css';

const CamVirtualTryOn = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const outputCanvasRef = useRef(null);
    const [clothFile, setClothFile] = useState(null);
    const [processedCloth, setProcessedCloth] = useState(null);
    const [clothMask, setClothMask] = useState(null);
    const [isTryingOn, setIsTryingOn] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const animationFrameRef = useRef(null);
    const opencvRef = useRef(null);
    const [isOpenCVReady, setIsOpenCVReady] = useState(false);

    // Load OpenCV.js - Only check for readiness
    useEffect(() => {
        const checkOpenCV = () => {
            if (window.cv && window.cv.Mat) {
                opencvRef.current = window.cv;
                setIsOpenCVReady(true);
                return true;
            }
            return false;
        };
        if (!checkOpenCV()) {
            const intervalId = setInterval(() => {
                if (checkOpenCV()) clearInterval(intervalId);
            }, 100);
            return () => clearInterval(intervalId);
        }
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            stopWebcam();
        };
    }, []);

    // Start webcam and show video
    const startWebcam = async () => {
        setErrorMessage('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play();
                };
            }
        } catch (err) {
            setErrorMessage('Could not access webcam. Please allow camera access.');
        }
    };

    // Stop webcam
    const stopWebcam = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    };

    // Process cloth image (dummy, just set file for now)
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setClothFile(e.target.files[0]);
        }
    };

    // Dummy overlay function (replace with real OpenCV logic)
    const processFrame = () => {
        if (!videoRef.current || !outputCanvasRef.current) return;
        const ctx = outputCanvasRef.current.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, 640, 480);
        // Here you would overlay the cloth image using OpenCV
        animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    // Start try-on
    const startTryOn = async () => {
        setIsTryingOn(true);
        await startWebcam();
        // Start processing frames
        animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    // Stop try-on
    const stopTryOn = () => {
        setIsTryingOn(false);
        stopWebcam();
        setErrorMessage('');
    };

    return (
        <div className="container">
            <div className="file-upload">
                <label className="upload-label">Upload Clothing Image</label>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    disabled={isTryingOn || isLoading}
                />
            </div>
            <div className="video-container">
                <div className="video-feed">
                    {isTryingOn ? (
                        <>
                            <span className="video-label">Virtual Try-On Result</span>
                            <canvas 
                                ref={outputCanvasRef} 
                                width="640" 
                                height="480"
                                style={{ background: '#222', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                            />
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#fff' }}>
                            <span className="video-label">Live Camera Feed</span>
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
                    )}
                </div>
            </div>
            <div className="controls">
                <button 
                    onClick={startTryOn} 
                    disabled={isLoading || isTryingOn || !clothFile || !isOpenCVReady}
                >
                    {isLoading ? 'Processing...' : 'Start Virtual Try-On'}
                </button>
                <button 
                    onClick={stopTryOn} 
                    disabled={!isTryingOn}
                >
                    Stop Try-On
                </button>
            </div>
            {errorMessage && (
                <div className="error-message">
                    {errorMessage}
                </div>
            )}
            <canvas 
                ref={canvasRef} 
                style={{ display: 'none' }}
            ></canvas>
        </div>
    );
};

export default CamVirtualTryOn;