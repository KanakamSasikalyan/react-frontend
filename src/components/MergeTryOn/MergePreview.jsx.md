// src/components/MergeTryOn/MergePreview.jsx
import React, { useEffect, useState } from 'react';
import mergeImages from 'merge-images';

const MergePreview = ({ personImage, clothingImage }) => {
  const [mergedImage, setMergedImage] = useState(null);

  useEffect(() => {
    mergeImages([
      { src: personImage, x: 0, y: 0 },
      { src: clothingImage, x: 300, y: 300 } // Adjust coordinates as needed
    ])
      .then(setMergedImage)
      .catch((err) => console.error('Image merge failed:', err));
  }, [personImage, clothingImage]);

  return (
    <div>
      <h2>Virtual Try-On Preview</h2>
      {mergedImage ? <img src={mergedImage} alt="Merged result" /> : <p>Loading merged image...</p>}
    </div>
  );
};

export default MergePreview;
