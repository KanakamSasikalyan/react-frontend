import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  backgroundColor: '#f5f5f5',
  flexDirection: 'column',
};

const cameraContainerStyle = {
  position: 'relative',
  width: '800px',
  height: '800px',
  border: '2px solid #ccc',
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: '#000',
};

const clothingOverlayStyle = {
  position: 'absolute',
  zIndex: 3,
  cursor: 'move',
  border: '2px dashed #007bff',
  borderRadius: '4px',
};

const titleStyle = {
  marginBottom: '20px',
  fontSize: '1.5rem',
  color: '#333',
};

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

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Smart Virtual Try-On (Camera)</h2>
      <div style={cameraContainerStyle}>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, objectFit: 'cover', borderRadius: '12px' }}
        />
        <div>
          <Draggable defaultPosition={dragPos} onStop={(e, data) => setDragPos({ x: data.x, y: data.y })}>
            <ResizableBox
              width={clothSize.width}
              height={clothSize.height}
              minConstraints={[100, 100]}
              maxConstraints={[600, 600]}
              onResizeStop={(e, data) => {
                setClothSize({ width: data.size.width, height: data.size.height });
              }}
              resizeHandles={["se", "ne", "sw", "nw"]}
            >
              <img
                src={clothImg}
                alt="Clothing"
                style={{ ...clothingOverlayStyle, width: '100%', height: '100%', pointerEvents: 'none', userSelect: 'none' }}
              />
            </ResizableBox>
          </Draggable>
        </div>
      </div>
    </div>
  );
};

export default SmartTryOnCamera;
