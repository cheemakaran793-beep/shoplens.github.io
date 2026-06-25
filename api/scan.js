export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: "No image received." });
  }

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL,
        messages: [
          {
            role: "user",
content: [
  {
    type: "text",
    text: `
Identify the product shown in this image.

Return ONLY valid JSON.

Example:

{
  "product_name":"Apple iPhone 14 White"
}

Rules:
- Include brand
- Include model
- Include color if visible
- Include variant if visible

Do not explain.
Do not think step by step.
Do not provide analysis.
Do not provide markdown.

Return JSON only.
`
  },

  {
    type: "image_url",
    image_url: {
      url: image
    }
  }
]
          }
        ],
        temperature: 0
      })
    });

    const groqData = await groqRes.json();

   if (!groqRes.ok) {
  console.log("GROQ ERROR:", groqData);

  return res.status(500).json({
    error: JSON.stringify(groqData)
  });
}

    const productName =
      groqData.choices?.[0]?.message?.content?.trim();

    if (!productName) {
      return res.status(500).json({
        error: "Could not identify product."
      });
    }

    const serpRes = await fetch(
      `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(productName)}&gl=in&hl=en&google_domain=google.co.in&api_key=${process.env.SERPAPI_KEY}`
    );

    const serpData = await serpRes.json();

   const first = serpData.shopping_results?.[0];
    const results = serpData.shopping_results || [];

const productData = {
  product_name: first?.title || productName,
  description: first?.snippet || "Product identified by ShopLens AI",
  price: first?.price || "N/A",
  image: first?.thumbnail || "",
  buy_url:
    first?.product_link ||
    first?.link ||
    first?.serpapi_product_api ||
    "#",
  store: first?.source || "Unknown Store",
  rating: first?.rating || "N/A",
  reviews: first?.reviews || "N/A",
  safety_score: 97,
  sales_trend: "High",
  match_score: 98,
  alternatives: results.slice(0, 5)
};

return res.status(200).json(productData);

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: err.message
    });
  }
}
