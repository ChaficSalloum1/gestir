import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useStorage } from '../hooks/useStorage';
import { apiService } from '../services/api';
import { ImageUpload } from '../components/ImageUpload';
import { PersonDetection } from '../components/PersonDetection';
import { ImageCropper } from '../components/ImageCropper';
import { BoundingBox } from '../types';
import { ArrowRight, Loader2 } from 'lucide-react';

export function UploadPage() {
  const { user } = useAuth();
  const { uploadFile } = useStorage();
  const [step, setStep] = useState<'upload' | 'detect' | 'crop' | 'ingest'>('upload');
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>('');
  const [people, setPeople] = useState<BoundingBox[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<BoundingBox | null>(null);
  const [ingestionResult, setIngestionResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (url: string) => {
    setOriginalImageUrl(url);
    setStep('detect');
    await detectPeople(url);
  };

  const detectPeople = async (imageUrl: string) => {
    setLoading(true);
    try {
      const response = await apiService.detectPeople({ imageUrl });
      if (response.success) {
        setPeople(response.people);
      } else {
        console.error('Error detecting people:', response.error);
      }
    } catch (error) {
      console.error('Error detecting people:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonSelect = (person: BoundingBox) => {
    setSelectedPerson(person);
  };

  const handleCropImage = (imageUrl: string, boundingBox: BoundingBox) => {
    setStep('crop');
  };

  const handleCrop = async (croppedUrl: string) => {
    setCroppedImageUrl(croppedUrl);
    
    // Upload cropped image to Firebase Storage
    if (user) {
      setLoading(true);
      try {
        // Convert blob URL to file
        const response = await fetch(croppedUrl);
        const blob = await response.blob();
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        
        const timestamp = Date.now();
        const fileName = `crops/${user.uid}/${timestamp}-cropped.jpg`;
        const uploadedUrl = await uploadFile(file, fileName);
        
        setCroppedImageUrl(uploadedUrl);
        setStep('ingest');
        await ingestImage(uploadedUrl);
      } catch (error) {
        console.error('Error uploading cropped image:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const ingestImage = async (imageUrl: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await apiService.ingest({ 
        imageUrl, 
        userId: user.uid 
      });
      
      if (response.success) {
        setIngestionResult(response.result);
      } else {
        console.error('Error ingesting image:', response.error);
      }
    } catch (error) {
      console.error('Error ingesting image:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('upload');
    setOriginalImageUrl('');
    setCroppedImageUrl('');
    setPeople([]);
    setSelectedPerson(null);
    setIngestionResult(null);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Photo</h1>
        <p className="text-gray-600">
          Upload a photo of yourself or a group to get started
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {['Upload', 'Detect', 'Crop', 'Ingest'].map((stepName, index) => {
            const stepIndex = ['upload', 'detect', 'crop', 'ingest'].indexOf(step);
            const isActive = index === stepIndex;
            const isCompleted = index < stepIndex;
            
            return (
              <div key={stepName} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted
                      ? 'bg-primary-600 text-white'
                      : isActive
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  isActive ? 'text-primary-600 font-medium' : 'text-gray-500'
                }`}>
                  {stepName}
                </span>
                {index < 3 && (
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      {step === 'upload' && (
        <div className="max-w-2xl mx-auto">
          <ImageUpload
            onUpload={handleImageUpload}
            userId={user?.uid || ''}
            disabled={loading}
          />
        </div>
      )}

      {step === 'detect' && (
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="card text-center">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary-600 mb-4" />
              <p className="text-gray-600">Detecting people in your image...</p>
            </div>
          ) : (
            <PersonDetection
              imageUrl={originalImageUrl}
              people={people}
              onSelectPerson={handlePersonSelect}
              onCropImage={handleCropImage}
            />
          )}
        </div>
      )}

      {step === 'crop' && selectedPerson && (
        <div className="max-w-2xl mx-auto">
          <ImageCropper
            imageUrl={originalImageUrl}
            boundingBox={selectedPerson}
            onCrop={handleCrop}
            onCancel={() => setStep('detect')}
          />
        </div>
      )}

      {step === 'ingest' && (
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="card text-center">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary-600 mb-4" />
              <p className="text-gray-600">Analyzing your clothing items...</p>
            </div>
          ) : ingestionResult ? (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Items Added to Your Wardrobe</h3>
                <div className="space-y-4">
                  {ingestionResult.items.map((item: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div><span className="font-medium">Category:</span> {item.category}</div>
                        <div><span className="font-medium">Style:</span> {item.style}</div>
                        <div><span className="font-medium">Colors:</span> {item.colors.join(', ')}</div>
                        <div><span className="font-medium">Materials:</span> {item.materials.join(', ')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetFlow}
                  className="btn-secondary"
                >
                  Upload Another Photo
                </button>
                <button
                  onClick={() => window.location.href = '/spark'}
                  className="btn-primary"
                >
                  Get Outfit Suggestions
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}




