import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, deleteDoc, onSnapshot, collection, addDoc, updateDoc, arrayUnion, query, orderBy, limit } from 'firebase/firestore';

// Data Mockup (In a real app, this would come from an API)
const destinations = [
    { id: "tokyo-jp", name: "Tokyo, Japan", image: "https://via.placeholder.com/400x300/f5f5f4/44403c?text=Tokyo", description: "Vibrant city blending tradition and technology.", tags: ["city-break", "culture"], lat: 35.6895, lon: 139.6917 },
    { id: "paris-fr", name: "Paris, France", image: "https://via.placeholder.com/400x300/f8fafc/64748b?text=Paris", description: "City of lights, art, and romance.", tags: ["city-break", "culture", "relax"], lat: 48.8566, lon: 2.3522 },
    { id: "ny-usa", name: "New York, USA", image: "https://via.placeholder.com/400x300/fafaf9/78716c?text=New+York", description: "The city that never sleeps.", tags: ["city-break", "adventure"], lat: 40.7128, lon: -74.0060 },
    { id: "bora-bora-pf", name: "Bora Bora, French Polynesia", image: "https://via.placeholder.com/400x300/f0f9ff/0c4a6e?text=Bora+Bora", description: "Stunning beaches and turquoise waters.", tags: ["relax", "adventure"], lat: -16.5004, lon: -151.7415 },
    { id: "cairo-eg", name: "Cairo, Egypt", image: "https://via.placeholder.com/400x300/fff7ed/7c2d12?text=Cairo", description: "Home to ancient pyramids and rich history.", tags: ["culture", "adventure"], lat: 30.0444, lon: 31.2357 },
    { id: "chandigarh-in", name: "Chandigarh, India", image: "https://via.placeholder.com/400x300/d6e9f2/3a6e8f?text=Chandigarh", description: "A modern city known for its architecture and urban design.", tags: ["city-break", "culture"], lat: 30.7333, lon: 76.7794 },
    { id: "jaipur-in", name: "Jaipur, India", image: "https://via.placeholder.com/400x300/f5e0e0/8a2e2e?text=Jaipur", description: "The 'Pink City' is a cultural and historical gem.", tags: ["culture"], lat: 26.9124, lon: 75.7873 },
];

const RECENTLY_VIEWED_KEY = 'voyage-recently-viewed';

const app = initializeApp(JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}'));
const db = getFirestore(app);
const auth = getAuth(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Helper function to show a temporary message (logs to console)
const showMessage = (message, type = 'success') => {
    console.log(`Message (${type}): ${message}`);
};

const Card = ({ destination, isFavorite, onToggleFavorite, onAddToTrip, onClick }) => {
    return (
        <div onClick={onClick} className="suggestion-card snap-center rounded-2xl shadow-md overflow-hidden relative group">
            <img src={destination.image} alt={destination.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
            <div className="absolute top-4 right-4 z-10 flex space-x-2">
                <i className={`fas fa-heart text-2xl cursor-pointer transition-colors ${isFavorite ? 'text-red-500' : 'text-stone-300 hover:text-red-400'}`}
                   onClick={(e) => { e.stopPropagation(); onToggleFavorite(destination); }}></i>
                <i className="fas fa-plus-circle text-2xl cursor-pointer transition-colors text-stone-300 hover:text-blue-400"
                   onClick={(e) => { e.stopPropagation(); onAddToTrip(destination); }}></i>
            </div>
            <div className="absolute bottom-4 left-4 text-white p-2">
                <h3 className="text-lg font-bold">{destination.name}</h3>
                <p className="text-sm text-gray-200 group-hover:block transition-all duration-300 hidden">{destination.description}</p>
            </div>
        </div>
    );
};

const TripCard = ({ trip }) => {
    return (
        <div className="bg-stone-100 p-4 rounded-xl shadow-inner min-w-[200px] cursor-pointer hover:bg-stone-200 transition-colors">
            <h4 className="text-lg font-semibold text-stone-800">{trip.name}</h4>
            <p className="text-sm text-stone-500">{trip.destinations ? trip.destinations.length : 0} destinations</p>
            <div className="mt-2 text-xs text-stone-400">
                {trip.destinations?.map((d, index) => (
                    <span key={index} className="inline-block bg-stone-300 text-stone-700 rounded-full px-2 py-1 mr-1 mb-1">{d.name}</span>
                ))}
            </div>
        </div>
    );
};


const App = () => {
    const [userId, setUserId] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchResults, setSearchResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [autocomplete, setAutocomplete] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTripName, setNewTripName] = useState('');
    const [destinationToAdd, setDestinationToAdd] = useState(null);
    
    // Firestore Data
    const [favorites, setFavorites] = useState([]);
    const [communityFavorites, setCommunityFavorites] = useState([]);
    const [userTrips, setUserTrips] = useState([]);

    const suggestionListRef = useRef(null);

    // --- Firebase Auth & Listeners ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                setIsAuthenticated(true);
            } else {
                try {
                    const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                    if (token) {
                        await signInWithCustomToken(auth, token);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Firebase auth error:", error);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    // Listen for private favorites
    useEffect(() => {
        if (!userId) return;
        const favoritesCollection = collection(db, `artifacts/${appId}/users/${userId}/favorites`);
        const unsubscribe = onSnapshot(favoritesCollection, (snapshot) => {
            const fetchedFavorites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFavorites(fetchedFavorites);
        }, (error) => {
            console.error("Error fetching favorites:", error);
        });
        return () => unsubscribe();
    }, [userId]);

    // Listen for community favorites
    useEffect(() => {
        const communityFavoritesCollection = collection(db, `artifacts/${appId}/public/data/communityFavorites`);
        const q = query(communityFavoritesCollection, orderBy("favoritedAt", "desc"), limit(10));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedCommunityFavorites = [];
            const addedDestinations = new Set();
            snapshot.forEach(doc => {
                const data = doc.data();
                // Avoid adding duplicate destinations from different users for display purposes
                if (!addedDestinations.has(data.id)) {
                    fetchedCommunityFavorites.push(data);
                    addedDestinations.add(data.id);
                }
            });
            setCommunityFavorites(fetchedCommunityFavorites);
        }, (error) => {
            console.error("Error fetching community favorites:", error);
        });
        return () => unsubscribe();
    }, []);

    // Listen for user trips
    useEffect(() => {
        if (!userId) return;
        const tripsCollection = collection(db, `artifacts/${appId}/users/${userId}/trips`);
        const unsubscribe = onSnapshot(tripsCollection, (snapshot) => {
            const fetchedTrips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUserTrips(fetchedTrips);
        }, (error) => {
            console.error("Error fetching trips:", error);
        });
        return () => unsubscribe();
    }, [userId]);

    // --- Data Manipulation Functions ---
    const toggleFavorite = async (destination) => {
        if (!isAuthenticated) {
            showMessage("Please log in to save favorites.", 'error');
            return;
        }
        const privateDocRef = doc(db, `artifacts/${appId}/users/${userId}/favorites`, destination.id);
        const publicDocRef = doc(db, `artifacts/${appId}/public/data/communityFavorites`, `${destination.id}-${userId}`);

        const isFavorite = favorites.some(fav => fav.id === destination.id);

        try {
            if (isFavorite) {
                await deleteDoc(privateDocRef);
                await deleteDoc(publicDocRef);
            } else {
                await setDoc(privateDocRef, destination);
                await setDoc(publicDocRef, { ...destination, userId: userId, favoritedAt: Date.now() });
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            showMessage("Failed to update favorites.", 'error');
        }
    };

    const createTrip = async (tripName, destination = null) => {
        if (!isAuthenticated) return;
        const tripsCollection = collection(db, `artifacts/${appId}/users/${userId}/trips`);
        const destinationsArray = destination ? [destination] : [];
        try {
            await addDoc(tripsCollection, {
                name: tripName,
                destinations: destinationsArray,
                createdAt: Date.now(),
            });
            showMessage(`Trip "${tripName}" created successfully!`);
        } catch (error) {
            console.error("Error creating trip:", error);
            showMessage("Failed to create new trip.", 'error');
        }
    };

    const addToTrip = async (tripId, destination) => {
        if (!isAuthenticated) return;
        const tripDocRef = doc(db, `artifacts/${appId}/users/${userId}/trips`, tripId);
        try {
            await updateDoc(tripDocRef, {
                destinations: arrayUnion(destination)
            });
            showMessage(`${destination.name} added to trip!`);
        } catch (error) {
            console.error("Error adding to trip:", error);
            showMessage("Failed to add destination to trip.", 'error');
        }
    };

    // --- Component Logic & Event Handlers ---
    const handleSearch = async (query) => {
        if (!query) return;

        setSearchResults(null);
        setIsLoading(true);
        setLoadingMessage(`Generating a travel guide for ${query}...`);

        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const systemPrompt = `You are an expert travel guide. Your task is to provide a concise and engaging travel guide for a given destination. Respond in JSON format only with the following schema:
        {
            "title": string,
            "summary": string,
            "attractions": string[],
            "tips": string[]
        }`;

        const userQuery = `Provide a travel guide for ${query}.`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            tools: [{ "google_search": {} }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            generationConfig: {
                responseMimeType: "application/json",
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            const candidate = result.candidates?.[0];

            if (!candidate || !candidate.content?.parts?.[0]?.text) {
                throw new Error("Invalid response format from Gemini API.");
            }
            
            // Safely parse the JSON response
            let guide = null;
            try {
                const jsonString = candidate.content.parts[0].text;
                guide = JSON.parse(jsonString);
            } catch (jsonError) {
                console.error("Error parsing JSON from API:", jsonError);
                guide = { error: "Received an invalid guide format from the API. Please try again." };
            }
            setSearchResults(guide);

        } catch (error) {
            console.error("Error fetching Gemini content:", error);
            setSearchResults({ error: "Failed to generate a guide. Please try again later." });
        } finally {
            setIsLoading(false);
        }

        const dest = destinations.find(d => d.name === query);
        if (dest) {
            addRecentlyViewed(dest);
        }
    };

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        setSearchResults(null);
        // Geolocation logic is complex for this single-file setup.
        // It's best handled with a dedicated component or service.
    };

    const filteredDestinations = () => {
        if (activeFilter === 'all') {
            return destinations;
        } else {
            return destinations.filter(dest => dest.tags.includes(activeFilter));
        }
    };

    const handleSurpriseMe = () => {
        const randomIndex = Math.floor(Math.random() * destinations.length);
        const randomDest = destinations[randomIndex];
        handleSearch(randomDest.name);
    };

    const handleAutocomplete = (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length < 2) {
            setAutocomplete([]);
            return;
        }
        const filtered = destinations.filter(dest => dest.name.toLowerCase().includes(query));
        setAutocomplete(filtered);
    };

    // A new function to handle the "Add to Trip" button click
    const handleAddToTrip = (destination) => {
        setDestinationToAdd(destination);
        setIsModalOpen(true);
    };
    
    // --- Recently Viewed Logic ---
    const getRecentlyViewed = () => {
        try {
            const recent = localStorage.getItem(RECENTLY_VIEWED_KEY);
            return recent ? JSON.parse(recent) : [];
        } catch (e) {
            console.error("Error retrieving recently viewed from localStorage", e);
            return [];
        }
    };

    const saveRecentlyViewed = (list) => {
        try {
            localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list));
        } catch (e) {
            console.error("Error saving to localStorage", e);
        }
    };

    const addRecentlyViewed = (destination) => {
        let list = getRecentlyViewed();
        list = list.filter(item => item.name !== destination.name);
        list.unshift(destination);
        list = list.slice(0, 5);
        saveRecentlyViewed(list);
    };

    const recentlyViewed = getRecentlyViewed();

    return (
        <div className="bg-stone-50 flex flex-col items-center min-h-screen">
            {/* Tailwind CSS and other assets are loaded here via CDN in the final HTML file */}
            <style>
                {`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .modal {
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.6);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .modal-content {
                    background-color: #fff;
                    padding: 2rem;
                    border-radius: 1rem;
                    max-width: 500px;
                    width: 90%;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    position: relative;
                }
                .close-btn {
                    position: absolute;
                    top: 1rem;
                    right: 1.5rem;
                }
                `}
            </style>
            <div className="container bg-white rounded-3xl shadow-xl flex flex-col p-8 mt-12 mb-20">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-stone-900 tracking-tight">Voyage</h1>
                    <p className="mt-2 text-stone-500 text-sm">Discover your next luxury adventure.</p>
                </div>

                {/* Search Bar Section */}
                <div className="w-full relative mb-8">
                    <div className="flex items-center space-x-3 p-4 bg-white border border-stone-200 rounded-full shadow-inner transition-all duration-300 focus-within:shadow-lg focus-within:border-stone-400">
                        <i className="fas fa-search text-stone-400 pl-2"></i>
                        <input type="text" onChange={handleAutocomplete} onKeyDown={(e) => e.key === 'Enter' && handleSearch(e.target.value)}
                            className="flex-1 bg-transparent outline-none placeholder-stone-400 text-stone-800 font-medium"
                            placeholder="Search for a city or place..." autoComplete="off" />
                    </div>
                    {/* Autocomplete Suggestions */}
                    {autocomplete.length > 0 && (
                        <div className="absolute w-full mt-2 bg-white rounded-xl shadow-lg border border-stone-200 z-10 max-h-60 overflow-y-auto">
                            {autocomplete.map(item => (
                                <div key={item.id} onClick={() => { handleSearch(item.name); setAutocomplete([]); }}
                                    className="p-3 hover:bg-stone-100 cursor-pointer text-stone-700">
                                    {item.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Explore by Interest Section */}
                <div className="w-full mb-8">
                    <h2 className="text-xl font-semibold text-stone-700 mb-4">Explore by Interest</h2>
                    <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
                        {['all', 'adventure', 'culture', 'relax', 'city-break'].map(filter => (
                            <button key={filter} onClick={() => handleFilterChange(filter)}
                                className={`filter-btn px-5 py-2 rounded-full transition-all duration-200 hover:bg-stone-300 ${activeFilter === filter ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-800'}`}>
                                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Top Suggestions Section */}
                <div id="suggestions-section" className="w-full mb-8">
                    <h2 className="text-xl font-semibold text-stone-700 mb-4">Top Suggestions</h2>
                    <div className="relative">
                        <button onClick={() => suggestionListRef.current?.scrollBy({ left: -300, behavior: 'smooth' })} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-sm p-3 rounded-full shadow-lg z-10 transition-opacity hover:opacity-100 opacity-80">
                            <i className="fas fa-chevron-left text-stone-600"></i>
                        </button>
                        <div ref={suggestionListRef} id="suggestion-list" className="flex overflow-x-auto gap-4 py-2 scrollbar-hide snap-x snap-mandatory">
                            {filteredDestinations().map(dest => (
                                <Card key={dest.id} destination={dest} isFavorite={favorites.some(fav => fav.id === dest.id)} onToggleFavorite={toggleFavorite} onAddToTrip={handleAddToTrip} onClick={() => handleSearch(dest.name)} />
                            ))}
                        </div>
                        <button onClick={() => suggestionListRef.current?.scrollBy({ left: 300, behavior: 'smooth' })} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-sm p-3 rounded-full shadow-lg z-10 transition-opacity hover:opacity-100 opacity-80">
                            <i className="fas fa-chevron-right text-stone-600"></i>
                        </button>
                    </div>
                </div>

                {/* My Trips Section */}
                {userTrips.length > 0 && (
                    <div className="w-full mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-stone-700">My Trips</h2>
                            <button onClick={() => setIsModalOpen(true)} className="bg-green-500 text-white font-medium py-1 px-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
                                New Trip
                            </button>
                        </div>
                        <div className="flex overflow-x-auto gap-4 py-2 scrollbar-hide">
                            {userTrips.map(trip => (
                                <TripCard key={trip.id} trip={trip} />
                            ))}
                        </div>
                    </div>
                )}

                {/* My Favorites Section */}
                {favorites.length > 0 && (
                    <div className="w-full mb-8">
                        <h2 className="text-xl font-semibold text-stone-700 mb-4">My Favorites</h2>
                        <div className="flex overflow-x-auto gap-4 py-2 scrollbar-hide snap-x snap-mandatory">
                            {favorites.map(dest => (
                                <Card key={dest.id} destination={dest} isFavorite={true} onToggleFavorite={toggleFavorite} onAddToTrip={handleAddToTrip} onClick={() => handleSearch(dest.name)} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Community Favorites Section */}
                {communityFavorites.length > 0 && (
                    <div className="w-full mb-8">
                        <h2 className="text-xl font-semibold text-stone-700 mb-4">Community Favorites</h2>
                        <div className="flex overflow-x-auto gap-4 py-2 scrollbar-hide snap-x snap-mandatory">
                            {communityFavorites.map(dest => (
                                <Card key={dest.id} destination={dest} isFavorite={favorites.some(fav => fav.id === dest.id)} onToggleFavorite={toggleFavorite} onAddToTrip={handleAddToTrip} onClick={() => handleSearch(dest.name)} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Recently Viewed Section */}
                {recentlyViewed.length > 0 && (
                    <div className="w-full mb-8">
                        <h2 className="text-xl font-semibold text-stone-700 mb-4">Recently Viewed</h2>
                        <div className="flex overflow-x-auto gap-4 py-2 scrollbar-hide snap-x snap-mandatory">
                            {recentlyViewed.map(dest => (
                                <Card key={dest.id} destination={dest} isFavorite={favorites.some(fav => fav.id === dest.id)} onToggleFavorite={toggleFavorite} onAddToTrip={handleAddToTrip} onClick={() => handleSearch(dest.name)} />
                            ))}
                        </div>
                    </div>
                )}

                {/* AI-Powered Prompt Section */}
                <div className="w-full p-6 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col items-center text-center">
                    <i className="fas fa-magic text-amber-500 text-3xl mb-3"></i>
                    <h3 className="text-lg font-semibold text-amber-800 mb-1">Feeling Adventurous?</h3>
                    <p className="text-sm text-amber-600 mb-4">Let our AI generate a personalized travel guide for you!</p>
                    <button onClick={handleSurpriseMe} className="bg-amber-500 text-white font-medium py-2 px-6 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
                        ✨ Generate Guide
                    </button>
                </div>

                {/* Loading Indicator and Result Display */}
                {isLoading ? (
                    <div className="mt-8 text-center">
                        <i className="fas fa-spinner fa-spin text-stone-500 text-2xl"></i>
                        <p className="mt-2 text-stone-500">{loadingMessage}</p>
                    </div>
                ) : searchResults ? (
                    <div className="mt-8 p-6 bg-stone-50 rounded-2xl border border-stone-200">
                        <h2 className="text-xl font-semibold text-stone-700 mb-4">Your Search Results</h2>
                        {searchResults.error ? (
                            <div className="text-center p-4 rounded-xl bg-red-100 text-red-700">
                                <p className="font-medium">{searchResults.error}</p>
                            </div>
                        ) : (
                            <div className="p-4 bg-white rounded-xl shadow-inner">
                                <h2 className="text-xl font-semibold text-stone-700 mb-4">{searchResults.title}</h2>
                                <p className="text-stone-600">{searchResults.summary}</p>
                                {searchResults.attractions?.length > 0 && (
                                    <>
                                        <h3 className="text-lg font-semibold text-stone-700 mb-2 mt-4">Top Attractions</h3>
                                        <ul className="list-disc list-inside space-y-1 text-stone-600">
                                            {searchResults.attractions.map((item, index) => <li key={index}>{item}</li>)}
                                        </ul>
                                    </>
                                )}
                                {searchResults.tips?.length > 0 && (
                                    <>
                                        <h3 className="text-lg font-semibold text-stone-700 mb-2 mt-4">Travel Tips</h3>
                                        <ul className="list-disc list-inside space-y-1 text-stone-600">
                                            {searchResults.tips.map((item, index) => <li key={index}>{item}</li>)}
                                        </ul>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Modal for adding to a trip */}
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span onClick={() => { setIsModalOpen(false); setDestinationToAdd(null); }} className="close-btn text-stone-400 hover:text-stone-700 text-2xl cursor-pointer">
                            <i className="fas fa-times"></i>
                        </span>
                        <h3 className="text-2xl font-semibold text-stone-800 mb-6">Add to a Trip</h3>
                        {userTrips.length > 0 && (
                            <div className="space-y-4">
                                {userTrips.map(trip => (
                                    <div key={trip.id} onClick={() => { addToTrip(trip.id, destinationToAdd); setIsModalOpen(false); }} className="p-3 bg-stone-100 rounded-lg cursor-pointer hover:bg-stone-200 transition-colors flex justify-between items-center">
                                        <span className="text-stone-700">{trip.name}</span>
                                        <i className="fas fa-check text-green-500"></i>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-6 border-t border-stone-200 pt-4">
                            <input type="text" value={newTripName} onChange={(e) => setNewTripName(e.target.value)}
                                className="w-full p-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                placeholder="Create a new trip..." />
                            <button onClick={() => { createTrip(newTripName, destinationToAdd); setIsModalOpen(false); setNewTripName(''); }}
                                className="w-full mt-2 bg-green-500 text-white font-medium py-3 rounded-lg hover:bg-green-600 transition-colors">
                                Create and Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-stone-200 shadow-lg flex justify-around items-center h-16">
                <a href="#" className="flex flex-col items-center text-stone-400 hover:text-amber-500 transition-colors">
                    <i className="fas fa-home text-lg"></i>
                    <span className="text-xs mt-1">Home</span>
                </a>
                <a href="#" className="flex flex-col items-center text-stone-400 hover:text-amber-500 transition-colors">
                    <i className="fas fa-heart text-lg"></i>
                    <span className="text-xs mt-1">Match</span>
                </a>
                <a href="#" className="flex flex-col items-center text-amber-500 transition-colors">
                    <i className="fas fa-compass text-lg"></i>
                    <span className="text-xs mt-1">Explore</span>
                </a>
                <a href="#" className="flex flex-col items-center text-stone-400 hover:text-amber-500 transition-colors">
                    <i className="fas fa-user-circle text-lg"></i>
                    <span className="text-xs mt-1">Profile</span>
                </a>
            </div>
        </div>
    );
};

export default App;
