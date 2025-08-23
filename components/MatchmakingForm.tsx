
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { findTravelMatches } from '../services/geminiService';
import type { TravelPreferences, MatchResult, TravelPartnerRequest, User } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { HeartIcon, XMarkIcon, ArrowPathIcon, MOCK_RAW_REQUESTS, ChevronLeftIcon, ChevronRightIcon, TRAVEL_STYLES, INTERESTS } from '../constants';

const PartnerRequestCard: React.FC<{ 
    request: TravelPartnerRequest; 
    onConnect: (userId: number) => void; 
    onPass: (userId: number) => void;
}> = ({ request, onConnect, onPass }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const timerRef = useRef<number | null>(null);

    const handleConnectClick = () => {
        setIsConnecting(true);
        setIsDismissed(true);
        timerRef.current = window.setTimeout(() => onConnect(request.user.id), 300);
    };
    
    const handlePassClick = () => {
        setIsDismissed(true);
        timerRef.current = window.setTimeout(() => onPass(request.user.id), 300);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return (
        <div className={`relative flex-shrink-0 w-72 h-96 rounded-2xl shadow-lg overflow-hidden group transition-all duration-300 ${isDismissed ? 'opacity-0 scale-95' : ''}`}>
            <img src={request.imageUrl} alt={request.user.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="relative h-full flex flex-col justify-between p-4 text-white">
                {/* Clickable upper part */}
                <Link to={`/profile/${request.user.id}`} className="block">
                    <div className="flex items-center gap-3">
                        <img className="h-12 w-12 rounded-full object-cover border-2 border-white/80" src={request.user.avatarUrl} alt={request.user.name} />
                        <div>
                            <p className="font-bold text-lg">{request.user.name}</p>
                            <p className="text-xs text-white/90">Wants to connect</p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm leading-snug line-clamp-4">
                        {request.tripDescription}
                    </p>
                </Link>

                {/* Action buttons */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handlePassClick}
                        disabled={isDismissed}
                        className="flex-1 bg-white/20 backdrop-blur-sm text-white font-bold py-2.5 px-4 rounded-lg hover:bg-white/30 transition-colors"
                    >
                        Pass
                    </button>
                    <button 
                        onClick={handleConnectClick}
                        disabled={isDismissed}
                        className="flex-1 bg-cyan-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-cyan-600 transition-colors disabled:bg-cyan-400/80"
                    >
                        {isConnecting ? 'Connected!' : 'Connect'}
                    </button>
                </div>
            </div>
        </div>
    );
};


interface MatchmakingFormProps {
    currentUser: User;
    allUsers: User[];
    onAddConnection: (partnerId: number) => void;
}

const MatchmakingForm: React.FC<MatchmakingFormProps> = ({ currentUser, allUsers, onAddConnection }) => {
  const [preferences, setPreferences] = useState<TravelPreferences>({
    destination: '',
    travelStyle: [],
    interests: [],
    bio: '',
  });
  const [results, setResults] = useState<MatchResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'none'>('none');
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partnerRequests, setPartnerRequests] = useState<TravelPartnerRequest[]>([]);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  useEffect(() => {
    const liveRequests = MOCK_RAW_REQUESTS
      .filter(request => request.userId !== currentUser.id)
      .map(rawRequest => {
        const user = allUsers.find(u => u.id === rawRequest.userId);
        if (user) {
            return {
                user,
                tripDescription: rawRequest.tripDescription,
                imageUrl: rawRequest.imageUrl,
            };
        }
        return null;
    }).filter((req): req is TravelPartnerRequest => req !== null);
    
    setPartnerRequests(liveRequests);
  }, [allUsers, currentUser.id]);

  const handleConnectClick = (partnerId: number) => {
    onAddConnection(partnerId);
    setPartnerRequests(prev => prev.filter(req => req.user.id !== partnerId));
  };
  
  const handlePassClick = (partnerId: number) => {
      setPartnerRequests(prev => prev.filter(req => req.user.id !== partnerId));
  };

  useEffect(() => {
    const checkScrollable = () => {
        if (scrollContainerRef.current) {
            const { scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowScrollButtons(scrollWidth > clientWidth);
        } else {
            setShowScrollButtons(false);
        }
    };
    // A slight delay to ensure content has rendered before checking
    const timer = setTimeout(checkScrollable, 100);
    window.addEventListener('resize', checkScrollable);
    return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', checkScrollable);
    };
  }, [partnerRequests]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
        const scrollAmount = 304; // width of card (288) + gap (16)
        scrollContainerRef.current.scrollBy({
            left: direction === 'right' ? scrollAmount : -scrollAmount,
            behavior: 'smooth',
        });
    }
  };

  const handleCheckboxChange = (field: 'travelStyle' | 'interests', value: string) => {
    setPreferences(prev => {
        const list = prev[field];
        if (list.includes(value)) {
            return { ...prev, [field]: list.filter(item => item !== value) };
        } else {
            return { ...prev, [field]: [...list, value] };
        }
    });
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults([]);

    if (preferences.travelStyle.length === 0 || preferences.interests.length === 0) {
        setError("Please select at least one Travel Style and one Interest for better matches.");
        setIsLoading(false);
        return;
    }

    try {
      const matchResults = await findTravelMatches(preferences, currentUser, allUsers);
      if (matchResults && matchResults.length > 0) {
        setResults(matchResults);
        setShowResults(true);
      } else {
        setError("Couldn't find any matches for these preferences. Try being a bit broader!");
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [preferences, currentUser, allUsers]);
  
  const handleSwipe = (direction: 'left' | 'right') => {
      setSwipeDirection(direction);
  };
  
  useEffect(() => {
    if (swipeDirection === 'none') return;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection('none');
    }, 500); // match animation duration

    return () => clearTimeout(timer);
  }, [swipeDirection]);

  const handleReset = () => {
      setPreferences({ destination: '', travelStyle: [], interests: [], bio: '' });
      setResults([]);
      setCurrentIndex(0);
      setShowResults(false);
      setError(null);
  };


  const renderForm = () => (
     <div className="bg-white p-6 rounded-xl shadow-md border border-stone-200/80">
        <h1 className="text-3xl font-bold text-center text-cyan-700 mb-2">Find Your Travel Tribe</h1>
        <p className="text-center text-stone-500 mb-6">Let our AI find the perfect travel companions for your next adventure.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-stone-700">Dream Destination</label>
            <input type="text" id="destination" value={preferences.destination} onChange={e => setPreferences({...preferences, destination: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., Kyoto, Japan" required />
          </div>

          <div>
            <h3 className="text-sm font-medium text-stone-700">Travel Style</h3>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TRAVEL_STYLES.map(style => (
                <label key={style} className="flex items-center space-x-2 p-2 rounded-md hover:bg-cyan-50 cursor-pointer">
                  <input type="checkbox" checked={preferences.travelStyle.includes(style)} onChange={() => handleCheckboxChange('travelStyle', style)} className="h-4 w-4 rounded border-stone-300 text-cyan-600 focus:ring-cyan-500" />
                  <span className="text-stone-700">{style}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-stone-700">Interests</h3>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INTERESTS.map(interest => (
                <label key={interest} className="flex items-center space-x-2 p-2 rounded-md hover:bg-cyan-50 cursor-pointer">
                  <input type="checkbox" checked={preferences.interests.includes(interest)} onChange={() => handleCheckboxChange('interests', interest)} className="h-4 w-4 rounded border-stone-300 text-cyan-600 focus:ring-cyan-500" />
                  <span className="text-stone-700">{interest}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
             <label htmlFor="bio" className="block text-sm font-medium text-stone-700">About Your Trip</label>
             <textarea id="bio" value={preferences.bio} onChange={e => setPreferences({...preferences, bio: e.target.value})} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" placeholder="Describe your ideal trip and what you're looking for in a travel partner." required />
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-stone-400 flex items-center justify-center">
            {isLoading ? 'Finding Matches...' : 'Find Matches'}
          </button>
        </form>
      </div>
  );

  const renderResults = () => {
    if (currentIndex >= results.length) {
        return (
            <div className="text-center p-8 bg-white rounded-xl shadow-md border border-stone-200/80">
                <h2 className="text-2xl font-bold text-stone-800">That's everyone!</h2>
                <p className="text-stone-500 mt-2">You've seen all the matches for this search.</p>
                <button onClick={handleReset} className="mt-6 inline-flex items-center gap-2 bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-700 transition-colors">
                    <ArrowPathIcon className="w-5 h-5" />
                    Find New Matches
                </button>
            </div>
        );
    }
    
    const getCardStyle = (index: number) => {
        if (index < currentIndex) return { display: 'none' };
        if (index === currentIndex) {
             const rotate = swipeDirection === 'left' ? -15 : swipeDirection === 'right' ? 15 : 0;
             const translateX = swipeDirection === 'left' ? -100 : swipeDirection === 'right' ? 100 : 0;
             return {
                transform: `translateX(${translateX}%) rotate(${rotate}deg)`,
                opacity: swipeDirection === 'none' ? 1 : 0,
                transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
             };
        }
        return {
            transform: `translateY(${(index - currentIndex) * 10}px) scale(${1 - (index - currentIndex) * 0.05})`,
            opacity: 1,
            transition: 'all 0.3s ease-out',
            zIndex: results.length - index,
        };
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-full max-w-sm h-[500px] mb-6">
                {results.map((result, index) => (
                    <div key={result.userId} className="absolute inset-0" style={getCardStyle(index)}>
                        <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-stone-200/80 overflow-hidden flex flex-col">
                           <img src={result.avatarUrl} alt={result.userName} className="w-full h-1/2 object-cover" />
                           <div className="p-4 flex flex-col flex-grow">
                               <div className="flex justify-between items-center">
                                   <h3 className="text-2xl font-bold text-stone-800">{result.userName}</h3>
                                   <div className="text-white text-sm font-bold px-3 py-1 rounded-full bg-cyan-500">
                                     {result.compatibilityScore}%
                                   </div>
                               </div>
                               <p className="text-stone-500 text-xs uppercase font-semibold">Match Score</p>
                               <p className="mt-4 text-stone-600 italic text-sm flex-grow">"{result.reason}"</p>
                           </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center gap-8">
                <button onClick={() => handleSwipe('left')} aria-label="Pass" className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors transform hover:scale-110">
                    <XMarkIcon className="w-10 h-10" />
                </button>
                <button onClick={() => handleSwipe('right')} aria-label="Connect" className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors transform hover:scale-110">
                    <HeartIcon className="w-10 h-10" />
                </button>
            </div>
        </div>
    );
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Travel Partner Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-stone-800 mb-4 px-4">Travel Partner Requests</h2>
        {partnerRequests.length > 0 ? (
            <div className="relative">
                <div ref={scrollContainerRef} className="flex overflow-x-auto space-x-4 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <div className="flex-shrink-0 w-4 md:w-0"></div> {/* Gutter for small screens */}
                    {partnerRequests.map((request) => (
                        <PartnerRequestCard key={request.user.id} request={request} onConnect={handleConnectClick} onPass={handlePassClick} />
                    ))}
                    <div className="flex-shrink-0 w-4 md:w-0"></div> {/* Gutter */}
                </div>
                {showScrollButtons && (
                    <>
                        <button 
                            onClick={() => handleScroll('left')} 
                            className="absolute left-0 top-1/2 -translate-y-1/2 transform bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-white z-10 hidden md:block"
                            aria-label="Scroll left"
                        >
                            <ChevronLeftIcon className="w-6 h-6 text-stone-700" />
                        </button>
                        <button 
                            onClick={() => handleScroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 transform bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-white z-10 hidden md:block"
                            aria-label="Scroll right"
                        >
                            <ChevronRightIcon className="w-6 h-6 text-stone-700" />
                        </button>
                    </>
                )}
            </div>
        ) : (
             <p className="text-stone-500 text-center px-4">You're all caught up! No new partner requests.</p>
        )}
      </div>

      <div className="px-4">
        {isLoading && <LoadingSpinner message="Analyzing profiles..." />}
        {error && !isLoading && <div className="text-center p-4 bg-red-100 text-red-700 rounded-md mb-4">{error}</div>}

        {!isLoading && (showResults ? renderResults() : renderForm())}
      </div>
    </div>
  );
};

export default MatchmakingForm;
