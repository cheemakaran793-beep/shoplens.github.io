module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192', // Or 'llama3-70b-8192'
          messages: [
            { 
              role: 'system', 
              content: 'You are ShopLens AI, a smart shopping assistant. Help users find products, compare prices, check for scams, and make smart buying decisions. Be concise, friendly, and helpful.' 
            },
            { role: 'user', content: message }
          ]
        }),
      }
    );

    const data = await response.json();
    
    // Groq uses the standard OpenAI response format
    const data = await response.json();

console.log("Groq response:", data);

if (!response.ok) {
  return res.status(response.status).json(data);
}

res.status(200).json({
  reply: data.choices[0].message.content
});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
