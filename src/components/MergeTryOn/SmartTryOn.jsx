import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css'; // Required for resize handles

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2rem',
  backgroundColor: '#ffffff',
};

const imageContainerStyle = {
  position: 'relative',
  display: 'inline-block',
  border: '1px solid #ddd',
  borderRadius: '8px',
  overflow: 'hidden',
};

const clothingOverlayStyle = {
  position: 'absolute',
  cursor: 'move',
  border: '2px dashed #007bff',
  borderRadius: '4px',
};

const SmartTryOn = () => {
  const personImg = '/images/man2.jpg';
  const clothImg = '/images/shopping-trans.png';
  const imageRef = useRef();
  const [faceBox, setFaceBox] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 100, y: 100 });
  const [clothSize, setClothSize] = useState({ width: 250, height: 200 });

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      detectFace();
    };

    const detectFace = async () => {
      const img = imageRef.current;
      const detections = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (detections && detections.landmarks) {
        const landmarks = detections.landmarks;
        const leftShoulder = landmarks.getLeftEyeBrow()[0];
        const rightShoulder = landmarks.getRightEyeBrow()[4];

        const x = leftShoulder.x;
        const y = leftShoulder.y + 40;
        const width = rightShoulder.x - leftShoulder.x + 190;

        setDragPos({ x, y });
        setClothSize({ width, height: 210 });
        setFaceBox(detections.detection.box);
      }
    };

    loadModels();
  }, []);

  return (
    <div style={containerStyle}>
      <h2>Smart Virtual Try-On</h2>
      <div style={imageContainerStyle}>
        <img ref={imageRef} src={personImg} alt="User" crossOrigin="anonymous" width={400} />
        {faceBox && (
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
                style={{ ...clothingOverlayStyle, width: '100%', height: '100%', pointerEvents: 'none', userSelect: 'none' }}
              />
            </ResizableBox>
          </Draggable>
        )}
      </div>
    </div>
  );
};

export default SmartTryOn;
