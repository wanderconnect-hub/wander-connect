

import React from 'react';
import type { User, Post, TravelPartnerRequest, Comment } from './types';

export const MOCK_USERS: User[] = [
  { id: 1, name: 'Alex', email: 'alex@example.com', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=80', coverPhotoUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200', bio: 'Adventure seeker and mountain climber. Looking for a hiking partner.', travelStyle: ['Adventure', 'Backpacking'], interests: ['Hiking', 'Nature', 'Photography'], miles: 25000, placesCount: 15, trips: 42, partners: 8, profileComplete: true },
  { id: 2, name: 'Brenda', email: 'brenda@example.com', avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&q=80', coverPhotoUrl: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=1200', bio: 'Foodie who loves exploring new cities and their culinary scenes. Michelin stars or street food, I love it all.', travelStyle: ['Luxury', 'City Break'], interests: ['Food', 'Museums', 'History'], miles: 45000, placesCount: 25, trips: 18, partners: 3, profileComplete: true },
  { id: 3, name: 'Carlos', email: 'carlos@example.com', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80', coverPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723a996f6ea?q=80&w=1200', bio: 'Digital nomad who enjoys beaches and chill vibes. Mornings are for yoga, afternoons for coding, and evenings for sunset watching.', travelStyle: ['Relaxation', 'Budget'], interests: ['Beaches', 'Yoga', 'Cafes'], miles: 60000, placesCount: 30, trips: 12, partners: 5, profileComplete: true },
  { id: 4, name: 'Diana', email: 'diana@example.com', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80', coverPhotoUrl: 'https://images.unsplash.com/photo-1528114639414-b4a81b25a3ca?q=80&w=1200', bio: 'History buff and art lover. My dream is to visit every major museum in the world. I love getting lost in old cities.', travelStyle: ['Cultural', 'City Break'], interests: ['History', 'Art', 'Museums'], miles: 35000, placesCount: 22, trips: 20, partners: 2, profileComplete: true },
  { id: 5, name: 'Ethan', email: 'ethan@example.com', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80', coverPhotoUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1200', bio: "Loves road trips and discovering hidden gems off the beaten path. Let's find a waterfall no one's heard of.", travelStyle: ['Adventure', 'Road Trip'], interests: ['Nature', 'Photography', 'Driving'], miles: 75000, placesCount: 50, trips: 35, partners: 6, profileComplete: true },
  { id: 6, name: 'Fiona', email: 'fiona@example.com', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&q=80', coverPhotoUrl: 'https://images.unsplash.com/photo-1546223659-462a7596236b?q=80&w=1200', bio: 'Party animal and festival goer. Looking for someone to dance the night away with in Ibiza or Tomorrowland.', travelStyle: ['Nightlife', 'Luxury'], interests: ['Music', 'Dancing', 'Festivals'], miles: 80000, placesCount: 18, trips: 50, partners: 12, profileComplete: true },
  { id: 7, name: 'George', email: 'george@example.com', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80', coverPhotoUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1200', bio: "Quiet bookworm who loves cozy cafes, long train journeys, and historical novels. Let's explore Europe by rail.", travelStyle: ['Relaxation', 'Cultural'], interests: ['Reading', 'History', 'Cafes'], miles: 15000, placesCount: 12, trips: 8, partners: 1, profileComplete: true },
];

export const CURRENT_USER = MOCK_USERS[0];

export const TRAVEL_STYLES = ['Adventure', 'Luxury', 'Backpacking', 'Relaxation', 'Cultural', 'City Break', 'Road Trip', 'Budget', 'Nightlife'];
export const INTERESTS = ['Hiking', 'Food', 'History', 'Beaches', 'Art', 'Nightlife', 'Photography', 'Museums', 'Nature', 'Yoga', 'Music', 'Reading'];


const now = Date.now();
const minutes = (m: number) => m * 60 * 1000;
const hours = (h: number) => h * 60 * 60 * 1000;
const days = (d: number) => d * 24 * hours(1);
const weeks = (w: number) => w * 7 * days(1);
const months = (m: number) => m * 30 * days(1); // Approximation

const MOCK_COMMENTS: Comment[] = [
    { id: 1, user: MOCK_USERS[0], text: "Wow, looks incredible!", timestamp: new Date(now - hours(1)).toISOString() },
    { id: 2, user: MOCK_USERS[3], text: "Adding this to my bucket list!", timestamp: new Date(now - minutes(30)).toISOString() },
    { id: 3, user: MOCK_USERS[2], text: "Stunning shot!", timestamp: new Date(now - minutes(15)).toISOString() },
    { id: 4, user: MOCK_USERS[4], text: "Amazing! Hope you had a great time.", timestamp: new Date(now - minutes(5)).toISOString() },
];


export const MOCK_POSTS: Post[] = [
    // New posts for Brenda (User ID 2)
    {
        id: 20, user: MOCK_USERS[1],
        mediaUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80', mediaType: 'image',
        caption: "Fine dining in the city of love. Every dish was a masterpiece!",
        location: "Paris, France",
        timestamp: new Date(now - days(5)).toISOString(),
        likedByUserIds: [1, 3, 4], comments: [],
    },
    {
        id: 21, user: MOCK_USERS[1],
        mediaUrl: 'https://images.unsplash.com/photo-1590031934989-a78b31d87f58?w=800&q=80', mediaType: 'image',
        caption: "So many fresh flavors at La Boqueria market. A foodie's paradise.",
        location: "Barcelona, Spain",
        timestamp: new Date(now - weeks(2)).toISOString(),
        likedByUserIds: [5, 6], comments: [],
    },
    {
        id: 22, user: MOCK_USERS[1],
        mediaUrl: 'https://images.unsplash.com/photo-1592651093529-T441312b655f?w=800&q=80', mediaType: 'image',
        caption: "Perfectly proper afternoon tea. The scones were divine!",
        location: "London, UK",
        timestamp: new Date(now - months(1)).toISOString(),
        likedByUserIds: [1, 7], comments: [],
    },
    // New posts for Carlos (User ID 3)
    {
        id: 23, user: MOCK_USERS[2],
        mediaUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80', mediaType: 'image',
        caption: "Sunrise yoga on the beach is the best way to start the day. Pure bliss.",
        location: "Koh Phangan, Thailand",
        timestamp: new Date(now - days(6)).toISOString(),
        likedByUserIds: [1, 4, 5], comments: [],
    },
    {
        id: 24, user: MOCK_USERS[2],
        mediaUrl: 'https://images.unsplash.com/photo-1515404929826-76fff9eefb3b?w=800&q=80', mediaType: 'image',
        caption: "Found my happy place. Just me, a hammock, and the endless blue.",
        location: "Maldives",
        timestamp: new Date(now - weeks(3)).toISOString(),
        likedByUserIds: [2, 6, 7], comments: [],
    },
    {
        id: 25, user: MOCK_USERS[2],
        mediaUrl: 'https://images.unsplash.com/photo-1511915239988-54c303f34f78?w=800&q=80', mediaType: 'image',
        caption: "Digital nomading done right. Great coffee and even better views.",
        location: "Lisbon, Portugal",
        timestamp: new Date(now - months(2)).toISOString(),
        likedByUserIds: [1, 4], comments: [],
    },
    // New posts for Diana (User ID 4)
    {
        id: 26, user: MOCK_USERS[3],
        mediaUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80', mediaType: 'image',
        caption: "Standing inside the Colosseum, you can almost hear the echoes of history.",
        location: "Rome, Italy",
        timestamp: new Date(now - days(8)).toISOString(),
        likedByUserIds: [1, 2, 7], comments: [],
    },
    {
        id: 27, user: MOCK_USERS[3],
        mediaUrl: 'https://images.unsplash.com/photo-1620392137996-2cb7b642a8b3?w=800&q=80', mediaType: 'image',
        caption: "Completely mesmerized by the art in the Uffizi Gallery.",
        location: "Florence, Italy",
        timestamp: new Date(now - weeks(4)).toISOString(),
        likedByUserIds: [5, 6], comments: [],
    },
    {
        id: 28, user: MOCK_USERS[3],
        mediaUrl: 'https://images.unsplash.com/photo-1588421323974-9a4253018dba?w=800&q=80', mediaType: 'image',
        caption: "Watching the sunset over the Acropolis. A truly magical moment.",
        location: "Athens, Greece",
        timestamp: new Date(now - months(3)).toISOString(),
        likedByUserIds: [1, 3], comments: [],
    },
    // New posts for Ethan (User ID 5)
    {
        id: 29, user: MOCK_USERS[4],
        mediaUrl: 'https://images.unsplash.com/photo-1473248380598-1c42f31a1a36?w=800&q=80', mediaType: 'image',
        caption: "The scale of Monument Valley is just unreal. Classic American road trip scenery.",
        location: "Monument Valley, USA",
        timestamp: new Date(now - days(10)).toISOString(),
        likedByUserIds: [1, 3, 6], comments: [],
    },
    {
        id: 30, user: MOCK_USERS[4],
        mediaUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80', mediaType: 'image',
        caption: "Waking up to this view. Camping in the Canadian Rockies is a must-do.",
        location: "Banff National Park, Canada",
        timestamp: new Date(now - weeks(5)).toISOString(),
        likedByUserIds: [2, 7], comments: [],
    },
    {
        id: 31, user: MOCK_USERS[4],
        mediaUrl: 'https://images.unsplash.com/photo-1589903932677-66a985b0377a?w=800&q=80', mediaType: 'image',
        caption: "Chasing waterfalls and finding gems like this one.",
        location: "Columbia River Gorge, Oregon",
        timestamp: new Date(now - months(4)).toISOString(),
        likedByUserIds: [1, 3], comments: [],
    },
    // New posts for Fiona (User ID 6)
    {
        id: 32, user: MOCK_USERS[5],
        mediaUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80', mediaType: 'image',
        caption: "The energy at this place was insane! Danced until sunrise.",
        location: "Berlin, Germany",
        timestamp: new Date(now - days(12)).toISOString(),
        likedByUserIds: [2, 3], comments: [],
    },
    {
        id: 33, user: MOCK_USERS[5],
        mediaUrl: 'https://images.unsplash.com/photo-1519405527339-b9c13b7321e0?w=800&q=80', mediaType: 'image',
        caption: "Cocktails with a view from the top of Marina Bay Sands.",
        location: "Singapore",
        timestamp: new Date(now - weeks(6)).toISOString(),
        likedByUserIds: [1, 4], comments: [],
    },
    {
        id: 34, user: MOCK_USERS[5],
        mediaUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80', mediaType: 'image',
        caption: "Festival season is the best season. So many good vibes!",
        location: "Coachella Valley, USA",
        timestamp: new Date(now - months(5)).toISOString(),
        likedByUserIds: [2, 3, 5], comments: [],
    },
    // New posts for George (User ID 7)
    {
        id: 35, user: MOCK_USERS[6],
        mediaUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=80', mediaType: 'image',
        caption: "Could spend a lifetime in the Strahov Library. A paradise for any book lover.",
        location: "Prague, Czech Republic",
        timestamp: new Date(now - days(15)).toISOString(),
        likedByUserIds: [1, 4], comments: [],
    },
    {
        id: 36, user: MOCK_USERS[6],
        mediaUrl: 'https://images.unsplash.com/photo-1506677317713-92265217c820?w=800&q=80', mediaType: 'image',
        caption: "The views from the train window are better than any movie. Simply stunning.",
        location: "Swiss Alps, Switzerland",
        timestamp: new Date(now - weeks(7)).toISOString(),
        likedByUserIds: [2, 5], comments: [],
    },
    {
        id: 37, user: MOCK_USERS[6],
        mediaUrl: 'https://images.unsplash.com/photo-1531988042231-f39a6cc12a9a?w=800&q=80', mediaType: 'image',
        caption: "Found the most charming little bookshop tucked away on a side street.",
        location: "Edinburgh, Scotland",
        timestamp: new Date(now - months(6)).toISOString(),
        likedByUserIds: [1, 4], comments: [],
    },
    {
        id: 17,
        user: MOCK_USERS[0],
        mediaUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80',
        mediaType: 'image',
        caption: "Getting lost in the charming canals of Venice. Every turn is a postcard.",
        location: "Venice, Italy",
        timestamp: new Date(now - minutes(10)).toISOString(),
        likedByUserIds: [2, 4, 6],
        comments: [],
    },
    {
        id: 18,
        user: MOCK_USERS[0],
        mediaUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbb563?w=800&q=80',
        mediaType: 'image',
        caption: "Camel trekking through the Sahara. The silence of the dunes is something else.",
        location: "Sahara Desert, Morocco",
        timestamp: new Date(now - minutes(45)).toISOString(),
        likedByUserIds: [3, 5, 7],
        comments: [],
    },
    {
        id: 19,
        user: MOCK_USERS[0],
        mediaUrl: 'https://images.unsplash.com/photo-1577439240360-a04a406637e4?w=800&q=80',
        mediaType: 'image',
        caption: "Exploring the vibrant underwater world of the Great Barrier Reef. Truly a different planet down there.",
        location: "Great Barrier Reef, Australia",
        timestamp: new Date(now - hours(1)).toISOString(),
        likedByUserIds: [2, 5, 6],
        comments: [],
    },
    {
        id: 1,
        user: MOCK_USERS[1],
        mediaUrl: 'https://images.unsplash.com/photo-1534412320490-52a16057c74c?w=600&q=80',
        mediaType: 'image',
        caption: 'Absolutely breathtaking views from the top! Worth the climb. 🏔️',
        location: 'Swiss Alps, Switzerland',
        timestamp: new Date(now - hours(2)).toISOString(),
        likedByUserIds: [3, 4, 5, 6, 7],
        comments: MOCK_COMMENTS.slice(0, 2),
    },
    {
        id: 2,
        user: MOCK_USERS[2],
        mediaUrl: 'https://images.unsplash.com/photo-1537996194471-e657df97525d?w=600&q=80',
        mediaType: 'image',
        caption: 'The sound of the waves is pure therapy. Could stay here forever.',
        location: 'Bali, Indonesia',
        timestamp: new Date(now - days(1)).toISOString(),
        likedByUserIds: [1, 4, 6],
        comments: MOCK_COMMENTS.slice(2, 4),
    },
    {
        id: 3,
        user: MOCK_USERS[3],
        mediaUrl: 'https://images.unsplash.com/photo-1529181109425-ce69c3944a9b?w=600&q=80',
        mediaType: 'image',
        caption: 'Exploring the ancient streets of Rome. Every corner tells a story.',
        location: 'Rome, Italy',
        timestamp: new Date(now - days(3)).toISOString(),
        likedByUserIds: [1, 2, 5, 7],
        comments: [],
    },
    {
        id: 4,
        user: MOCK_USERS[0],
        mediaUrl: 'https://images.unsplash.com/photo-1518428122319-21b8b23a54b3?w=800&q=80',
        mediaType: 'image',
        caption: 'Sunrise hike was totally worth it.',
        location: 'Yosemite National Park, USA',
        timestamp: new Date(now - hours(5)).toISOString(),
        likedByUserIds: [2, 3],
        comments: [
             { id: 5, user: MOCK_USERS[4], text: "Early bird gets the worm! Great picture.", timestamp: new Date(now - hours(4)).toISOString() }
        ],
    },
    {
        id: 5,
        user: MOCK_USERS[0],
        mediaUrl: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800&q=80',
        mediaType: 'image',
        caption: 'Kayaking through the fjords!',
        location: 'Geirangerfjord, Norway',
        timestamp: new Date(now - days(2)).toISOString(),
        likedByUserIds: [4, 5, 6],
        comments: [],
    },
    {
        id: 6,
        user: MOCK_USERS[0],
        caption: 'My first text-only post! Thinking about where to go next. Any suggestions?',
        location: '',
        timestamp: new Date(now - days(4)).toISOString(),
        likedByUserIds: [7],
        comments: [
            { id: 6, user: MOCK_USERS[6], text: "You should try a train journey through Scotland!", timestamp: new Date(now - days(3)).toISOString() },
            { id: 7, user: MOCK_USERS[1], text: "The mountains in Patagonia are calling your name.", timestamp: new Date(now - days(2)).toISOString() },
        ],
    },
    {
        id: 7,
        user: MOCK_USERS[0],
        mediaUrl: 'https://images.unsplash.com/photo-1484041123284-745f84221151?w=800&q=80',
        mediaType: 'image',
        caption: 'Chasing waterfalls in Iceland.',
        location: 'Skógafoss, Iceland',
        timestamp: new Date(now - weeks(1)).toISOString(),
        likedByUserIds: [2, 3, 4, 5, 6, 7],
        comments: [],
    },
    {
        id: 8,
        user: MOCK_USERS[0],
        mediaUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80',
        mediaType: 'image',
        caption: 'Lost city of the Incas. Unforgettable.',
        location: 'Machu Picchu, Peru',
        timestamp: new Date(now - weeks(2)).toISOString(),
        likedByUserIds: [2, 4, 6],
        comments: [],
    },
    {
        id: 9,
        user: MOCK_USERS[0],
        mediaUrl: 'https://images.unsplash.com/photo-1580694239255-46e3441a54fb?w=800&q=80',
        mediaType: 'image',
        caption: 'The leap of faith in Queenstown!',
        location: 'Queenstown, New Zealand',
        timestamp: new Date(now - weeks(3)).toISOString(),
        likedByUserIds: [3, 5],
        comments: [],
    },
    {
        id: 10,
        user: MOCK_USERS[0],
        mediaUrl: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&q=80',
        mediaType: 'image',
        caption: 'Sakura season is magical.',
        location: 'Kyoto, Japan',
        timestamp: new Date(now - months(1)).toISOString(),
        likedByUserIds: [2, 3, 4, 5, 6, 7],
        comments: [],
    },
    {
        id: 11,
        user: MOCK_USERS[0],
        mediaUrl: 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800&q=80',
        mediaType: 'image',
        caption: 'Standing in awe of the Great Pyramids.',
        location: 'Giza, Egypt',
        timestamp: new Date(now - months(1)).toISOString(),
        likedByUserIds: [4, 7],
        comments: [],
    },
    {
        id: 12,
        user: MOCK_USERS[0],
        mediaUrl: 'https://images.unsplash.com/photo-1552858715-738827cbf105?w=800&q=80',
        mediaType: 'image',
        caption: 'Flying through the Costa Rican rainforest.',
        location: 'Monteverde, Costa Rica',
        timestamp: new Date(now - months(2)).toISOString(),
        likedByUserIds: [5, 6],
        comments: [],
    },
    {
        id: 13,
        user: MOCK_USERS[3], // Diana
        mediaUrl: 'https://images.unsplash.com/photo-1500313830628-6d258880c111?w=600&q=80',
        mediaType: 'image',
        caption: 'Lost in the halls of the Louvre. So much history in one place!',
        location: 'Paris, France',
        timestamp: new Date(now - months(2)).toISOString(),
        likedByUserIds: [1, 2, 6, 7],
        comments: [],
    },
    {
        id: 14,
        user: MOCK_USERS[4], // Ethan
        mediaUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
        mediaType: 'image',
        caption: "Pacific Coast Highway never disappoints. What a drive!",
        location: 'California, USA',
        timestamp: new Date(now - months(2)).toISOString(),
        likedByUserIds: [1, 3, 5],
        comments: [],
    },
    {
        id: 15,
        user: MOCK_USERS[5], // Fiona
        mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
        mediaType: 'image',
        caption: 'Vibes at the festival were unreal! 🎶',
        location: 'Boom, Belgium',
        timestamp: new Date(now - months(3)).toISOString(),
        likedByUserIds: [2, 3, 6],
        comments: [],
    },
    {
        id: 16,
        user: MOCK_USERS[6], // George
        mediaUrl: 'https://images.unsplash.com/photo-1560026333-b82352431713?w=600&q=80',
        mediaType: 'image',
        caption: 'A perfect afternoon with a good book and even better coffee.',
        location: 'Vienna, Austria',
        timestamp: new Date(now - months(3)).toISOString(),
        likedByUserIds: [1, 4],
        comments: [],
    }
];

export const MOCK_RAW_REQUESTS = [
    {
      userId: 1,
      tripDescription: "Anyone up for a multi-day trek through Patagonia? Looking for an experienced hiking partner for this winter.",
      imageUrl: "https://images.unsplash.com/photo-1526481280643-3b3c9599b422?w=500&q=80",
    },
    {
      userId: 2,
      tripDescription: "I'm planning a culinary tour of Tokyo next month. Need a fellow foodie to explore ramen shops and sushi bars with!",
      imageUrl: "https://images.unsplash.com/photo-1559642875-73f915239e94?w=500&q=80",
    },
    {
      userId: 3,
      tripDescription: "Two weeks of island hopping and relaxing on the beaches of Thailand. Who's in for some sun, sand, and good vibes?",
      imageUrl: "https://images.unsplash.com/photo-1509280951623-4a174069d168?w=500&q=80",
    },
    {
      userId: 4,
      tripDescription: "Seeking an art history lover to explore the museums and galleries of Florence with me for a week in the spring.",
      imageUrl: "https://images.unsplash.com/photo-1528114639414-b4a81b25a3ca?w=500&q=80",
    },
    {
      userId: 5,
      tripDescription: "Epic road trip planned for New Zealand's South Island. Hikes, scenic drives, and adventure sports on the menu!",
      imageUrl: "https://images.unsplash.com/photo-1559983122-8344f6d357a5?w=500&q=80",
    },
    {
      userId: 6,
      tripDescription: "Got an extra ticket for a music festival in Ibiza! Looking for a fun-loving partner to dance from dusk till dawn.",
      imageUrl: "https://images.unsplash.com/photo-1546223659-462a7596236b?w=500&q=80",
    },
    {
      userId: 7,
      tripDescription: "A slow-paced train journey through the Scottish Highlands. Looking for a quiet companion for reading and enjoying the scenery.",
      imageUrl: "https://images.unsplash.com/photo-1593793731518-a6697079f829?w=500&q=80",
    }
];

export const timeAgo = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 5) return "just now";

    const intervals: { [key: string]: number } = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
    };

    let counter;
    for (const unit in intervals) {
        counter = Math.floor(seconds / intervals[unit]);
        if (counter > 0) {
            return counter === 1 ? `1 ${unit} ago` : `${counter} ${unit}s ago`;
        }
    }
    
    return `${Math.floor(seconds)} seconds ago`;
};


export const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
);
export const HeartIconSolid = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M11.645 20.91a.75.75 0 0 1-1.29 0C8.633 16.7 3 12.433 3 8.25 3 5.765 5.1 3.75 7.688 3.75A4.685 4.685 0 0 1 12 5.987a4.685 4.685 0 0 1 4.313-2.237C18.9 3.75 21 5.765 21 8.25c0 4.183-5.633 8.45-7.355 12.66Z" />
    </svg>
);
export const ChatBubbleLeftEllipsisIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.006 3 12c0 1.74.527 3.355 1.443 4.746l-.315 1.046a.75.75 0 0 0 .94.94l1.046-.315A9.01 9.01 0 0 0 12 20.25Z" />
    </svg>
);
export const EllipsisVerticalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
    </svg>
);
export const PencilSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);
export const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
);
export const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);
export const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-3.181-4.991-3.181-3.183a8.25 8.25 0 0 0-11.667 0L2.985 14.651m6.364-1.353v4.992" />
    </svg>
);
export const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
);
export const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);
export const ArrowTrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.517l2.74-1.22m0 0-3.94.394m3.94-.394.394 3.94" />
    </svg>
);
export const Cog6ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.092 1.21-.138 2.43-.138 3.662s.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.092-1.21.138-2.43.138-3.662zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
);
export const ArrowLeftOnRectangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);
export const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.72-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
    </svg>
);
export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);
export const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-4.67c.61 1.172.61 2.59 0 3.762l-.001.003zM12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6.375 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
);
export const GlobeAltIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c.504 0 1.002-.02 1.49-.06M12 3a9.004 9.004 0 0 1 8.716 6.747M12 3a9.004 9.004 0 0 0-8.716 6.747M12 3c-.504 0-1.002.02-1.49-.06M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
);
export const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
    </svg>
);
export const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);