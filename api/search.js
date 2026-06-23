export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { query } = req.body;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const SERPAPI_KEY = process.env.SERPAPI_KEY;

  try {
    // 1. Get Product Details from Groq
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Faster and very stable
        response_format: { type: "json_object" },
        messages: [{
          role: "system", 
          content: "You are a shopping AI for the Indian market. Return a JSON object with a 'results' array of 4 products. Each product needs: name, description, rating, price (format as ₹XX,XXX)."
        }, {
          role: "user",
          content: `Search for: ${query}`
        }]
      })
    });

    const groqData = await groqRes.json();
    let products = JSON.parse(groqData.choices[0].message.content).results;

    // 2. Fetch Images for the Indian Region
    const productsWithImages = await Promise.all(products.map(async (p) => {
      try {
        // Added gl=in and location=India to ensure results are from India
        const serpRes = await fetch(`https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(p.name)}&api_key=${SERPAPI_KEY}&gl=in&location=India&hl=en`);
        const serpData = await serpRes.json();
        return { ...p, image: serpData.images_results?.[0]?.original || "" };
      } catch (e) {
        return { ...p, image: "" };
      }
    }));

    res.status(200).json({ results: productsWithImages });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch results" });
  }
}
