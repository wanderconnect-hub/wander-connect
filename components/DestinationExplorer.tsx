<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Destination Explorer</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8f8f8;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            flex-grow: 1;
        }

        .suggestion-card {
            min-width: 250px;
            height: 150px;
            transition: transform 0.2s, box-shadow 0.2s;
            cursor: pointer;
        }

        .suggestion-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .hide {
            display: none;
        }

        /* Modal specific styles */
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 50;
        }

        .modal-content {
            background-color: white;
            padding: 2rem;
            border-radius: 1rem;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        }

        .close-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            cursor: pointer;
        }
    </style>
</head>

<body class="bg-stone-50 flex flex-col items-center">

    <!-- Main Content Container -->
    <div class="container bg-white rounded-3xl shadow-xl flex flex-col p-8 mt-12 mb-20">

        <!-- Header Section -->
        <div class="text-center mb-8">
            <h1 class="text-4xl font-extrabold text-stone-900 tracking-tight">Voyage</h1>
            <p class="mt-2 text-stone-500 text-sm">Discover your next luxury adventure.</p>
        </div>

        <!-- Search Bar Section -->
        <div class="w-full relative mb-8">
            <div
                class="flex items-center space-x-3 p-4 bg-white border border-stone-200 rounded-full shadow-inner transition-all duration-300 focus-within:shadow-lg focus-within:border-stone-400">
                <i class="fas fa-search text-stone-400 pl-2"></i>
                <input type="text" id="searchInput"
                    class="flex-1 bg-transparent outline-none placeholder-stone-400 text-stone-800 font-medium"
                    placeholder="Search for a city or place..." autocomplete="off">
            </div>

            <!-- Autocomplete Suggestions -->
            <div id="autocomplete-results"
                class="hide absolute w-full mt-2 bg-white rounded-xl shadow-lg border border-stone-200 z-10 max-h-60 overflow-y-auto">
            </div>
        </div>

        <!-- Explore by Interest Section -->
        <div class="w-full mb-8">
            <h2 class="text-xl font-semibold text-stone-700 mb-4">Explore by Interest</h2>
            <div class="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
                <button data-filter="all"
                    class="filter-btn bg-stone-200 text-stone-800 px-5 py-2 rounded-full transition-all duration-200 hover:bg-stone-300">All</button>
                <button data-filter="adventure"
                    class="filter-btn bg-stone-200 text-stone-800 px-5 py-2 rounded-full transition-all duration-200 hover:bg-stone-300">Adventure</button>
                <button data-filter="culture"
                    class="filter-btn bg-stone-200 text-stone-800 px-5 py-2 rounded-full transition-all duration-200 hover:bg-stone-300">Culture</button>
                <button data-filter="relax"
                    class="filter-btn bg-stone-200 text-stone-800 px-5 py-2 rounded-full transition-all duration-200 hover:bg-stone-300">Relaxing</button>
                <button data-filter="city-break"
                    class="filter-btn bg-stone-200 text-stone-800 px-5 py-2 rounded-full transition-all duration-200 hover:bg-stone-300">City Break</button>
                <button id="locationBtn" data-filter="local"
                    class="filter-btn bg-stone-200 text-stone-800 px-5 py-2 rounded-full transition-all duration-200 hover:bg-stone-300">Explore by Location</button>
            </div>
        </div>

        <!-- Top Suggestions Section -->
        <div id="suggestions-section" class="w-full mb-8">
            <h2 class="text-xl font-semibold text-stone-700 mb-4">Top Suggestions</h2>
            <!-- Wrapper for the scrollable list and navigation buttons -->
            <div class="relative">
                <!-- Previous Button -->
                <button id="prevBtn"
                    class="absolute left-0 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-sm p-3 rounded-full shadow-lg z-10 transition-opacity hover:opacity-100 opacity-80">
                    <i class="fas fa-chevron-left text-stone-600"></i>
                </button>
                <div id="suggestion-list"
                    class="flex overflow-x-auto gap-4 py-2 scrollbar-hide snap-x snap-mandatory">
                    <!-- Suggestion cards will be injected here by JS -->
                </div>
                <!-- Next Button -->
                <button id="nextBtn"
                    class="absolute right-0 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-sm p-3 rounded-full shadow-lg z-10 transition-opacity hover:opacity-100 opacity-80">
                    <i class="fas fa-chevron-right text-stone-600"></i>
                </button>
            </div>
        </div>

        <!-- My Trips Section -->
        <div id="trips-section" class="w-full mb-8 hide">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold text-stone-700">My Trips</h2>
                <button id="createTripBtn"
                    class="bg-green-500 text-white font-medium py-1 px-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
                    New Trip
                </button>
            </div>
            <div id="trips-list" class="flex overflow-x-auto gap-4 py-2 scrollbar-hide">
                <!-- Trip cards will be injected here by JS -->
            </div>
        </div>

        <!-- My Favorites Section -->
        <div id="favorites-section" class="w-full mb-8 hide">
            <h2 class="text-xl font-semibold text-stone-700 mb-4">My Favorites</h2>
            <div id="favorites-list" class="flex overflow-x-auto gap-4 py-2 scrollbar-hide snap-x snap-mandatory">
                <!-- Favorites cards will be injected here by JS -->
            </div>
        </div>

        <!-- Community Favorites Section -->
        <div id="community-favorites-section" class="w-full mb-8 hide">
            <h2 class="text-xl font-semibold text-stone-700 mb-4">Community Favorites</h2>
            <div id="community-favorites-list"
                class="flex overflow-x-auto gap-4 py-2 scrollbar-hide snap-x snap-mandatory">
                <!-- Community favorites cards will be injected here by JS -->
            </div>
        </div>

        <!-- Recently Viewed Section -->
        <div id="recently-viewed-section" class="w-full mb-8 hide">
            <h2 class="text-xl font-semibold text-stone-700 mb-4">Recently Viewed</h2>
            <div id="recently-viewed-list" class="flex overflow-x-auto gap-4 py-2 scrollbar-hide snap-x snap-mandatory">
                <!-- Recently viewed cards will be injected here by JS -->
            </div>
        </div>

        <!-- AI-Powered Prompt Section -->
        <div class="w-full p-6 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col items-center text-center">
            <i class="fas fa-magic text-amber-500 text-3xl mb-3"></i>
            <h3 class="text-lg font-semibold text-amber-800 mb-1">Feeling Adventurous?</h3>
            <p class="text-sm text-amber-600 mb-4">Let our AI generate a personalized travel guide for you!</p>
            <button id="surpriseMeBtn"
                class="bg-amber-500 text-white font-medium py-2 px-6 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
                ✨ Generate Guide
            </button>
        </div>

        <!-- Loading Indicator and Message -->
        <div id="loadingIndicator" class="hide mt-8 text-center">
            <i class="fas fa-spinner fa-spin text-stone-500 text-2xl"></i>
            <p id="loading-message" class="mt-2 text-stone-500">Generating your next adventure...</p>
        </div>

        <!-- Result Display Section -->
        <div id="result-display" class="hide mt-8 p-6 bg-stone-50 rounded-2xl border border-stone-200">
            <h2 class="text-xl font-semibold text-stone-700 mb-4">Your Search Results</h2>
            <!-- Results will be injected here -->
        </div>

    </div>

    <!-- Modal for adding to a trip -->
    <div id="trip-modal" class="modal hide">
        <div class="modal-content">
            <span id="close-modal-btn" class="close-btn text-stone-400 hover:text-stone-700 text-2xl">
                <i class="fas fa-times"></i>
            </span>
            <h3 class="text-2xl font-semibold text-stone-800 mb-6">Add to a Trip</h3>
            <div id="trip-list-modal" class="space-y-4">
                <!-- Trips will be listed here -->
            </div>
            <div class="mt-6 border-t border-stone-200 pt-4">
                <input type="text" id="new-trip-input"
                    class="w-full p-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Create a new trip...">
                <button id="create-trip-modal-btn"
                    class="w-full mt-2 bg-green-500 text-white font-medium py-3 rounded-lg hover:bg-green-600 transition-colors">
                    Create and Add
                </button>
            </div>
        </div>
    </div>

    <!-- Bottom Navigation Bar -->
    <div
        class="fixed bottom-0 left-0 w-full bg-white border-t border-stone-200 shadow-lg flex justify-around items-center h-16">
        <a href="#" class="flex flex-col items-center text-stone-400 hover:text-amber-500 transition-colors">
            <i class="fas fa-home text-lg"></i>
            <span class="text-xs mt-1">Home</span>
        </a>
        <a href="#" class="flex flex-col items-center text-stone-400 hover:text-amber-500 transition-colors">
            <i class="fas fa-heart text-lg"></i>
            <span class="text-xs mt-1">Match</span>
        </a>
        <a href="#" class="flex flex-col items-center text-amber-500 transition-colors">
            <i class="fas fa-compass text-lg"></i>
            <span class="text-xs mt-1">Explore</span>
        </a>
        <a href="#" class="flex flex-col items-center text-stone-400 hover:text-amber-500 transition-colors">
            <i class="fas fa-user-circle text-lg"></i>
            <span class="text-xs mt-1">Profile</span>
        </a>
    </div>

    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, doc, setDoc, deleteDoc, onSnapshot, collection, query, getDocs, addDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
        
        // Helper function to show a temporary message
        function showMessage(message, type = 'success') {
            const resultDisplay = document.getElementById('result-display');
            resultDisplay.classList.remove('hide');
            resultDisplay.innerHTML = `
                <div class="text-center p-4 rounded-xl ${type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                    <p class="font-medium">${message}</p>
                </div>
            `;
            setTimeout(() => {
                resultDisplay.classList.add('hide');
            }, 3000);
        }

        // --- Data Mockup (In a real app, this would come from an API) ---
        const destinations = [
            { id: "tokyo-jp", name: "Tokyo, Japan", image: "https://via.placeholder.com/400x300/f5f5f4/44403c?text=Tokyo", description: "Vibrant city blending tradition and technology.", tags: ["city-break", "culture"], lat: 35.6895, lon: 139.6917 },
            { id: "paris-fr", name: "Paris, France", image: "https://via.placeholder.com/400x300/f8fafc/64748b?text=Paris", description: "City of lights, art, and romance.", tags: ["city-break", "culture", "relax"], lat: 48.8566, lon: 2.3522 },
            { id: "ny-usa", name: "New York, USA", image: "https://via.placeholder.com/400x300/fafaf9/78716c?text=New+York", description: "The city that never sleeps.", tags: ["city-break", "adventure"], lat: 40.7128, lon: -74.0060 },
            { id: "bora-bora-pf", name: "Bora Bora, French Polynesia", image: "https://via.placeholder.com/400x300/f0f9ff/0c4a6e?text=Bora+Bora", description: "Stunning beaches and turquoise waters.", tags: ["relax", "adventure"], lat: -16.5004, lon: -151.7415 },
            { id: "cairo-eg", name: "Cairo, Egypt", image: "https://via.placeholder.com/400x300/fff7ed/7c2d12?text=Cairo", description: "Home to ancient pyramids and rich history.", tags: ["culture", "adventure"], lat: 30.0444, lon: 31.2357 },
            { id: "chandigarh-in", name: "Chandigarh, India", image: "https://via.placeholder.com/400x300/d6e9f2/3a6e8f?text=Chandigarh", description: "A modern city known for its architecture and urban design.", tags: ["city-break", "culture"], lat: 30.7333, lon: 76.7794 },
            { id: "jaipur-in", name: "Jaipur, India", image: "https://via.placeholder.com/400x300/f5e0e0/8a2e2e?text=Jaipur", description: "The 'Pink City' is a cultural and historical gem.", tags: ["culture"], lat: 26.9124, lon: 75.7873 },
        ];

        // --- DOM Elements ---
        const searchInput = document.getElementById('searchInput');
        const autocompleteResults = document.getElementById('autocomplete-results');
        const suggestionList = document.getElementById('suggestion-list');
        const recentlyViewedSection = document.getElementById('recently-viewed-section');
        const recentlyViewedList = document.getElementById('recently-viewed-list');
        const favoritesSection = document.getElementById('favorites-section');
        const favoritesList = document.getElementById('favorites-list');
        const communityFavoritesSection = document.getElementById('community-favorites-section');
        const communityFavoritesList = document.getElementById('community-favorites-list');
        const tripsSection = document.getElementById('trips-section');
        const tripsList = document.getElementById('trips-list');
        const createTripBtn = document.getElementById('createTripBtn');
        const surpriseMeBtn = document.getElementById('surpriseMeBtn');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const loadingMessage = document.getElementById('loading-message');
        const resultDisplay = document.getElementById('result-display');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const locationBtn = document.getElementById('locationBtn');
        const tripModal = document.getElementById('trip-modal');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const tripListModal = document.getElementById('trip-list-modal');
        const newTripInput = document.getElementById('new-trip-input');
        const createTripModalBtn = document.getElementById('create-trip-modal-btn');

        const RECENTLY_VIEWED_KEY = 'voyage-recently-viewed';

        // --- Firebase setup ---
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth(app);
        let currentUserId = null;
        let favoriteIds = new Set();
        let communityFavorites = [];
        let userTrips = [];
        let destinationToAdd = null;

        // Authenticate the user
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUserId = user.uid;
                listenForFavorites();
                listenForCommunityFavorites();
                listenForTrips();
                renderSuggestions();
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

        // --- Firebase Firestore Functions ---

        // Listen for a user's private favorites in real-time
        function listenForFavorites() {
            if (!currentUserId) return;
            const favoritesCollection = collection(db, `artifacts/${appId}/users/${currentUserId}/favorites`);
            onSnapshot(favoritesCollection, (snapshot) => {
                favoriteIds.clear();
                const favorites = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    favoriteIds.add(data.id);
                    favorites.push(data);
                });
                if (favorites.length > 0) {
                    favoritesSection.classList.remove('hide');
                    renderCards(favorites, favoritesList, true);
                } else {
                    favoritesSection.classList.add('hide');
                }
                // Rerender suggestions to update heart icons
                const activeFilterBtn = document.querySelector('.filter-btn.bg-amber-500');
                if (activeFilterBtn) {
                    renderSuggestions(activeFilterBtn.dataset.filter);
                } else {
                    renderSuggestions();
                }
            }, (error) => {
                console.error("Error fetching favorites:", error);
            });
        }

        // Listen for public community favorites in real-time
        function listenForCommunityFavorites() {
            const communityFavoritesCollection = collection(db, `artifacts/${appId}/public/data/communityFavorites`);
            onSnapshot(communityFavoritesCollection, (snapshot) => {
                communityFavorites = [];
                const addedDestinations = new Set(); // To avoid duplicates for display
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (!addedDestinations.has(data.id)) {
                        communityFavorites.push(data);
                        addedDestinations.add(data.id);
                    }
                });
                if (communityFavorites.length > 0) {
                    communityFavoritesSection.classList.remove('hide');
                    renderCards(communityFavorites, communityFavoritesList, false);
                } else {
                    communityFavoritesSection.classList.add('hide');
                }
            }, (error) => {
                console.error("Error fetching community favorites:", error);
            });
        }

        // Listen for a user's trips in real-time
        function listenForTrips() {
            if (!currentUserId) return;
            const tripsCollection = collection(db, `artifacts/${appId}/users/${currentUserId}/trips`);
            onSnapshot(tripsCollection, (snapshot) => {
                userTrips = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    userTrips.push({ id: doc.id, ...data });
                });
                if (userTrips.length > 0) {
                    tripsSection.classList.remove('hide');
                    renderTrips(userTrips);
                } else {
                    tripsSection.classList.add('hide');
                }
            }, (error) => {
                console.error("Error fetching trips:", error);
            });
        }
        
        // Adds or removes a destination from a user's private and public favorites
        async function toggleFavorite(destination) {
            if (!currentUserId) {
                showMessage("Please log in to save favorites.", 'error');
                return;
            }
            const privateDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/favorites`, destination.id);
            const publicDocRef = doc(db, `artifacts/${appId}/public/data/communityFavorites`, `${destination.id}-${currentUserId}`);

            if (favoriteIds.has(destination.id)) {
                // Remove from private and public collections
                await deleteDoc(privateDocRef);
                await deleteDoc(publicDocRef);
            } else {
                // Add to private and public collections
                await setDoc(privateDocRef, destination);
                await setDoc(publicDocRef, { ...destination, userId: currentUserId, favoritedAt: Date.now() });
            }
        }
        
        // Creates a new trip document
        async function createTrip(tripName, destination = null) {
            if (!currentUserId) return;
            const tripsCollection = collection(db, `artifacts/${appId}/users/${currentUserId}/trips`);
            const destinationsArray = destination ? [destination] : [];
            await addDoc(tripsCollection, {
                name: tripName,
                destinations: destinationsArray,
                createdAt: Date.now(),
            });
            showMessage(`Trip "${tripName}" created successfully!`);
        }
        
        // Adds a destination to an existing trip
        async function addToTrip(tripId, destination) {
            if (!currentUserId) return;
            const tripDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/trips`, tripId);
            await updateDoc(tripDocRef, {
                destinations: arrayUnion(destination)
            });
            showMessage(`${destination.name} added to trip!`);
        }

        // --- Function to render suggestion cards ---
        function renderSuggestions(filter = 'all') {
            suggestionList.innerHTML = '';
            let filteredDestinations;

            if (filter === 'local') {
                if (navigator.geolocation) {
                    loadingIndicator.classList.remove('hide');
                    navigator.geolocation.getCurrentPosition(position => {
                        loadingIndicator.classList.add('hide');
                        const userLat = position.coords.latitude;
                        const userLon = position.coords.longitude;

                        // Simple distance check for demo purposes
                        filteredDestinations = destinations.filter(dest => {
                            const distanceLat = Math.abs(userLat - dest.lat);
                            const distanceLon = Math.abs(userLon - dest.lon);
                            return distanceLat < 10 && distanceLon < 10;
                        });

                        if (filteredDestinations.length > 0) {
                            renderCards(filteredDestinations, suggestionList, false);
                        } else {
                            showMessage("No destinations found near you.", 'error');
                        }
                    }, () => {
                        loadingIndicator.classList.add('hide');
                        showMessage("Unable to retrieve your location. Please enable location services.", 'error');
                    });
                } else {
                    showMessage("Geolocation is not supported by your browser.", 'error');
                }
            } else {
                filteredDestinations = destinations.filter(dest => filter === 'all' || dest.tags.includes(filter));
                renderCards(filteredDestinations, suggestionList, false);
            }
        }

        // --- Function to render destination cards in a specified list ---
        function renderCards(list, container, isFavoritesList) {
            container.innerHTML = '';
            list.forEach(dest => {
                const card = document.createElement('div');
                card.className = 'suggestion-card snap-center rounded-2xl shadow-md overflow-hidden relative group';
                const isFavorite = favoriteIds.has(dest.id);
                card.innerHTML = `
                    <img src="${dest.image}" alt="${dest.name}" class="absolute inset-0 w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                    <div class="absolute top-4 right-4 z-10 flex space-x-2">
                        <i class="fas fa-heart text-2xl cursor-pointer transition-colors ${isFavorite ? 'text-red-500' : 'text-stone-300 hover:text-red-400'}"
                           data-id="${dest.id}"></i>
                        <i class="fas fa-plus-circle text-2xl cursor-pointer transition-colors text-stone-300 hover:text-blue-400"
                           data-id="${dest.id}" data-name="${dest.name}"></i>
                    </div>
                    <div class="absolute bottom-4 left-4 text-white p-2">
                        <h3 class="text-lg font-bold">${dest.name}</h3>
                        <p class="text-sm text-gray-200 group-hover:block transition-all duration-300 hidden">${dest.description}</p>
                    </div>
                `;

                // Add event listeners for the whole card, favorite button, and add to trip button
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.fa-heart') || e.target.closest('.fa-plus-circle')) return;
                    handleSearch(dest.name);
                });

                const favoriteBtn = card.querySelector('.fa-heart');
                favoriteBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Stop the event from bubbling up to the card
                    toggleFavorite(dest);
                });

                const addToTripBtn = card.querySelector('.fa-plus-circle');
                addToTripBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    destinationToAdd = dest;
                    openTripModal();
                });

                container.appendChild(card);
            });
        }
        
        // Renders the user's trips
        function renderTrips(trips) {
            tripsList.innerHTML = '';
            trips.forEach(trip => {
                const tripCard = document.createElement('div');
                tripCard.className = 'bg-stone-100 p-4 rounded-xl shadow-inner min-w-[200px] cursor-pointer hover:bg-stone-200 transition-colors';
                tripCard.innerHTML = `
                    <h4 class="text-lg font-semibold text-stone-800">${trip.name}</h4>
                    <p class="text-sm text-stone-500">${trip.destinations ? trip.destinations.length : 0} destinations</p>
                    <div class="mt-2 text-xs text-stone-400">
                        ${trip.destinations ? trip.destinations.map(d => `<span class="inline-block bg-stone-300 text-stone-700 rounded-full px-2 py-1 mr-1 mb-1">${d.name}</span>`).join('') : ''}
                    </div>
                `;
                tripsList.appendChild(tripCard);
            });
        }

        // --- Handle search logic with Gemini API integration ---
        async function handleSearch(query) {
            if (!query) return;

            resultDisplay.classList.add('hide');
            loadingIndicator.classList.remove('hide');
            loadingMessage.textContent = `Generating a travel guide for ${query}...`;

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

                const jsonString = candidate.content.parts[0].text;
                const guide = JSON.parse(jsonString);

                loadingIndicator.classList.add('hide');
                resultDisplay.classList.remove('hide');
                
                let attractionsHtml = '';
                if (guide.attractions && Array.isArray(guide.attractions)) {
                    attractionsHtml = `
                        <h3 class="text-lg font-semibold text-stone-700 mb-2 mt-4">Top Attractions</h3>
                        <ul class="list-disc list-inside space-y-1 text-stone-600">
                            ${guide.attractions.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    `;
                }

                let tipsHtml = '';
                if (guide.tips && Array.isArray(guide.tips)) {
                    tipsHtml = `
                        <h3 class="text-lg font-semibold text-stone-700 mb-2 mt-4">Travel Tips</h3>
                        <ul class="list-disc list-inside space-y-1 text-stone-600">
                            ${guide.tips.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    `;
                }

                resultDisplay.innerHTML = `
                    <h2 class="text-xl font-semibold text-stone-700 mb-4">${guide.title}</h2>
                    <div class="p-4 bg-white rounded-xl shadow-inner">
                        <p class="text-stone-600">${guide.summary}</p>
                        ${attractionsHtml}
                        ${tipsHtml}
                    </div>
                `;
            } catch (error) {
                console.error("Error fetching Gemini content:", error);
                loadingIndicator.classList.add('hide');
                resultDisplay.classList.remove('hide');
                resultDisplay.innerHTML = `
                    <div class="text-center p-4 rounded-xl bg-red-100 text-red-700">
                        <p class="font-medium">Failed to generate a guide. Please try again later.</p>
                    </div>
                `;
            }

            // Add the searched item to the recently viewed list
            const dest = destinations.find(d => d.name === query);
            if (dest) {
                addRecentlyViewed(dest);
            }
        }

        // --- Manage Recently Viewed destinations ---
        function getRecentlyViewed() {
            try {
                const recent = localStorage.getItem(RECENTLY_VIEWED_KEY);
                return recent ? JSON.parse(recent) : [];
            } catch (e) {
                console.error("Error retrieving recently viewed from localStorage", e);
                return [];
            }
        }

        function saveRecentlyViewed(list) {
            try {
                localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list));
            } catch (e) {
                console.error("Error saving to localStorage", e);
            }
        }

        function addRecentlyViewed(destination) {
            let list = getRecentlyViewed();
            // Remove if already exists to move it to the front
            list = list.filter(item => item.name !== destination.name);
            list.unshift(destination); // Add to the beginning
            list = list.slice(0, 5); // Keep only the last 5
            saveRecentlyViewed(list);
            renderRecentlyViewed();
        }

        function renderRecentlyViewed() {
            const list = getRecentlyViewed();
            if (list.length > 0) {
                recentlyViewedSection.classList.remove('hide');
                renderCards(list, recentlyViewedList, false);
            } else {
                recentlyViewedSection.classList.add('hide');
            }
        }
        
        // --- Modal functions ---
        function openTripModal() {
            if (!currentUserId) {
                showMessage("Please log in to create trips.", 'error');
                return;
            }
            tripModal.classList.remove('hide');
            renderTripListModal();
        }

        function closeTripModal() {
            tripModal.classList.add('hide');
            destinationToAdd = null;
            newTripInput.value = '';
        }

        function renderTripListModal() {
            tripListModal.innerHTML = '';
            userTrips.forEach(trip => {
                const tripItem = document.createElement('div');
                tripItem.className = 'p-3 bg-stone-100 rounded-lg cursor-pointer hover:bg-stone-200 transition-colors flex justify-between items-center';
                tripItem.innerHTML = `
                    <span class="text-stone-700">${trip.name}</span>
                    <i class="fas fa-check text-green-500 hide"></i>
                `;
                tripItem.addEventListener('click', async () => {
                    closeTripModal(); // Close immediately for responsive UI
                    if (!destinationToAdd) {
                        showMessage("No destination selected to add.", 'error');
                        return;
                    }
                    showMessage("Adding to your trip...", 'info');
                    try {
                        await addToTrip(trip.id, destinationToAdd);
                    } catch (error) {
                        console.error("Error adding to trip:", error);
                        showMessage("Failed to add destination to trip.", 'error');
                    }
                });
                tripListModal.appendChild(tripItem);
            });
        }

        // --- Event Listeners ---
        closeModalBtn.addEventListener('click', closeTripModal);
        tripModal.addEventListener('click', (e) => {
            if (e.target === tripModal) {
                closeTripModal();
            }
        });

        createTripBtn.addEventListener('click', () => {
            if (!currentUserId) {
                showMessage("Please log in to create trips.", 'error');
                return;
            }
            openTripModal();
        });
        
        createTripModalBtn.addEventListener('click', async () => {
            const tripName = newTripInput.value.trim();
            if (!currentUserId) {
                showMessage("Please log in to create a trip.", 'error');
                return;
            }
            if (!tripName) {
                showMessage("Please enter a name for the new trip.", 'error');
                return;
            }
            closeTripModal(); // Close immediately for responsive UI
            if (!destinationToAdd) {
                showMessage("No destination selected to add.", 'error');
                return;
            }
            showMessage("Creating new trip...", 'info');
            try {
                await createTrip(tripName, destinationToAdd);
            } catch (error) {
                console.error("Error creating new trip:", error);
                showMessage("Failed to create new trip.", 'error');
            }
        });

        // Handle autocomplete on input change
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length < 2) {
                autocompleteResults.classList.add('hide');
                return;
            }

            const filtered = destinations.filter(dest => dest.name.toLowerCase().includes(query));
            autocompleteResults.innerHTML = '';

            if (filtered.length > 0) {
                filtered.forEach(item => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'p-3 hover:bg-stone-100 cursor-pointer text-stone-700';
                    resultItem.textContent = item.name;
                    resultItem.addEventListener('click', () => {
                        searchInput.value = item.name;
                        autocompleteResults.classList.add('hide');
                        handleSearch(item.name);
                    });
                    autocompleteResults.appendChild(resultItem);
                });
                autocompleteResults.classList.remove('hide');
            } else {
                autocompleteResults.classList.add('hide');
            }
        });

        // Handle surprise me button
        surpriseMeBtn.addEventListener('click', () => {
            const randomIndex = Math.floor(Math.random() * destinations.length);
            const randomDest = destinations[randomIndex];
            searchInput.value = randomDest.name;
            handleSearch(randomDest.name);
        });

        // Handle navigation buttons for suggestions
        nextBtn.addEventListener('click', () => {
            suggestionList.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        });

        prevBtn.addEventListener('click', () => {
            suggestionList.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        });

        // Add event listeners for filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;
                renderSuggestions(filter);
                filterButtons.forEach(btn => btn.classList.remove('bg-amber-500', 'text-white'));
                button.classList.add('bg-amber-500', 'text-white');
            });
        });

        // Hide autocomplete when clicking outside
        document.addEventListener('click', (e) => {
            if (!autocompleteResults.contains(e.target) && e.target !== searchInput) {
                autocompleteResults.classList.add('hide');
            }
        });

        // Initial render
        renderSuggestions();
        renderRecentlyViewed();
        document.querySelector('[data-filter="all"]').classList.add('bg-amber-500', 'text-white');
    </script>

</body>

</html>
