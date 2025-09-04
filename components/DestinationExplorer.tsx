import React, { useState, useCallback } from 'react';
import { getDestinationInfo } from '../services/geminiService';
import type { DestinationInfo } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const suggestedDestinations = [
  { name: 'Tokyo, Japan', imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&q=80', category: 'Trending' },
  { name: 'Paris, France', imageUrl: 'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?w=600&q=80', category: 'Trending' },
  { name: 'Rome, Italy', imageUrl: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=600&q=80', category: 'Culture' },
  { name: 'Bali, Indonesia', imageUrl: 'https://images.unsplash.com/photo-1547291122-20248e353592?w=600&q=80', category: 'Beach' },
  { name: 'New York City, USA', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80', category: 'Trending' },
  { name: 'London, UK', imageUrl: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=600&q=80', category: 'Culture' },
  { name: 'Bangkok, Thailand', imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775ee05?w=600&q=80', category: 'Nightlife' },
  { name: 'Sydney, Australia', imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80', category: 'Beach' },
  { name: 'Kyoto, Japan', imageUrl: 'https://images.unsplash.com/photo-1589793463308-58843a6812a6?w=600&q=80', category: 'Culture' },
  { name: 'Santorini, Greece', imageUrl: 'https://images.unsplash.com/photo-1560953937-4b9671a59207?w=600&q=80', category: 'Romantic' },
];

const DestinationInfoDisplay: React.FC<{ info: DestinationInfo }> = ({ info }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-200/80 mt-8 animate-fade-in">
    <h2 className="text-3xl font-bold text-cyan-800">{info.destinationName}</h2>
    <p className="mt-4 text-stone-600 leading-relaxed">{info.summary}</p>

    <div className="mt-6">
      <h3 className="text-xl font-semibold text-stone-700 mb-2">Key Attractions</h3>
      <ul className="list-disc list-inside space-y-1 text-stone-600">
        {info.keyAttractions.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    </div>

    <div className="mt-6">
      <h3 className="text-xl font-semibold text-stone-700 mb-2">Cultural Tips</h3>
      <ul className="list-disc list-inside space-y-1 text-stone-600">
        {info.culturalTips.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    </div>

    <div className="mt-6 p-4 bg-cyan-50 rounded-lg">
      <h3 className="text-lg font-semibold text-cyan-900">Best Time to Visit</h3>
      <p className="text-cyan-800">{info.bestTimeToVisit}</p>
    </div>
  </div>
);

const DestinationExplorer: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [info, setInfo] = useState<DestinationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<Record<string, DestinationInfo>>({});

  const fetchDestinationInfo = useCallback(async (dest: string) => {
    if (!dest) return;

    const cachedInfo = cache[dest.toLowerCase()];
    if (cachedInfo) {
      setInfo(cachedInfo);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setInfo(null);
    try {
      const destinationInfo = await getDestinationInfo(dest);
      setCache(prev => ({ ...prev, [dest.toLowerCase()]: destinationInfo }));
      setInfo(destinationInfo);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [cache]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDestinationInfo(destination);
  };

  const handleSuggestionClick = (suggestedDest: string) => {
    setDestination(suggestedDest);
    fetchDestinationInfo(suggestedDest);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-cyan-700">🌍 Destination Explorer</h1>
        <p className="text-stone-500 mt-2">Discover your next adventure. Powered by AI.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="sticky top-4 bg-white z-10 flex gap-2 p-3 rounded-xl shadow-md mb-8">
        <Search className="text-stone-500 w-6 h-6 my-auto" />
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Search destinations, e.g., 'beach in Asia'..."
          className="flex-grow px-2 py-2 bg-transparent outline-none text-stone-700"
        />
        <button
          type="submit"
          disabled={isLoading || !destination.trim()}
          className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-700 transition disabled:bg-stone-400"
        >
          Explore
        </button>
      </form>

      {/* Carousel */}
      <h2 className="text-xl font-bold text-stone-700 mb-4">✨ Top Suggestions</h2>
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {suggestedDestinations.map((place) => (
            <button
              key={place.name}
              onClick={() => handleSuggestionClick(place.name)}
              className="relative min-w-[250px] h-64 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition"
            >
              <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute bottom-3 left-3 text-left">
                <h3 className="text-white font-bold text-lg">{place.name}</h3>
                <p className="text-cyan-300 text-sm">{place.category}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mt-8">
        {isLoading && <LoadingSpinner message="Generating travel guide..." />}
        {error && <div className="text-center p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}
        {info && <DestinationInfoDisplay info={info} />}
      </div>
    </div>
  );
};

export default DestinationExplorer;
