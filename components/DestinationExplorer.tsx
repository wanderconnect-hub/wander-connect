import React, { useState, useCallback, useEffect } from "react";
import { getDestinationInfo, getItinerary } from "../services/geminiService";
import type { DestinationInfo } from "../types";
import LoadingSpinner from "./LoadingSpinner";

const suggestedDestinations = [
  { name: "Tokyo, Japan", imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&q=80" },
  { name: "Paris, France", imageUrl: "https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?w=400&q=80" },
  { name: "Rome, Italy", imageUrl: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400&q=80" },
  { name: "Bali, Indonesia", imageUrl: "https://images.unsplash.com/photo-1547291122-20248e353592?w=400&q=80" },
  { name: "New York City, USA", imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80" },
  { name: "London, UK", imageUrl: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=400&q=80" },
  { name: "Bangkok, Thailand", imageUrl: "https://images.unsplash.com/photo-1563492065599-3520f775ee05?w=400&q=80" },
  { name: "Sydney, Australia", imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&q=80" },
  { name: "Kyoto, Japan", imageUrl: "https://images.unsplash.com/photo-1589793463308-58843a6812a6?w=400&q=80" },
  { name: "Santorini, Greece", imageUrl: "https://images.unsplash.com/photo-1560953937-4b9671a59207?w=400&q=80" },
];

//
// Destination Info Section
//
const DestinationInfoDisplay: React.FC<{ info: DestinationInfo; itinerary: string[] | null }> = ({
  info,
  itinerary,
}) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-stone-200/80 mt-8 animate-fade-in">
    <h2 className="text-3xl font-bold text-cyan-800">{info.destinationName}</h2>
    <p className="mt-4 text-stone-600 leading-relaxed">{info.summary}</p>

    <div className="mt-6">
      <h3 className="text-xl font-semibold text-stone-700 mb-2">Key Attractions</h3>
      <ul className="list-disc list-inside space-y-1 text-stone-600">
        {info.keyAttractions.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>

    <div className="mt-6">
      <h3 className="text-xl font-semibold text-stone-700 mb-2">Cultural Tips</h3>
      <ul className="list-disc list-inside space-y-1 text-stone-600">
        {info.culturalTips.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>

    <div className="mt-6 p-4 bg-cyan-50 rounded-lg">
      <h3 className="text-lg font-semibold text-cyan-900">Best Time to Visit</h3>
      <p className="text-cyan-800">{info.bestTimeToVisit}</p>
    </div>

    {/* AI-generated itinerary */}
    {itinerary && (
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-cyan-700 mb-2">AI-Generated 3-Day Itinerary</h3>
        <ul className="list-disc list-inside space-y-1 text-stone-600">
          {itinerary.map((day, i) => (
            <li key={i}>{day}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

//
// Main Component
//
const DestinationExplorer: React.FC = () => {
  const [destination, setDestination] = useState("");
  const [info, setInfo] = useState<DestinationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<Record<string, DestinationInfo>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const groups = Math.ceil(suggestedDestinations.length / 3);

  const fetchDestinationInfo = useCallback(
    async (dest: string) => {
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
      setItinerary(null);
      try {
        const destinationInfo = await getDestinationInfo(dest);
        setCache((prev) => ({ ...prev, [dest.toLowerCase()]: destinationInfo }));
        setInfo(destinationInfo);
      } catch (err: any) {
        setError(err.message || "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    },
    [cache]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDestinationInfo(destination);
  };

  const handleSuggestionClick = (suggestedDest: string) => {
    setDestination(suggestedDest);
    fetchDestinationInfo(suggestedDest);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % groups);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [groups]);

  // Generate AI Itinerary
  const handleGenerateItinerary = async () => {
    if (!destination) return;
    try {
      const result = await getItinerary(destination);
      setItinerary(result.itinerary || []);
    } catch {
      setItinerary(["❌ Could not generate itinerary. Try again."]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-cyan-700 mb-2">Destination Explorer</h1>
        <p className="text-stone-500 mb-6">Discover your next adventure. Powered by AI.</p>
      </div>

      {/* Carousel */}
      <div className="mb-8 relative">
        <h2 className="text-lg font-bold text-stone-600 mb-4 text-center">Top Suggestions</h2>
        <div className="relative overflow-hidden rounded-xl shadow-lg">
          <div
            className="flex transition-transform duration-700"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              width: `${groups * 100}%`,
            }}
          >
            {Array.from({ length: groups }).map((_, groupIdx) => (
              <div key={groupIdx} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full flex-shrink-0 p-4">
                {suggestedDestinations.slice(groupIdx * 3, groupIdx * 3 + 3).map((place) => (
                  <button
                    key={place.name}
                    onClick={() => handleSuggestionClick(place.name)}
                    className="relative bg-white rounded-xl shadow hover:shadow-lg overflow-hidden group focus:outline-none"
                  >
                    <img
                      src={place.imageUrl}
                      alt={place.name}
                      className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 p-3 w-full">
                      <h3 className="text-white font-bold text-base leading-tight drop-shadow-md text-left">
                        {place.name}
                      </h3>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-cyan-600 text-white px-3 py-2 rounded-full shadow-md hover:bg-cyan-700"
        >
          ▶
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Or enter a city or place..."
          className="flex-grow px-4 py-3 bg-white border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <button
          type="submit"
          disabled={isLoading || !destination.trim()}
          className="bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-stone-400"
        >
          Explore
        </button>
      </form>

      {/* Info */}
      <div className="mt-6">
        {isLoading && <LoadingSpinner message="Generating travel guide..." />}
        {error && <div className="text-center p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}
        {info && <DestinationInfoDisplay info={info} itinerary={itinerary} />}
      </div>
    </div>
  );
};

export default DestinationExplorer;
