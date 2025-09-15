import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { BoundingBox } from '../types';

interface PersonDetectionProps {
  imageUrl: string;
  people: BoundingBox[];
  onSelectPerson: (person: BoundingBox) => void;
  onCropImage: (imageUrl: string, boundingBox: BoundingBox) => void;
}

export function PersonDetection({ 
  imageUrl, 
  people, 
  onSelectPerson, 
  onCropImage 
}: PersonDetectionProps) {
  const [selectedPerson, setSelectedPerson] = useState<BoundingBox | null>(null);

  const handlePersonClick = (person: BoundingBox) => {
    setSelectedPerson(person);
    onSelectPerson(person);
  };

  const handleCrop = () => {
    if (selectedPerson) {
      onCropImage(imageUrl, selectedPerson);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative inline-block">
        <img
          src={imageUrl}
          alt="Uploaded image"
          className="max-w-full h-auto rounded-lg shadow-sm"
        />
        
        {/* Overlay bounding boxes */}
        {people.map((person, index) => (
          <div
            key={index}
            className={`absolute border-2 cursor-pointer transition-all ${
              selectedPerson === person
                ? 'border-primary-500 bg-primary-500/20'
                : 'border-yellow-400 bg-yellow-400/20 hover:border-yellow-500'
            }`}
            style={{
              left: `${person.x * 100}%`,
              top: `${person.y * 100}%`,
              width: `${person.w * 100}%`,
              height: `${person.h * 100}%`,
            }}
            onClick={() => handlePersonClick(person)}
          >
            <div className="absolute -top-6 left-0 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {person.caption} ({Math.round(person.confidence * 100)}%)
            </div>
          </div>
        ))}
      </div>

      {selectedPerson && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Selected Person</h3>
          <p className="text-sm text-gray-600 mb-4">
            {selectedPerson.caption} (Confidence: {Math.round(selectedPerson.confidence * 100)}%)
          </p>
          <button
            onClick={handleCrop}
            className="btn-primary flex items-center space-x-2"
          >
            <Check className="h-4 w-4" />
            <span>That's me - Crop & Continue</span>
          </button>
        </div>
      )}

      {people.length === 0 && (
        <div className="card text-center">
          <X className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">No people detected in this image</p>
        </div>
      )}
    </div>
  );
}




