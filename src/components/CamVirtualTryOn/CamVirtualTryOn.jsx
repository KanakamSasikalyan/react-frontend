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

    // Load OpenCV.js - Modified to only check for OpenCV readiness, not load the script
    useEffect(() => {
        const checkOpenCV = () => {
            if (window.cv && window.cv.Mat) {
                opencvRef.current = window.cv;
                // Ensure onRuntimeInitialized is called, though it might have been already
                if (window.cv.onRuntimeInitialized) {
                    window.cv.onRuntimeInitialized(() => {
                        console.log('OpenCV ready');
                        setIsOpenCVReady(true);
                    });
                } else {
                    // Fallback for cases where it's already initialized
                    console.log('OpenCV ready (already initialized)');
                    setIsOpenCVReady(true);
                }
                return true;
            }
            return false;
        };

        if (!checkOpenCV()) {
            const intervalId = setInterval(() => {
                if (checkOpenCV()) {
                    clearInterval(intervalId);
                }
            }, 100);

            return () => clearInterval(intervalId);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            stopTryOn();
            // No need to remove script as it's loaded in index.html
        };
    }, []);

    const processClothImage = async (imageData) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const cv = opencvRef.current;
                    if (!cv) {
                        throw new Error("OpenCV not loaded yet");
                    }

                    // Create canvas and draw image
                    const clothCanvas = document.createElement('canvas');
                    clothCanvas.width = img.width;
                    clothCanvas.height = img.height;
                    const ctx = clothCanvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    // Convert canvas to ImageData
                    const imageData = ctx.getImageData(0, 0, clothCanvas.width, clothCanvas.height);
                    
                    // Create OpenCV mat from ImageData
                    const src = cv.matFromImageData(imageData);
                    
                    let clothRgb, mask;
                    
                    if (src.channels() === 4) {
                        // For PNG with alpha channel
                        const rgbaPlanes = new cv.MatVector();
                        cv.split(src, rgbaPlanes);
                        clothRgb = new cv.Mat();
                        const rgbPlanes = new cv.MatVector();
                        rgbPlanes.push_back(rgbaPlanes.get(0));
                        rgbPlanes.push_back(rgbaPlanes.get(1));
                        rgbPlanes.push_back(rgbaPlanes.get(2));
                        cv.merge(rgbPlanes, clothRgb);
                        mask = rgbaPlanes.get(3);
                        rgbaPlanes.delete();
                        rgbPlanes.delete();
                    } else {
                        // For JPG or other formats without alpha
                        clothRgb = src.clone();
                        const gray = new cv.Mat();
                        cv.cvtColor(clothRgb, gray, cv.COLOR_RGBA2GRAY);
                        mask = new cv.Mat();
                        cv.threshold(gray, mask, 240, 255, cv.THRESH_BINARY_INV);
                        
                        // Clean up mask
                        const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
                        cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, kernel, new cv.Point(-1, -1), 2);
                        gray.delete();
                        kernel.delete();
                    }
                    
                    // Find largest contour
                    const contours = new cv.MatVector();
                    const hierarchy = new cv.Mat();
                    cv.findContours(mask.clone(), contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
                    
                    let largestContourIndex = -1;
                    let maxArea = 0;
                    for (let i = 0; i < contours.size(); ++i) {
                        const area = cv.contourArea(contours.get(i));
                        if (area > maxArea) {
                            maxArea = area;
                            largestContourIndex = i;
                        }
                    }
                    
                    if (largestContourIndex === -1) {
                        src.delete();
                        clothRgb.delete();
                        mask.delete();
                        contours.delete();
                        hierarchy.delete();
                        throw new Error("Could not find cloth in the image");
                    }
                    
                    // Get bounding rect with expansion
                    const boundingRect = cv.boundingRect(contours.get(largestContourIndex));
                    const expand = 20;
                    const x = Math.max(0, boundingRect.x - expand);
                    const y = Math.max(0, boundingRect.y - expand);
                    const w = Math.min(clothRgb.cols - x, boundingRect.width + 2 * expand);
                    const h = Math.min(clothRgb.rows - y, boundingRect.height + 2 * expand);
                    
                    // Crop cloth and mask
                    const clothCropped = clothRgb.roi(new cv.Rect(x, y, w, h));
                    const maskCropped = mask.roi(new cv.Rect(x, y, w, h));
                    
                    // Clean up
                    src.delete();
                    clothRgb.delete();
                    mask.delete();
                    contours.delete();
                    hierarchy.delete();
                    
                    resolve({
                        cloth: clothCropped,
                        mask: maskCropped
                    });
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = URL.createObjectURL(imageData);
        });
    };

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
            // Wait for the video element to be in the DOM and ready
            let attempts = 0;
            const waitForVideo = (resolve, reject) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play();
                        resolve();
                    };
                } else if (attempts < 10) {
                    attempts++;
                    setTimeout(() => waitForVideo(resolve, reject), 100);
                } else {
                    reject('Video element not found after waiting.');
                }
            };
            await new Promise(waitForVideo);
            startFrameProcessing();
        } catch (err) {
            console.error("Error accessing webcam:", err);
            setErrorMessage("Could not access webcam. Please ensure permissions are granted.");
            stopTryOn();
        }
    };

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

    const detectUpperBody = (frameMat) => {
        const cv = opencvRef.current;
        try {
            // Simplified upper body detection - assumes person is centered
            const centerX = frameMat.cols / 2;
            const centerY = frameMat.rows / 2;
            
            // Adjust these values based on your needs
            const bodyWidth = frameMat.cols * 0.4;  // 40% of frame width
            const bodyHeight = frameMat.rows * 0.6;  // 60% of frame height
            
            const leftShoulderX = Math.max(0, centerX - bodyWidth/2);
            const rightShoulderX = Math.min(frameMat.cols - 1, centerX + bodyWidth/2);
            const neckY = centerY - bodyHeight * 0.2;
            const hipsY = Math.min(frameMat.rows - 1, centerY + bodyHeight * 0.8);
            
            return [leftShoulderX, neckY, rightShoulderX, hipsY];
        } catch (error) {
            console.error("Error detecting upper body:", error);
            return null;
        }
    };

    const overlayCloth = (frameMat, upperBodyRect, clothMat, clothMaskMat) => {
        const cv = opencvRef.current;
        try {
            const [x1, y1, x2, y2] = upperBodyRect;
            const roiWidth = x2 - x1;
            const roiHeight = y2 - y1;
            
            // Resize cloth to ROI dimensions
            const resizedCloth = new cv.Mat();
            const resizedMask = new cv.Mat();
            cv.resize(clothMat, resizedCloth, new cv.Size(roiWidth, roiHeight));
            cv.resize(clothMaskMat, resizedMask, new cv.Size(roiWidth, roiHeight));
            
            // Normalize mask
            const normalizedMask = new cv.Mat();
            resizedMask.convertTo(normalizedMask, cv.CV_32F, 1.0/255.0);
            
            // Get ROI from frame
            const roi = frameMat.roi(new cv.Rect(x1, y1, roiWidth, roiHeight));
            
            // Create inverse mask
            const inverseMask = new cv.Mat();
            cv.subtract(cv.Mat.ones(normalizedMask.rows, normalizedMask.cols, cv.CV_32F), 
                         normalizedMask, inverseMask);
            
            // Apply mask to ROI and cloth
            const roiMasked = new cv.Mat();
            const clothMasked = new cv.Mat();
            
            cv.multiply(roi, cv.merge([inverseMask, inverseMask, inverseMask]), roiMasked);
            cv.multiply(resizedCloth, cv.merge([normalizedMask, normalizedMask, normalizedMask]), clothMasked);
            
            // Combine them
            const blended = new cv.Mat();
            cv.add(roiMasked, clothMasked, blended);
            blended.copyTo(roi);
            
            // Clean up
            resizedCloth.delete();
            resizedMask.delete();
            normalizedMask.delete();
            roi.delete();
            inverseMask.delete();
            roiMasked.delete();
            clothMasked.delete();
            blended.delete();
        } catch (error) {
            console.error("Error overlaying cloth:", error);
        }
    };

    const startFrameProcessing = () => {
        const processFrame = () => {
            if (!videoRef.current || !canvasRef.current || !outputCanvasRef.current || 
                !opencvRef.current || !isTryingOn || !processedCloth || !clothMask ||
                videoRef.current.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) {
                animationFrameRef.current = requestAnimationFrame(processFrame);
                return;
            }

            try {
                const cv = opencvRef.current;
                const context = canvasRef.current.getContext('2d');
                // Set canvas dimensions to match video
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                // Draw video frame to canvas
                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                // Get image data from canvas
                const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
                // Create OpenCV mat from image data
                let frameMat = cv.matFromImageData(imageData);
                // Mirror effect (like webcam mirror)
                cv.flip(frameMat, frameMat, 1);
                // Detect upper body
                const upperBodyRect = detectUpperBody(frameMat);
                if (upperBodyRect) {
                    // Overlay the cloth
                    overlayCloth(frameMat, upperBodyRect, processedCloth, clothMask);
                }
                // Display result
                // Fix: clear the output canvas before drawing
                const outCtx = outputCanvasRef.current.getContext('2d');
                outCtx.clearRect(0, 0, outputCanvasRef.current.width, outputCanvasRef.current.height);
                cv.imshow(outputCanvasRef.current, frameMat);
                // Clean up
                frameMat.delete();
            } catch (error) {
                console.error("Error processing frame:", error);
            }
            animationFrameRef.current = requestAnimationFrame(processFrame);
        };
        animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    const handleFileChange = async (event) => {
        if (!event.target.files || event.target.files.length === 0) return;
        
        setErrorMessage('');
        setIsLoading(true);
        
        try {
            const clothData = await processClothImage(event.target.files[0]);
            setProcessedCloth(clothData.cloth);
            setClothMask(clothData.mask);
            setClothFile(event.target.files[0]);
        } catch (error) {
            console.error("Error processing cloth image:", error);
            setErrorMessage("Failed to process cloth image. Please try another image.");
        } finally {
            setIsLoading(false);
        }
    };

    const startTryOn = async () => {
        if (!clothFile) {
            setErrorMessage("Please upload a cloth image first.");
            return;
        }
        if (!processedCloth || !clothMask) {
            setErrorMessage("Cloth image not processed yet. Please wait or try another image.");
            return;
        }
        if (!isOpenCVReady) {
            setErrorMessage("Computer vision library is still loading. Please wait.");
            return;
        }
        setIsTryingOn(true);
        setErrorMessage('');
        await startWebcam();
    };

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