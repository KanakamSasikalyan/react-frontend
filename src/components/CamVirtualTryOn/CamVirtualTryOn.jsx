import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import './CamVirtualTryOn.css';
import API_BASE_URL from '../../config/apiConfig';

const VirtualTryOn = () => {
    const [imageSrc, setImageSrc] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState('Disconnected');
    const [selectedFile, setSelectedFile] = useState(null);
    const stompClient = useRef(null);

    useEffect(() => {
        const socket = new SockJS(`${API_BASE_URL}/virtual-try-on-websocket`);
        stompClient.current = Stomp.over(socket);
        
        stompClient.current.connect({}, () => {
            setIsConnected(true);
            setStatus('Connected');
            
            stompClient.current.subscribe('/topic/video-feed', (message) => {
                try {
                    const data = JSON.parse(message.body);
                    setImageSrc(`data:image/jpeg;base64,${data.frame}`);
                } catch (error) {
                    console.error('Error processing frame:', error);
                }
            });
        }, (error) => {
            console.error('WebSocket Error:', error);
            setIsConnected(false);
            setStatus('Connection failed');
        });

        return () => {
            if (stompClient.current) {
                stompClient.current.disconnect();
            }
        };
    }, []);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = () => {
        if (!selectedFile) return;
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        fetch(`${API_BASE_URL}/api/virtual-try-on/upload-cloth`, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.text())
        .then(data => {
            setStatus('Virtual try-on started');
        })
        .catch(error => {
            console.error('Upload error:', error);
            setStatus('Upload failed');
        });
    };

    const handleStop = () => {
        fetch(`${API_BASE_URL}/api/virtual-try-on/stop`, {
            method: 'POST',
        })
        .then(() => setStatus('Stopped'))
        .catch(error => console.error('Stop error:', error));
    };

    return (
        <div className="container">
            <div className="status-bar">
                <p className={`status ${isConnected ? 'connected' : 'disconnected'}`}>Status: {status}</p>
            </div>

            <div className="file-upload">
                <label className="upload-label">Upload Cloth Image:</label>
                <input 
                    type="file" 
                    onChange={handleFileChange} 
                    accept="image/*" 
                />
            </div>

            <div className="video-feed">
                {imageSrc ? (
                    <img 
                        src={imageSrc} 
                        alt="Virtual Try-On Output" 
                    />
                ) : (
                    <div className="placeholder">
                        Waiting for video feed...
                    </div>
                )}
            </div>

            <div className="controls">
                <button 
                    onClick={handleUpload} 
                    disabled={!selectedFile || !isConnected}
                >
                    Start
                </button>
                <button 
                    onClick={handleStop} 
                    disabled={!isConnected}
                >
                    Stop
                </button>
            </div>

            <footer className="footer">
                <p>&copy; 2023 Virtual Try-On. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default VirtualTryOn;