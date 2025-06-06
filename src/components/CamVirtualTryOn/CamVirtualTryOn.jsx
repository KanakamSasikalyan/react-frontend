/*======================================Code Working Perfectly: Backup=============================================*/


import React, { useRef, useEffect, useState } from 'react';
import './CamVirtualTryOn.css';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import API_BASE_URL from '../../config/apiConfig';
import { useLocation } from 'react-router-dom';

const CamVirtualTryOn = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [clothImg, setClothImg] = useState(null);
    const [processedCloth, setProcessedCloth] = useState(null);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isTryOnActive, setIsTryOnActive] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const detectorRef = useRef(null);
    const animationFrameId = useRef(null);
    const location = useLocation();
    const prevPoseRef = useRef(null);
    const smoothingFactor = 0.3; // For smoothing position changes

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

    // Check for pre-processed cloth from Marketplace
    useEffect(() => {
        if (location.state?.processedClothFile) {
            setIsProcessing(true);
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    setProcessedCloth(img);
                    setClothImg(img);
                    setIsProcessing(false);
                    setIsTryOnActive(true);
                    setConnectionStatus('connected');
                };
            };
            fileReader.readAsDataURL(location.state.processedClothFile);
        }
    }, [location.state]);

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

    // Apply exponential smoothing to keypoints
    const smoothKeypoints = (currentKeypoints, prevKeypoints) => {
        if (!prevKeypoints) return currentKeypoints;
        
        return currentKeypoints.map((k, i) => {
            const prevK = prevKeypoints[i];
            return {
                ...k,
                x: prevK.x * (1 - smoothingFactor) + k.x * smoothingFactor,
                y: prevK.y * (1 - smoothingFactor) + k.y * smoothingFactor
            };
        });
    };

    // Calculate cloth position and size based on body points
    const calculateClothPosition = (keypoints, canvas) => {
        const leftShoulder = keypoints.find(k => k.name === 'left_shoulder');
        const rightShoulder = keypoints.find(k => k.name === 'right_shoulder');
        const leftHip = keypoints.find(k => k.name === 'left_hip');
        const rightHip = keypoints.find(k => k.name === 'right_hip');
        const nose = keypoints.find(k => k.name === 'nose');
        const leftElbow = keypoints.find(k => k.name === 'left_elbow');
        const rightElbow = keypoints.find(k => k.name === 'right_elbow');

        if (!leftShoulder || !rightShoulder || !nose) return null;

        // Mirror keypoint coordinates for flipped canvas
        const mirroredLeftShoulderX = canvas.width - rightShoulder.x;
        const mirroredRightShoulderX = canvas.width - leftShoulder.x;

        // Calculate shoulder width and neck position
        const shoulderWidth = Math.abs(mirroredRightShoulderX - mirroredLeftShoulderX);
        const neckY = nose.y + (Math.min(leftShoulder.y, rightShoulder.y) - nose.y) * 0.5;

        // Calculate torso height (from neck to hips)
        let torsoHeight = 0;
        if (leftHip && rightHip) {
            const hipY = (leftHip.y + rightHip.y) / 2;
            torsoHeight = hipY - neckY;
        } else {
            // Default torso height if hips not detected
            torsoHeight = shoulderWidth * 2.2; // Increased for better coverage
        }

        // Calculate arm span for better width estimation
        let armSpan = shoulderWidth;
        if (leftElbow && rightElbow) {
            const leftArmWidth = Math.abs(leftElbow.x - leftShoulder.x);
            const rightArmWidth = Math.abs(rightElbow.x - rightShoulder.x);
            armSpan = shoulderWidth + (leftArmWidth + rightArmWidth) * 0.8;
        }

        // Calculate cloth dimensions - now larger for better coverage
        const clothWidth = armSpan * 1.4; // Increased width for better shoulder coverage
        const clothHeight = torsoHeight * 1.6; // Increased height for full body coverage

        // Calculate position (centered between shoulders, starting from neck)
        const clothX = (mirroredLeftShoulderX + mirroredRightShoulderX) / 2 - clothWidth / 2;
        const clothY = neckY - clothHeight * 0.15; // Start slightly above neck

        return {
            x: clothX,
            y: clothY,
            width: clothWidth,
            height: clothHeight,
            shoulderWidth,
            neckY
        };
    };

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
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/api/image/remove-background`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to remove background');
            }

            const blob = await response.blob();
            const imgUrl = URL.createObjectURL(blob);
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

    const startVirtualTryOn = () => {
        if (processedCloth) {
            setIsTryOnActive(true);
            setConnectionStatus('connected');
        }
    };

    const stopVirtualTryOn = () => {
        setIsTryOnActive(false);
        setConnectionStatus('disconnected');
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

            if (processedCloth && isTryOnActive) {
                try {
                    const poses = await detectorRef.current.estimatePoses(currentVideo);

                    if (poses && poses.length > 0 && poses[0].keypoints) {
                        const personPose = poses[0];
                        let keypoints = personPose.keypoints;

                        // Apply smoothing to keypoints
                        keypoints = smoothKeypoints(keypoints, prevPoseRef.current);
                        prevPoseRef.current = keypoints;

                        const clothPosition = calculateClothPosition(keypoints, canvas);

                        if (clothPosition) {
                            // Draw the clothing image with transparency
                            ctx.globalCompositeOperation = 'source-over';
                            ctx.drawImage(
                                processedCloth,
                                clothPosition.x,
                                clothPosition.y,
                                clothPosition.width,
                                clothPosition.height
                            );

                            // Debug: Draw keypoints (optional)
                            if (process.env.NODE_ENV === 'development') {
                                ctx.fillStyle = 'red';
                                ctx.fillRect(
                                    canvas.width - keypoints.find(k => k.name === 'right_shoulder').x - 5,
                                    keypoints.find(k => k.name === 'right_shoulder').y - 5,
                                    10,
                                    10
                                );
                                ctx.fillRect(
                                    canvas.width - keypoints.find(k => k.name === 'left_shoulder').x - 5,
                                    keypoints.find(k => k.name === 'left_shoulder').y - 5,
                                    10,
                                    10
                                );
                                ctx.fillStyle = 'blue';
                                ctx.fillRect(
                                    canvas.width - keypoints.find(k => k.name === 'nose').x - 5,
                                    keypoints.find(k => k.name === 'nose').y - 5,
                                    10,
                                    10
                                );
                            }
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
    }, [processedCloth, isVideoReady, isTryOnActive]);

    if (error) {
        return (
            <div className="cam-tryon-container">
                <div className="cam-tryon-error-message">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="cam-tryon-reload-button">
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    if (isModelLoading) {
        return (
            <div className="cam-tryon-container">
                <div className="cam-tryon-loading-spinner">
                    <p>Loading AI model for virtual try-on...</p>
                    <div className="cam-tryon-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="cam-tryon-container">
            <h1>Virtual Try-On</h1>
            
            <div className="cam-tryon-upload-section">
                <label htmlFor="cloth-upload" className="cam-tryon-upload-label">
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
                    <div className="cam-tryon-cloth-preview">
                        <p>Cloth Preview:</p>
                        <img
                            src={processedCloth.src}
                            alt="Cloth Preview"
                            className="cam-tryon-preview-image"
                        />
                    </div>
                )}
            </div>

            <div className="cam-tryon-video-container">
                <div className="cam-tryon-connection-status">
                    <span className={`cam-tryon-status-bubble ${connectionStatus}`}>
                        {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="cam-tryon-hidden-video"
                />
                <canvas
                    ref={canvasRef}
                    className="cam-tryon-canvas"
                />
                {!isVideoReady && !error && (
                    <div className="cam-tryon-camera-loading">
                        Waiting for camera feed...
                    </div>
                )}
            </div>

            {!location.state?.processedClothFile && processedCloth && (
                <div className="cam-tryon-controls">
                    <button 
                        onClick={startVirtualTryOn} 
                        className={`cam-tryon-btn ${isTryOnActive ? 'active' : ''}`}
                        disabled={isTryOnActive}
                    >
                        Start Virtual Try-On
                    </button>
                    <button 
                        onClick={stopVirtualTryOn} 
                        className={`cam-tryon-stop-btn ${!isTryOnActive ? 'inactive' : ''}`}
                        disabled={!isTryOnActive}
                    >
                        Stop Virtual Try-On
                    </button>
                </div>
            )}

            <p className="cam-tryon-instruction-text">
                Position yourself in front of the camera for the best try-on experience.
                Stand straight with your shoulders visible for accurate fitting.
            </p>
        </div>
    );
};

export default CamVirtualTryOn;



/*-------------------------------------------Base Code that gave the foundation to the advanced code--------------------------------------*/

/*
import React, { useRef, useEffect, useState } from 'react';
import './CamVirtualTryOn.css';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import API_BASE_URL from '../../config/apiConfig';
import { useLocation } from 'react-router-dom';

const CamVirtualTryOn = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [clothImg, setClothImg] = useState(null);
    const [processedCloth, setProcessedCloth] = useState(null);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isTryOnActive, setIsTryOnActive] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const detectorRef = useRef(null);
    const animationFrameId = useRef(null);
    const location = useLocation();
    const prevPoseRef = useRef(null);
    const smoothingFactor = 0.3; // For smoothing position changes

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

    // Check for pre-processed cloth from Marketplace
    useEffect(() => {
        if (location.state?.processedClothFile) {
            setIsProcessing(true);
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    setProcessedCloth(img);
                    setClothImg(img);
                    setIsProcessing(false);
                    setIsTryOnActive(true);
                    setConnectionStatus('connected');
                };
            };
            fileReader.readAsDataURL(location.state.processedClothFile);
        }
    }, [location.state]);

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

    // Apply exponential smoothing to keypoints
    const smoothKeypoints = (currentKeypoints, prevKeypoints) => {
        if (!prevKeypoints) return currentKeypoints;
        
        return currentKeypoints.map((k, i) => {
            const prevK = prevKeypoints[i];
            return {
                ...k,
                x: prevK.x * (1 - smoothingFactor) + k.x * smoothingFactor,
                y: prevK.y * (1 - smoothingFactor) + k.y * smoothingFactor
            };
        });
    };

    // Calculate cloth position and size based on body points
    const calculateClothPosition = (keypoints, canvas) => {
        const leftShoulder = keypoints.find(k => k.name === 'left_shoulder');
        const rightShoulder = keypoints.find(k => k.name === 'right_shoulder');
        const leftHip = keypoints.find(k => k.name === 'left_hip');
        const rightHip = keypoints.find(k => k.name === 'right_hip');
        const nose = keypoints.find(k => k.name === 'nose');

        if (!leftShoulder || !rightShoulder || !nose) return null;

        // Mirror keypoint coordinates for flipped canvas
        const mirroredLeftShoulderX = canvas.width - rightShoulder.x;
        const mirroredRightShoulderX = canvas.width - leftShoulder.x;

        // Calculate shoulder width and neck position
        const shoulderWidth = Math.abs(mirroredRightShoulderX - mirroredLeftShoulderX);
        const neckY = nose.y + (Math.min(leftShoulder.y, rightShoulder.y) - nose.y) * 0.5;

        // Calculate torso height (from neck to hips)
        let torsoHeight = 0;
        if (leftHip && rightHip) {
            const hipY = (leftHip.y + rightHip.y) / 2;
            torsoHeight = hipY - neckY;
        } else {
            // Default torso height if hips not detected
            torsoHeight = shoulderWidth * 1.8;
        }

        // Calculate cloth dimensions
        const clothWidth = shoulderWidth * 1.2; // Slightly wider than shoulders
        const clothHeight = torsoHeight * 1.3; // Extend below hips

        // Calculate position (centered between shoulders, starting from neck)
        const clothX = (mirroredLeftShoulderX + mirroredRightShoulderX) / 2 - clothWidth / 2;
        const clothY = neckY - clothHeight * 0.1; // Start slightly above neck

        return {
            x: clothX,
            y: clothY,
            width: clothWidth,
            height: clothHeight,
            shoulderWidth,
            neckY
        };
    };

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
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/api/image/remove-background`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to remove background');
            }

            const blob = await response.blob();
            const imgUrl = URL.createObjectURL(blob);
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

    const startVirtualTryOn = () => {
        if (processedCloth) {
            setIsTryOnActive(true);
            setConnectionStatus('connected');
        }
    };

    const stopVirtualTryOn = () => {
        setIsTryOnActive(false);
        setConnectionStatus('disconnected');
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

            if (processedCloth && isTryOnActive) {
                try {
                    const poses = await detectorRef.current.estimatePoses(currentVideo);

                    if (poses && poses.length > 0 && poses[0].keypoints) {
                        const personPose = poses[0];
                        let keypoints = personPose.keypoints;

                        // Apply smoothing to keypoints
                        keypoints = smoothKeypoints(keypoints, prevPoseRef.current);
                        prevPoseRef.current = keypoints;

                        const clothPosition = calculateClothPosition(keypoints, canvas);

                        if (clothPosition) {
                            // Draw the clothing image with transparency
                            ctx.globalCompositeOperation = 'source-over';
                            ctx.drawImage(
                                processedCloth,
                                clothPosition.x,
                                clothPosition.y,
                                clothPosition.width,
                                clothPosition.height
                            );

                            // Debug: Draw keypoints (optional)
                            if (process.env.NODE_ENV === 'development') {
                                ctx.fillStyle = 'red';
                                ctx.fillRect(
                                    canvas.width - keypoints.find(k => k.name === 'right_shoulder').x - 5,
                                    keypoints.find(k => k.name === 'right_shoulder').y - 5,
                                    10,
                                    10
                                );
                                ctx.fillRect(
                                    canvas.width - keypoints.find(k => k.name === 'left_shoulder').x - 5,
                                    keypoints.find(k => k.name === 'left_shoulder').y - 5,
                                    10,
                                    10
                                );
                                ctx.fillStyle = 'blue';
                                ctx.fillRect(
                                    canvas.width - keypoints.find(k => k.name === 'nose').x - 5,
                                    keypoints.find(k => k.name === 'nose').y - 5,
                                    10,
                                    10
                                );
                            }
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
    }, [processedCloth, isVideoReady, isTryOnActive]);

    if (error) {
        return (
            <div className="cam-tryon-container">
                <div className="cam-tryon-error-message">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="cam-tryon-reload-button">
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    if (isModelLoading) {
        return (
            <div className="cam-tryon-container">
                <div className="cam-tryon-loading-spinner">
                    <p>Loading AI model for virtual try-on...</p>
                    <div className="cam-tryon-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="cam-tryon-container">
            <h1>Virtual Try-On</h1>
            
            <div className="cam-tryon-upload-section">
                <label htmlFor="cloth-upload" className="cam-tryon-upload-label">
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
                    <div className="cam-tryon-cloth-preview">
                        <p>Cloth Preview:</p>
                        <img
                            src={processedCloth.src}
                            alt="Cloth Preview"
                            className="cam-tryon-preview-image"
                        />
                    </div>
                )}
            </div>

            <div className="cam-tryon-video-container">
                <div className="cam-tryon-connection-status">
                    <span className={`cam-tryon-status-bubble ${connectionStatus}`}>
                        {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="cam-tryon-hidden-video"
                />
                <canvas
                    ref={canvasRef}
                    className="cam-tryon-canvas"
                />
                {!isVideoReady && !error && (
                    <div className="cam-tryon-camera-loading">
                        Waiting for camera feed...
                    </div>
                )}
            </div>

            {!location.state?.processedClothFile && processedCloth && (
                <div className="cam-tryon-controls">
                    <button 
                        onClick={startVirtualTryOn} 
                        className={`cam-tryon-btn ${isTryOnActive ? 'active' : ''}`}
                        disabled={isTryOnActive}
                    >
                        Start Virtual Try-On
                    </button>
                    <button 
                        onClick={stopVirtualTryOn} 
                        className={`cam-tryon-stop-btn ${!isTryOnActive ? 'inactive' : ''}`}
                        disabled={!isTryOnActive}
                    >
                        Stop Virtual Try-On
                    </button>
                </div>
            )}

            <p className="cam-tryon-instruction-text">
                Position yourself in front of the camera for the best try-on experience.
                Stand straight with your shoulders visible for accurate fitting.
            </p>
        </div>
    );
};

export default CamVirtualTryOn;*/