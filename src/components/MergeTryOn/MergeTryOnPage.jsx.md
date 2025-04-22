// src/components/MergeTryOn/MergeTryOnPage.jsx
import React from 'react';
import MergePreview from './MergePreview';

const MergeTryOnPage = () => {
  const personImage = '/images/man4.jpg';        // Make sure this is in public/images
  const clothingImage = '/images/shopping.png';  // Also in public/images

  return (
    <div>
      <h1>Try-On Clothing</h1>
      <MergePreview personImage={personImage} clothingImage={clothingImage} />
    </div>
  );
};

export default MergeTryOnPage;
