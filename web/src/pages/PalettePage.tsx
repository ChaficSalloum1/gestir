import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { ColorCapsulePlan } from '../types';
import { Palette, Loader2, RefreshCw, Image as ImageIcon } from 'lucide-react';

export function PalettePage() {
  const { user } = useAuth();
  const [capsule, setCapsule] = useState<ColorCapsulePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [colorGoals, setColorGoals] = useState('');

  const generatePalette = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await apiService.palette({
        userId: user.uid,
        colorGoals: colorGoals ? colorGoals.split(',').map(c => c.trim()) : undefined,
      });
      
      if (response.success) {
        setCapsule(response.capsule);
      } else {
        console.error('Error generating palette:', response.error);
      }
    } catch (error) {
      console.error('Error generating palette:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewPalette = () => {
    setCapsule(null);
    generatePalette();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Color Goals</h1>
        <p className="text-gray-600">
          Create a cohesive 3-look capsule wardrobe with AI-generated style tiles
        </p>
      </div>

      {!capsule && (
        <div className="max-w-md mx-auto">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Set Your Color Goals</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Goals (optional)
                </label>
                <input
                  type="text"
                  value={colorGoals}
                  onChange={(e) => setColorGoals(e.target.value)}
                  placeholder="e.g., navy, white, beige"
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple colors with commas
                </p>
              </div>
              
              <button
                onClick={generatePalette}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Palette className="h-4 w-4" />
                )}
                <span>{loading ? 'Generating...' : 'Generate Color Capsule'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {capsule && (
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">{capsule.name}</h3>
              <button
                onClick={generateNewPalette}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>New Palette</span>
              </button>
            </div>
            
            {/* Generated Images */}
            {capsule.generatedImages.length > 0 && (
              <div className="mb-8">
                <h4 className="text-md font-medium text-gray-700 mb-4">Generated Style Tiles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {capsule.generatedImages.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Generated style tile ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg shadow-sm"
                        onError={(e) => {
                          // Fallback for demo purposes
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div 
                        className="hidden w-full h-64 bg-gray-100 rounded-lg shadow-sm items-center justify-center"
                      >
                        <div className="text-center text-gray-500">
                          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                          <p>Generated Image {index + 1}</p>
                          <p className="text-sm">(Demo placeholder)</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Looks */}
            <div className="space-y-6">
              <h4 className="text-md font-medium text-gray-700">Capsule Looks</h4>
              {capsule.looks.map((look, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">{look.name}</h5>
                  <p className="text-sm text-gray-600 mb-3">{look.description}</p>
                  
                  <div className="space-y-2">
                    <h6 className="text-sm font-medium text-gray-700">Items in this look:</h6>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {look.items.map((itemId, itemIndex) => (
                        <div key={itemIndex} className="text-sm text-gray-600 bg-gray-50 rounded px-3 py-2">
                          Item {itemIndex + 1}: {itemId}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




