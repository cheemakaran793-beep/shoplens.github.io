// api/search.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { query } = req.body;
  const GROQ_API_KEY = process.env.GROQ_API_KEY; // This is the key in your Vercel settings

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [{
          role: 'user',
          content: `You are a shopping AI. User searched: "${query}". Return exactly 4 results as a JSON array with: name, description, rating, price, status, reason.`
        }],
        response_format: { type: "json_object" }
      })
    });
    
    const data = await response.json();
    
    // Parse the AI response correctly
    const content = JSON.parse(data.choices[0].message.content);
    res.status(200).json({ results: content.results || content });
  } catch (error) {
    res.status(500).json({ error: 'Groq API failed' });
  }
}
