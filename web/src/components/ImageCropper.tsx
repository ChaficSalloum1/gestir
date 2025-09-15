import { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { BoundingBox } from '../types';

interface ImageCropperProps {
  imageUrl: string;
  boundingBox: BoundingBox;
  onCrop: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

export function ImageCropper({ imageUrl, boundingBox, onCrop, onCancel }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to match the bounding box
      const cropWidth = boundingBox.w * img.width;
      const cropHeight = boundingBox.h * img.height;
      
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // Calculate source coordinates
      const sourceX = boundingBox.x * img.width;
      const sourceY = boundingBox.y * img.height;

      // Draw the cropped portion
      ctx.drawImage(
        img,
        sourceX, sourceY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );

      setImageLoaded(true);
    };

    img.src = imageUrl;
  }, [imageUrl, boundingBox]);

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedUrl = URL.createObjectURL(blob);
        onCrop(croppedUrl);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Crop Your Image</h3>
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="border border-gray-300 rounded-lg shadow-sm"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleCrop}
              disabled={!imageLoaded}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>Use This Crop</span>
            </button>
            
            <button
              onClick={onCancel}
              className="btn-secondary flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




