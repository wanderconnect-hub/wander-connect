import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { TravelPartnerRequest, User } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from '../constants';
import { fetchPartnerRequests } from '../services/apiServices';

/// ---- Helper API call to respond to partner request (accept/reject) ----
async function respondToPartnerRequest(requestId: number, action: 'accept' | 'reject') {
  const response = await fetch('/api/partner-requests', {
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

// Placeholder: update profile/global state
function updateUserProfileBuddiesCount(userId: number, newCount: number) {
  console.log(`Updated buddies count for user ${userId}: ${newCount}`);
}

// ---- PartnerRequestCard component ----
const PartnerRequestCard: React.FC<{ 
  request: TravelPartnerRequest; 
  onConnect: (userId: number, requestId: number) => Promise<void>;  
  onPass: (userId: number, requestId: number) => Promise<void>;
}> = ({ request, onConnect, onPass }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleConnectClick = async () => {
    setIsConnecting(true);
    setIsDismissed(true);
    try {
      await onConnect(request.user.id, request.id);
    } catch (err) {
      setIsConnecting(false);
      setIsDismissed(false);
    }
  };

  const handlePassClick = async () => {
    setIsDismissed(true);
    try {
      await onPass(request.user.id, request.id);
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
  const [partnerRequests, setPartnerRequests] = useState<TravelPartnerRequest[]>([]);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load partner requests (filter dismissed + accepted/rejected)
  useEffect(() => {
    async function loadPartnerRequests() {
      try {
        const requests = await fetchPartnerRequests();
        const liveRequests = requests
          .filter(request => request.recipient_id === currentUser.id && !dismissedIds.includes(request.id))
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
      } catch (err: any) {
        console.error('Failed to load partner requests:', err);
        setError('Something went wrong. Try again.');
        setPartnerRequests([]);
      }
    }
    loadPartnerRequests();
  }, [allUsers, currentUser.id, dismissedIds]);

  // Handle connect
  const handleConnectClick = async (partnerId: number, requestId: number) => {
    try {
      await respondToPartnerRequest(requestId, 'accept');
      onAddConnection(partnerId);

      // remove immediately
      setPartnerRequests(prev => prev.filter(req => req.id !== requestId));
      setDismissedIds(prev => [...prev, requestId]);

      // update buddy counts
      const currentUserCount = await fetchBuddiesCount(currentUser.id);
      updateUserProfileBuddiesCount(currentUser.id, currentUserCount);

      const partnerCount = await fetchBuddiesCount(partnerId);
      updateUserProfileBuddiesCount(partnerId, partnerCount);
    } catch (err) {
      console.error(err);
      setError('Failed to connect. Try again.');
    }
  };

  // Handle pass
  const handlePassClick = async (partnerId: number, requestId: number) => {
    try {
      await respondToPartnerRequest(requestId, 'reject');
      setPartnerRequests(prev => prev.filter(req => req.id !== requestId));
      setDismissedIds(prev => [...prev, requestId]);
    } catch (err) {
      console.error(err);
      setError('Failed to pass. Try again.');
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
      {/* Error Banner */}
      {error && (
        <div className="bg-blue-100 text-blue-800 text-center p-2 rounded mb-4">
          ⚠ {error}
        </div>
      )}

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
              <div className="flex-shrink-0 w-4 md:w-0"></div>
              {partnerRequests.map(request => (
                <PartnerRequestCard
                  key={request.id}
                  request={request}
                  onConnect={handleConnectClick}
                  onPass={handlePassClick}
                />
              ))}
              <div className="flex-shrink-0 w-4 md:w-0"></div>
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
    </div>
  );
};

export default MatchmakingForm;
