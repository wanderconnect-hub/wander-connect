// api/partner-requests.js

export default function handler(req, res) {
  if (req.method === 'GET') {
    const partnerRequests = [
      {
        userId: 1,
        tripDescription: "Anyone up for a multi-day trek through Patagonia?",
        imageUrl: "https://example.com/images/patagonia.jpg",
      },
      {
        userId: 2,
        tripDescription: "Planning a culinary tour of Tokyo next month.",
        imageUrl: "https://example.com/images/tokyo-foodie.jpg",
      },
      {
        userId: 3,
        tripDescription: "Two weeks of island hopping and relaxing on the beaches of Thailand.",
        imageUrl: "https://example.com/images/thailand-beach.jpg",
      },
      // Add more partner requests here or fetch dynamically if needed
    ];

    res.status(200).json(partnerRequests);
  } else {
    res.setHeader('Allow', 'GET');
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
