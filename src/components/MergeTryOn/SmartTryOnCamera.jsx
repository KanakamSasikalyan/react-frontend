import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import './SmartTryOnCamera.css';
import API_BASE_URL from '../../config/apiConfig';

const SmartTryOnCamera = () => {
  const webcamRef = useRef();
  const [dragPos, setDragPos] = useState({ x: 100, y: 100 });
  const [clothSize, setClothSize] = useState({ width: 650, height: 600 });
  const [clothImg] = useState('/images/shopping-trans.png');
  const [dimensions] = useState({ width: 800, height: 800 }); // 1:1 ratio

  const videoConstraints = {
    width: 400,
    height: 400,
    facingMode: 'user',
  };

  const handleSaveTryOn = async () => {
    try {
      const screenshot = webcamRef.current.getScreenshot();
      const response = await fetch(`${API_BASE_URL}/api/tryon/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: screenshot }),
      });

      if (response.ok) {
        alert('Try-on saved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to save try-on: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error saving try-on:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f5f5',
        flexDirection: 'column',
      }}
    >
      <h2 style={{ marginBottom: '20px' }}>Smart Virtual Try-On (Camera)</h2>

      <div
        style={{
          position: 'relative',
          width: dimensions.width,
          height: dimensions.height,
          border: '2px solid #ccc',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#000',
        }}
      >
        {/* Camera Video */}
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          width={dimensions.width}
          height={dimensions.height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            objectFit: 'cover',
            borderRadius: '12px',
          }}
        />

        {/* Clothing Overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 3 }}>
          <Draggable
            defaultPosition={dragPos}
            onStop={(e, data) => setDragPos({ x: data.x, y: data.y })}
          >
            <ResizableBox
              width={clothSize.width}
              height={clothSize.height}
              minConstraints={[100, 100]}
              maxConstraints={[600, 600]}
              onResizeStop={(e, data) => {
                setClothSize({ width: data.size.width, height: data.size.height });
              }}
              resizeHandles={['se', 'ne', 'sw', 'nw']}
            >
              <img
                src={clothImg}
                alt="Clothing"
                style={{
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              />
            </ResizableBox>
          </Draggable>
        </div>
      </div>
    </div>
  );
};

export default SmartTryOnCamera;
