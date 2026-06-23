// api/search.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { query } = req.body;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const SERPAPI_KEY = process.env.SERPAPI_KEY;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        response_format: { type: "json_object" },
        messages: [{
          role: "system", 
          content: "You are an Indian shopping AI. Return JSON with 'results' array of 4 products. Fields: name, description, rating, price (formatted in ₹), status (safe/caution/scam), reason, and url."
        }, {
          role: "user",
          content: `Search for: ${query}`
        }]
      })
    });

    const groqData = await groqRes.json();
    let products = JSON.parse(groqData.choices[0].message.content).results;

    const productsWithImages = await Promise.all(products.map(async (p) => {
      try {
        const serpRes = await fetch(`https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(p.name)}&api_key=${SERPAPI_KEY}&gl=in&location=India&hl=en`);
        const serpData = await serpRes.json();
        return { ...p, image: serpData.images_results?.[0]?.original || "" };
      } catch (e) { return { ...p, image: "" }; }
    }));

    res.status(200).json({ results: productsWithImages });
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
}
