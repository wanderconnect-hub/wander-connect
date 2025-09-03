import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { findTravelMatches } from '../services/geminiService';
import type { TravelPreferences, MatchResult, TravelPartnerRequest, User } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { HeartIcon, XMarkIcon, ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon, TRAVEL_STYLES, INTERESTS } from '../constants';
import { fetchPartnerRequests } from '../services/apiServices';


// ---- Helper API call to respond to partner request (accept/reject) ----
async function respondToPartnerRequest(requestId: number, action: 'accept' | 'reject') {
  const response = await fetch('/api/partner-requests/respond', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId, action }),
  });
  if (!response.ok) {
    throw new Error('Failed to respond to partner request');
  }
  return await response.json();
}

// Fetch buddies count for given userId
async function fetchBuddiesCount(userId: number) {
  const response = await fetch(`/api/connections?userId=${userId}`);
  if (!response.ok) throw new Error('Failed to fetch buddies count');
  const data = await response.json();
  return data.buddiesCount ?? 0;
}

// Placeholder: You should update profile or global state with new buddies count here
function updateUserProfileBuddiesCount(userId: number, newCount: number) {
  console.log(`Updated buddies count for user ${userId}: ${newCount}`);
  // Implement state or context update here for live profile refresh
}


// ---- PartnerRequestCard component ----
const PartnerRequestCard: React.FC<{ 
  request: TravelPartnerRequest; 
  onConnect: (userId: number) => Promise<void>;  
  onPass: (userId: number) => Promise<void>;
}> = ({ request, onConnect, onPass }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleConnectClick = async () => {
    setIsConnecting(true);
    setIsDismissed(true);
    try {
      await onConnect(request.user.id);
    } catch (err) {
      setIsConnecting(false);
      setIsDismissed(false);
    }
  };

  const handlePassClick = async () => {
    setIsDismissed(true);
    try {
      await onPass(request.user.id);
    } catch (err) {
      setIsDismissed(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className={`relative flex-shrink-0 w-72 h-96 rounded-2xl shadow-lg overflow-hidden group transition-all duration-300 ${isDismissed ? 'opacity-0 scale-95' : ''}`}>
      <img src={request.imageUrl} alt={request.user.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      <div className="relative h-full flex flex-col justify-between p-4 text-white">
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


// ---- Main MatchmakingForm component ----
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

  // Partner requests state
  const [partnerRequests, setPartnerRequests] = useState<TravelPartnerRequest[]>([]);

  // Scroll container and buttons
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  // Load partner requests filtering only where currentUser is recipient
  useEffect(() => {
    async function loadPartnerRequests() {
      try {
        const requests = await fetchPartnerRequests();
        const liveRequests = requests
          .filter(request => request.recipient_id === currentUser.id)
          .map(request => {
            const user = allUsers.find(u => u.id === request.sender_id);
            if (user) return { 
              id: request.id,
              userId: request.sender_id,
              user,
              tripDescription: request.trip_description,
              imageUrl: request.image_url,
            };
            return null;
          })
          .filter((req): req is TravelPartnerRequest => req !== null);

        setPartnerRequests(liveRequests);
      } catch (error) {
        console.error('Failed to load partner requests:', error);
        setPartnerRequests([]);
      }
    }
    loadPartnerRequests();
  }, [allUsers, currentUser.id]);


  // Handlers for connect and pass
  const handleConnectClick = async (partnerId: number) => {
    try {
      const request = partnerRequests.find(r => r.user.id === partnerId);
      if (!request) throw new Error('Partner request not found');
      await respondToPartnerRequest(request.id, 'accept');
      onAddConnection(partnerId);

      // Refresh buddies count for current user
      const currentUserCount = await fetchBuddiesCount(currentUser.id);
      updateUserProfileBuddiesCount(currentUser.id, currentUserCount);

      // Refresh buddies count for partner
      const partnerCount = await fetchBuddiesCount(partnerId);
      updateUserProfileBuddiesCount(partnerId, partnerCount);

      setPartnerRequests(prev => prev.filter(req => req.user.id !== partnerId));
    } catch (error) {
      console.error(error);
    }
  };

  const handlePassClick = async (partnerId: number) => {
    try {
      const request = partnerRequests.find(r => r.user.id === partnerId);
      if (!request) throw new Error('Partner request not found');
      await respondToPartnerRequest(request.id, 'reject');
      setPartnerRequests(prev => prev.filter(req => req.user.id !== partnerId));
    } catch (error) {
      console.error(error);
    }
  };

  // Scroll buttons visibility
  useEffect(() => {
    const checkScrollable = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowScrollButtons(scrollWidth > clientWidth);
      } else {
        setShowScrollButtons(false);
      }
    };
    const timer = setTimeout(checkScrollable, 100);
    window.addEventListener('resize', checkScrollable);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [partnerRequests]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 304;
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Travel Partner Requests Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-stone-800 mb-4 px-4">Travel Partner Requests</h2>
        {partnerRequests.length > 0 ? (
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto space-x-4 pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex-shrink-0 w-4 md:w-0"></div> {/* Left gutter */}
              {partnerRequests.map(request => (
                <PartnerRequestCard
                  key={request.id}
                  request={request}
                  onConnect={handleConnectClick}
                  onPass={handlePassClick}
                />
              ))}
              <div className="flex-shrink-0 w-4 md:w-0"></div> {/* Right gutter */}
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

      {/* Other UI components can remain unchanged */}
      <div className="px-4">
        {isLoading && <LoadingSpinner message="Analyzing profiles..." />}
        {error && !isLoading && <div className="text-center p-4 bg-red-100 text-red-700 rounded-md mb-4">{error}</div>}

        {!isLoading && (showResults ? (
          null
        ) : (
          null
        ))}
      </div>
    </div>
  );
};

export default MatchmakingForm;
