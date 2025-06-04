import React, { useRef, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './CamVirtualTryOn.css';
import API_BASE_URL from '../../config/apiConfig';

const CamVirtualTryOn = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const [clothFile, setClothFile] = useState(null);
    const [isTryingOn, setIsTryingOn] = useState(false);
    const [stompClient, setStompClient] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const intervalIdRef = useRef(null);

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(`${API_BASE_URL}/virtual-try-on-websocket`),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => {
                console.log(str);
            },
            onConnect: (frame) => {
                console.log('STOMP connected', frame);
                setConnectionStatus('connected');
                setStompClient(client);
                
                client.subscribe('/topic/video-feed', (message) => {
                    const payload = JSON.parse(message.body);
                    if (payload.frame) {
                        imgRef.current.src = `data:image/jpeg;base64,${payload.frame}`;
                    }
                });
                
                client.subscribe('/topic/errors', (message) => {
                    const payload = JSON.parse(message.body);
                    setErrorMessage(payload.message);
                    setIsTryingOn(false);
                    if (intervalIdRef.current) {
                        clearInterval(intervalIdRef.current);
                        intervalIdRef.current = null;
                    }
                    stopWebcam();
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error:', frame);
                setErrorMessage('Real-time service error: ' + frame.headers?.message);
                setConnectionStatus('disconnected');
                setIsTryingOn(false);
                if (intervalIdRef.current) {
                    clearInterval(intervalIdRef.current);
                    intervalIdRef.current = null;
                }
                stopWebcam();
            },
            onDisconnect: () => {
                setConnectionStatus('disconnected');
                console.log('STOMP disconnected');
            },
            onWebSocketClose: (event) => {
                console.log('WebSocket closed:', event);
                setConnectionStatus('disconnected');
            },
            onWebSocketError: (event) => {
                console.error('WebSocket error:', event);
                setConnectionStatus('disconnected');
            }
        });

        client.activate();

        return () => {
            if (client && client.connected) {
                client.deactivate();
            }
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
            stopWebcam();
        };
    }, []);

    const startWebcam = async () => {
        setErrorMessage('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 }, 
                    height: { ideal: 480 },
                    facingMode: 'user' 
                } 
            });
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        } catch (err) {
            console.error("Error accessing webcam:", err);
            setErrorMessage("Could not access webcam. Please ensure it's connected and permissions are granted.");
        }
    };

    const stopWebcam = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const handleFileChange = (event) => {
        setClothFile(event.target.files[0]);
        setErrorMessage('');
    };

    const startTryOn = async () => {
        if (!clothFile) {
            setErrorMessage("Please upload a cloth image first.");
            return;
        }
        if (connectionStatus !== 'connected') {
            setErrorMessage("Real-time service not connected. Please wait and try again.");
            return;
        }
        
        setIsLoading(true);
        setErrorMessage('');

        try {
            const formData = new FormData();
            formData.append('file', clothFile);

            const uploadResponse = await fetch(`${API_BASE_URL}/api/virtual-try-on/upload-cloth`, {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                throw new Error(`Upload failed: ${errorText}`);
            }

            setIsLoading(false);
            setIsTryingOn(true);
            await startWebcam();

            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
            }
            
            intervalIdRef.current = setInterval(() => {
                if (videoRef.current && videoRef.current.readyState === 4) {
                    const context = canvasRef.current.getContext('2d');
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                    const imageData = canvasRef.current.toDataURL('image/jpeg', 0.7);
                    const base64Image = imageData.split(',')[1];

                    if (stompClient && stompClient.connected) {
                        stompClient.publish({
                            destination: "/app/process-frame",
                            body: JSON.stringify({ frame: base64Image })
                        });
                    }
                }
            }, 100);

        } catch (error) {
            console.error("Error starting try-on:", error);
            setErrorMessage(`Failed to start virtual try-on: ${error.message}`);
            setIsLoading(false);
            setIsTryingOn(false);
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
            stopWebcam();
        }
    };

    const stopTryOn = async () => {
        if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
        }
        setIsTryingOn(false);
        stopWebcam();
        setErrorMessage('');

        try {
            await fetch(`${API_BASE_URL}/api/virtual-try-on/stop`, {
                method: 'POST',
            });
            console.log('Virtual try-on stopped on backend.');
        } catch (error) {
            console.error("Error stopping try-on on backend:", error);
            setErrorMessage("Failed to stop virtual try-on gracefully on backend.");
        }
    };

    return (
        <div className="container">
            <div className="status-container">
                <button className="back-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back
                </button>
                <div className={`status ${connectionStatus}`}>
                    {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                </div>
            </div>

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
                            <span className="video-label">Webcam Feed</span>
                            <video 
                                ref={videoRef} 
                                width="100%" 
                                height="100%" 
                                autoPlay
                                playsInline
                            />
                        </>
                    ) : (
                        <div className="placeholder">
                            Webcam feed will appear here when try-on starts
                        </div>
                    )}
                </div>
                <div className="video-feed">
                    {isTryingOn ? (
                        <>
                            <span className="video-label">Virtual Try-On Result</span>
                            <img 
                                ref={imgRef} 
                                width="100%" 
                                height="100%" 
                                alt="Virtual Try-On Result" 
                            />
                        </>
                    ) : (
                        <div className="placeholder">
                            Virtual try-on result will appear here
                        </div>
                    )}
                </div>
            </div>

            <div className="controls">
                <button 
                    onClick={startTryOn} 
                    disabled={isLoading || isTryingOn || connectionStatus !== 'connected'}
                >
                    {isLoading ? 'Starting...' : 'Start Virtual Try-On'}
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

            <div className="footer">
                <p>Virtual Try-On Demo © {new Date().getFullYear()}</p>
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
    );
};

export default CamVirtualTryOn;