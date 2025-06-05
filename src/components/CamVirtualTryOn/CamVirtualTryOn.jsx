import React, { useRef, useEffect, useState } from 'react';
import './CamVirtualTryOn.css';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import API_BASE_URL from '../../config/apiConfig';

const CamVirtualTryOn = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [clothImg, setClothImg] = useState(null);
    const [processedCloth, setProcessedCloth] = useState(null);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const detectorRef = useRef(null);
    const animationFrameId = useRef(null);

    // Load pose detector
    useEffect(() => {
        const loadDetector = async () => {
            try {
                await tf.setBackend('webgl');
                console.log('TensorFlow.js backend set to WebGL.');

                detectorRef.current = await posedetection.createDetector(
                    posedetection.SupportedModels.MoveNet,
                    {
                        modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING
                    }
                );
                setIsModelLoading(false);
                console.log('Pose detection model loaded successfully.');
            } catch (err) {
                setError('Failed to load pose detection model. Please check your browser and internet connection.');
                console.error('Model loading error:', err);
            }
        };
        loadDetector();
    }, []);

    // Start camera
    useEffect(() => {
        let stream = null;
        const startCamera = async () => {
            if (!videoRef.current) return;

            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: 'user'
                    }
                });
                videoRef.current.srcObject = stream;

                videoRef.current.onloadedmetadata = () => {
                    console.log('Video metadata loaded.');
                    videoRef.current.play()
                        .then(() => {
                            setIsVideoReady(true);
                            console.log('Video is playing and ready.');
                        })
                        .catch(err => {
                            setError('Failed to play video stream. Please ensure no other application is using the camera.');
                            console.error('Video play error:', err);
                        });
                };
            } catch (err) {
                if (err.name === 'NotAllowedError') {
                    setError('Camera access denied. Please allow camera permissions in your browser settings.');
                } else if (err.name === 'NotFoundError') {
                    setError('No camera found. Please ensure a camera is connected and enabled.');
                } else if (err.name === 'NotReadableError') {
                    setError('Camera is in use by another application or not accessible.');
                } else {
                    setError(`Could not access camera: ${err.message}. Please check permissions.`);
                }
                console.error('getUserMedia error:', err);
            }
        };

        if (!isModelLoading && !error) {
            startCamera();
        }

        return () => {
            if (stream) {
                console.log('Stopping camera stream.');
                stream.getTracks().forEach(track => track.stop());
            }
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [isModelLoading, error]);

    // Handle cloth image upload and background removal
    const handleClothUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            setClothImg(null);
            setProcessedCloth(null);
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // Create FormData to send the image
            const formData = new FormData();
            formData.append('image', file);

            // Call the background removal API
            const response = await fetch(`${API_BASE_URL}/api/image/remove-background`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to remove background');
            }

            // Get the processed image as blob
            const blob = await response.blob();
            const imgUrl = URL.createObjectURL(blob);

            // Create image object
            const img = new Image();
            img.src = imgUrl;
            
            img.onload = () => {
                setProcessedCloth(img);
                setClothImg(img);
                setIsProcessing(false);
            };
            
            img.onerror = () => {
                setError('Failed to load processed cloth image.');
                setIsProcessing(false);
            };
        } catch (err) {
            setError('Failed to process cloth image. Please try again.');
            console.error('Background removal error:', err);
            setIsProcessing(false);
        }
    };

    // Real-time pose detection and cloth overlay
    useEffect(() => {
        const draw = async () => {
            if (!videoRef.current || !canvasRef.current || !detectorRef.current || !isVideoReady) {
                animationFrameId.current = requestAnimationFrame(draw);
                return;
            }

            const currentVideo = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Set canvas dimensions
            if (canvas.width !== currentVideo.videoWidth || canvas.height !== currentVideo.videoHeight) {
                canvas.width = currentVideo.videoWidth;
                canvas.height = currentVideo.videoHeight;
            }

            // Clear canvas and draw the video frame
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(currentVideo, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();

            if (processedCloth) {
                try {
                    const poses = await detectorRef.current.estimatePoses(currentVideo);

                    if (poses && poses.length > 0 && poses[0].keypoints) {
                        const personPose = poses[0];
                        const keypoints = personPose.keypoints;

                        const leftShoulder = keypoints.find(k => k.name === 'left_shoulder');
                        const rightShoulder = keypoints.find(k => k.name === 'right_shoulder');
                        const leftHip = keypoints.find(k => k.name === 'left_hip');
                        const rightHip = keypoints.find(k => k.name === 'right_hip');

                        const confidenceThreshold = 0.3;
                        if (leftShoulder && leftShoulder.score > confidenceThreshold &&
                            rightShoulder && rightShoulder.score > confidenceThreshold &&
                            leftHip && leftHip.score > confidenceThreshold &&
                            rightHip && rightHip.score > confidenceThreshold) {
                            
                            // Mirror keypoint coordinates for flipped canvas
                            const mirroredLeftShoulderX = canvas.width - rightShoulder.x;
                            const mirroredRightShoulderX = canvas.width - leftShoulder.x;
                            const mirroredLeftHipX = canvas.width - rightHip.x;
                            const mirroredRightHipX = canvas.width - leftHip.x;

                            // Calculate torso bounding box
                            const torsoTopY = Math.min(leftShoulder.y, rightShoulder.y);
                            const torsoBottomY = Math.max(leftHip.y, rightHip.y);
                            const torsoLeftX = Math.min(mirroredLeftShoulderX, mirroredLeftHipX);
                            const torsoRightX = Math.max(mirroredRightShoulderX, mirroredRightHipX);

                            // Calculate cloth dimensions and position
                            const targetWidth = Math.abs(torsoRightX - torsoLeftX) * 1.5;
                            const targetHeight = Math.abs(torsoBottomY - torsoTopY) * 1.5;
                            const drawX = torsoLeftX + (torsoRightX - torsoLeftX) / 2 - targetWidth / 2;
                            const drawY = torsoTopY - targetHeight * 0.1;

                            // Draw the clothing image with transparency
                            ctx.globalCompositeOperation = 'source-over';
                            ctx.drawImage(
                                processedCloth,
                                drawX,
                                drawY,
                                targetWidth,
                                targetHeight
                            );
                        }
                    }
                } catch (err) {
                    console.error('Pose detection or drawing error:', err);
                }
            }
            animationFrameId.current = requestAnimationFrame(draw);
        };

        animationFrameId.current = requestAnimationFrame(draw);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [processedCloth, isVideoReady]);

    if (error) {
        return (
            <div className="container">
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="reload-button">
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    if (isModelLoading) {
        return (
            <div className="container">
                <div className="loading-spinner">
                    <p>Loading AI model for virtual try-on...</p>
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <h1>Virtual Try-On</h1>
            
            <div className="upload-section">
                <label htmlFor="cloth-upload" className="upload-label">
                    {isProcessing ? 'Processing...' : 'Upload Clothing Image:'}
                </label>
                <input
                    id="cloth-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleClothUpload}
                    disabled={isProcessing}
                />
                
                {processedCloth && (
                    <div className="cloth-preview">
                        <p>Cloth Preview:</p>
                        <img
                            src={processedCloth.src}
                            alt="Cloth Preview"
                            className="preview-image"
                        />
                    </div>
                )}
            </div>

            <div className="video-container">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="hidden-video"
                />
                <canvas
                    ref={canvasRef}
                    className="try-on-canvas"
                />
                {!isVideoReady && !error && (
                    <div className="camera-loading">
                        Waiting for camera feed...
                    </div>
                )}
            </div>

            <p className="instruction-text">
                Position yourself in front of the camera for the best try-on experience.
            </p>
        </div>
    );
};

export default CamVirtualTryOn;