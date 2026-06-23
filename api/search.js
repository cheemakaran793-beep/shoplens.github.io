export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { query } = req.body;
  const { SERPAPI_KEY } = process.env;

  try {
    // We use the 'google_shopping' engine to get real prices and images
    const serpRes = await fetch(`https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&gl=in&location=India&hl=en`);
    const data = await serpRes.json();
    
    // Check if we have shopping results
    if (!data.shopping_results || data.shopping_results.length === 0) {
      return res.status(404).json({ results: [] });
    }

    // Map the actual data from the shopping results
    const finalResults = data.shopping_results.slice(0, 4).map(p => ({
      name: p.title,
      description: p.snippet || "No description available",
      rating: p.rating || "N/A",
      price: p.price || "Contact seller",
      status: "SAFE", // Shopping results are generally vetted retail listings
      url: p.link,
      image: p.thumbnail
    }));

    res.status(200).json({ results: finalResults });
  } catch (error) {
    res.status(500).json({ error: "Shopping search failed" });
  }
}
