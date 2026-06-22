module.exports = async function handler(req, res) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it:free",
        messages: [
          {
            role: "user",
            content: `Return exactly 9 trending shopping products as a JSON array:
[
{"emoji":"👟","name":"Product","category":"Fashion","trend":"Why it's trending","heat":"🔥 Hot"}
]
Return ONLY the JSON array.`
          }
        ]
      })
    });

    const data = await response.json();

    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
