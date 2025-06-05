import React, { useRef, useEffect } from 'react';
import './CamVirtualTryOn.css';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

const CamVirtualTryOn = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [clothImg, setClothImg] = React.useState(null);
    const [processedCloth, setProcessedCloth] = React.useState(null);
    const detectorRef = useRef(null);

    // Load pose detector
    useEffect(() => {
        const loadDetector = async () => {
            await tf.setBackend('webgl');
            detectorRef.current = await posedetection.createDetector(posedetection.SupportedModels.MoveNet, {
                modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING
            });
        };
        loadDetector();
    }, []);

    // Start camera
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

    // Handle cloth image upload
    const handleClothUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const img = new window.Image();
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
            // TODO: Replace this with a real background removal API call
            // For demo, just use the raw image
            setProcessedCloth(img);
        };
        setClothImg(img);
    };

    // Real-time pose detection and overlay
    useEffect(() => {
        let animationId;
        const draw = async () => {
            if (!videoRef.current || !canvasRef.current || !detectorRef.current) {
                animationId = requestAnimationFrame(draw);
                return;
            }
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            if (processedCloth) {
                // Detect pose
                const poses = await detectorRef.current.estimatePoses(video);
                if (poses && poses[0] && poses[0].keypoints) {
                    // Example: overlay between shoulders
                    const leftShoulder = poses[0].keypoints.find(k => k.name === 'left_shoulder');
                    const rightShoulder = poses[0].keypoints.find(k => k.name === 'right_shoulder');
                    const leftHip = poses[0].keypoints.find(k => k.name === 'left_hip');
                    const rightHip = poses[0].keypoints.find(k => k.name === 'right_hip');
                    if (leftShoulder && rightShoulder && leftHip && rightHip) {
                        // Calculate overlay position and size
                        const x = Math.min(leftShoulder.x, rightShoulder.x);
                        const y = Math.min(leftShoulder.y, rightShoulder.y);
                        const width = Math.abs(rightShoulder.x - leftShoulder.x) * 1.3;
                        const height = Math.abs(Math.max(leftHip.y, rightHip.y) - y) * 1.2;
                        ctx.drawImage(processedCloth, x - width * 0.15, y, width, height);
                    }
                }
            }
            animationId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animationId);
    }, [processedCloth]);

    return (
        <div className="container">
            <div style={{ marginBottom: 16 }}>
                <input type="file" accept="image/*" onChange={handleClothUpload} />
                {/* Optionally show preview of processed cloth */}
                {processedCloth && <img src={processedCloth.src} alt="Cloth Preview" style={{ maxWidth: 120, maxHeight: 120, marginLeft: 12 }} />}
            </div>
            <div className="video-container" style={{ position: 'relative', width: 640, height: 480 }}>
                <video
                    ref={videoRef}
                    width="640"
                    height="480"
                    autoPlay
                    playsInline
                    muted
                    style={{ display: 'none' }}
                />
                <canvas
                    ref={canvasRef}
                    width="640"
                    height="480"
                    style={{ position: 'absolute', top: 0, left: 0, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                />
            </div>
        </div>
    );
};

export default CamVirtualTryOn;