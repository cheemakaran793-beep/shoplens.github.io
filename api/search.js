export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { query } = req.body;
  const { GROQ_API_KEY, SERPAPI_KEY } = process.env;

  try {
    // AI Logic: Fetch products with search-based URL instruction
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        response_format: { type: "json_object" },
        messages: [{
          role: "system", 
          content: `You are an Indian shopping assistant. Return JSON with 'results' array (4 products). 
          Each product: name, description, rating, price (formatted in ₹), status (safe/caution/scam), reason. 
          For the 'url' field, provide a functional Amazon India search link: https://www.amazon.in/s?k=PRODUCT_NAME_HERE`
        }, {
          role: "user",
          content: `Search for: ${query} in India`
        }]
      })
    });

    const groqData = await groqRes.json();
    let products = JSON.parse(groqData.choices[0].message.content).results;

    // Map products and sanitize the URL with the actual product name
    const finalResults = products.map(p => ({
      ...p,
      url: `https://www.amazon.in/s?k=${encodeURIComponent(p.name)}`
    }));

    // Image Logic: Fetch images for India region
    const resultsWithImages = await Promise.all(finalResults.map(async (p) => {
      try {
        const serpRes = await fetch(`https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(p.name)}&api_key=${SERPAPI_KEY}&gl=in&location=India&hl=en`);
        const data = await serpRes.json();
        return { ...p, image: data.images_results?.[0]?.original || "" };
      } catch (e) { return { ...p, image: "" }; }
    }));

    res.status(200).json({ results: resultsWithImages });
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
}
