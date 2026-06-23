// api/search.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { query } = req.body;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        // This is the "Magic" line that forces valid JSON
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system", 
            content: "You are a shopping assistant. You MUST return a JSON object with a single key 'results' which is an array of 4 products. Each product must have: name, description, rating, price, status, reason."
          },
          {
            role: "user",
            content: `Search for: ${query}`
          }
        ]
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error("Groq API Error:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    // Since we used response_format: json_object, this is guaranteed to be valid
    const content = JSON.parse(data.choices[0].message.content);
    res.status(200).json(content);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Failed to fetch results" });
  }
}
