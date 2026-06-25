module.exports = async function handler(req, res) {
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
                text: "Identify the EXACT product shown. Include brand, model, color, edition, size, variant and generation if visible. Example: Nike Air Max 270 Black Men's Running Shoes. Reply ONLY with the exact product name."
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
      return res.status(500).json({
        error: groqData.error || "Groq request failed."
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

if (!first) {
  return res.status(200).json({
    product_name: productName,
    description: "Product identified by ShopLens AI",
    price: "Not Found",
    image: "",
    buy_url: "",
    store: "Unknown Store",
    rating: "N/A",
    reviews: "N/A",
    safety_score: 85,
    sales_trend: "Unknown",
    match_score: 70
  });
}

const productData = {
  product_name: first.title || productName,
  description: first.snippet || "Product identified by ShopLens AI",
  price: first.price || "N/A",
  image: first.thumbnail || "",
  buy_url: first.product_link || first.link || "#",
  store: first.source || "Unknown Store",
  rating: first.rating || "N/A",
  reviews: first.reviews || "N/A",
  safety_score: 97,
  sales_trend: "High",
  match_score: 98
};

return res.status(200).json(productData);
    }

    return res.status(200).json({
      product_name: first.title,
      price: first.price,
      image: first.thumbnail,
      buy_url: first.link
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: err.message
    });
  }
}
