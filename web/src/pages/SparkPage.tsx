import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { OutfitSuggestion } from '../types';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';

export function SparkPage() {
  const { user } = useAuth();
  const [outfit, setOutfit] = useState<OutfitSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [occasion, setOccasion] = useState('');
  const [season, setSeason] = useState('');

  const generateSpark = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await apiService.spark({
        userId: user.uid,
        occasion: occasion || undefined,
        season: season || undefined,
      });
      
      if (response.success) {
        setOutfit(response.outfit);
      } else {
        console.error('Error generating spark:', response.error);
      }
    } catch (error) {
      console.error('Error generating spark:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewSpark = () => {
    setOutfit(null);
    generateSpark();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">One Spark</h1>
        <p className="text-gray-600">
          Get AI-powered outfit suggestions from your wardrobe
        </p>
      </div>

      {!outfit && (
        <div className="max-w-md mx-auto">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Customize Your Spark</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occasion (optional)
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="input"
                >
                  <option value="">Any occasion</option>
                  <option value="casual">Casual</option>
                  <option value="work">Work</option>
                  <option value="formal">Formal</option>
                  <option value="party">Party</option>
                  <option value="gym">Gym</option>
                  <option value="date">Date</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Season (optional)
                </label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="input"
                >
                  <option value="">Any season</option>
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                  <option value="fall">Fall</option>
                  <option value="winter">Winter</option>
                </select>
              </div>
              
              <button
                onClick={generateSpark}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>{loading ? 'Generating...' : 'Generate Spark'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {outfit && (
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Your Outfit Suggestion</h3>
              <button
                onClick={generateNewSpark}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>New Spark</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <h4 className="font-medium text-primary-900 mb-2">Why this outfit works:</h4>
                <p className="text-primary-800">{outfit.why}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Occasion:</span>
                  <span className="ml-2 text-gray-600 capitalize">{outfit.occasion}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Season:</span>
                  <span className="ml-2 text-gray-600 capitalize">{outfit.season}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Style:</span>
                  <span className="ml-2 text-gray-600 capitalize">{outfit.style}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Items:</span>
                  <span className="ml-2 text-gray-600">{outfit.items.length} pieces</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h5 className="font-medium text-gray-700 mb-2">Items in this outfit:</h5>
                <div className="space-y-2">
                  {outfit.items.map((itemId, index) => (
                    <div key={index} className="text-sm text-gray-600 bg-gray-50 rounded px-3 py-2">
                      Item {index + 1}: {itemId}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




