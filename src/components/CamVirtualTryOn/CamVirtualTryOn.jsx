import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const VirtualTryOn = () => {
    const [imageSrc, setImageSrc] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState('Disconnected');
    const [selectedFile, setSelectedFile] = useState(null);
    const stompClient = useRef(null);

    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/virtual-try-on-websocket');
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
        
        fetch('http://localhost:8080/api/virtual-try-on/upload-cloth', {
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
        fetch('http://localhost:8080/api/virtual-try-on/stop', {
            method: 'POST',
        })
        .then(() => setStatus('Stopped'))
        .catch(error => console.error('Stop error:', error));
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h1>Virtual Try-On</h1>
            <p>Status: {status}</p>
            
            <div style={{ margin: '20px 0' }}>
                <input type="file" onChange={handleFileChange} accept="image/*" />
                <button 
                    onClick={handleUpload} 
                    disabled={!selectedFile || !isConnected}
                    style={{ margin: '0 10px' }}
                >
                    Start Virtual Try-On
                </button>
                <button 
                    onClick={handleStop} 
                    disabled={!isConnected}
                >
                    Stop
                </button>
            </div>
            
            <div style={{ 
                backgroundColor: '#000', 
                borderRadius: '8px', 
                padding: '10px',
                marginTop: '20px'
            }}>
                {imageSrc ? (
                    <img 
                        src={imageSrc} 
                        alt="Virtual Try-On Output" 
                        style={{ 
                            maxWidth: '100%', 
                            display: 'block',
                            margin: '0 auto'
                        }} 
                    />
                ) : (
                    <div style={{
                        color: '#fff',
                        textAlign: 'center',
                        padding: '100px 0'
                    }}>
                        Waiting for video feed...
                    </div>
                )}
            </div>
        </div>
    );
};

export default VirtualTryOn;