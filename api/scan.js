module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: "No image received" });
  }

  try {
    // =========================
    // 1. VISION ANALYSIS
    // =========================
    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
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
STRICT PRODUCT DETECTION TASK

Rules:
- Identify ONLY what is clearly visible.
- NEVER assume Pro / Pro Max / Plus / Storage size.
- NEVER guess hidden specs.
- Provide the exact base model name (e.g., "Apple iPhone 15", "Nike Air Force 1").
- If uncertain -> choose the general category.

Return ONLY JSON:
{
  "product_name": "",
  "confidence": 0
}
                  `,
                },
                {
                  type: "image_url",
                  image_url: { url: image },
                },
              ],
            },
          ],
          temperature: 0,
        }),
      }
    );

    const groqText = await groqRes.text();

    let groqData;
    try {
      groqData = JSON.parse(groqText);
    } catch {
      return res.status(500).json({ error: "Vision parsing failed" });
    }

    const raw = groqData?.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|
```/g, "").trim());
    } catch {
      parsed = { product_name: raw };
    }

    let productName = parsed.product_name || "";

    if (!productName) {
      return res.status(500).json({ error: "No product detected" });
    }

    // =========================
    // 2. CLEAN PRODUCT NAME
    // =========================
    productName = productName
      .replace(/pro max/gi, "")
      .replace(/plus/gi, "")
      .trim();

    // =========================
    // 3. SERPAPI SEARCH
    // =========================
    const serpRes = await fetch(
      `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(
        productName
      )}&gl=in&hl=en&api_key=${process.env.SERPAPI_KEY}`
    );

    const serpData = await serpRes.json();
    const results = serpData?.shopping_results || [];

    // =========================
    // 4. SAFE HELPERS
    // =========================
    const cleanUrl = (url) => {
      if (!url) return null;
      try {
        const u = new URL(url);
        return u.toString();
      } catch {
        return null;
      }
    };

    const cleanPrice = (p) =>
      p ? p.toString().replace(/[^\d₹$€,.]/g, "").trim() : "N/A";

    // New helper to fix broken alternative images
    const cleanImage = (url) => {
      if (!url || typeof url !== "string") {
        return "https://via.placeholder.com/300?text=No+Image";
      }
      return url;
    };

    // =========================
    // 5. FILTER RESULTS
    // =========================
    // Improved logic: Checks if the title contains the main words, rather than just the first word.
    let filtered = results.filter((item) => {
      const title = item.title?.toLowerCase() || "";
      const searchWords = productName.toLowerCase().split(" ").filter(w => w.length > 2);
      
      // If there are words, ensure at least one strong word matches, otherwise keep it.
      if (searchWords.length === 0) return true;
      return searchWords.some(word => title.includes(word));
    });

    // Fallback if the filter accidentally removes everything
    if (filtered.length === 0) {
      filtered = results;
    }

    const first = filtered.find((r) => r.price) || filtered[0] || results[0];

    // Handle edge case where no results are found at all
    if (!first) {
      return res.status(404).json({ error: "Product search returned no results" });
    }

    // =========================
    // 6. BUILD RESPONSE
    // =========================
    return res.status(200).json({
      product_name: first?.title || productName,
      description: first?.snippet || "Detected by ShopLens AI",

      price: cleanPrice(first?.price),

      // Use the cleanImage helper
      image: cleanImage(first?.thumbnail || results.find((r) => r.thumbnail)?.thumbnail),

      // Swapped priority: 'link' (direct store) is often more reliable than 'product_link' (Google redirect)
      buy_url: cleanUrl(first?.link) || cleanUrl(first?.product_link) || null,

      store: first?.source || "Unknown",
      rating: first?.rating || "N/A",
      reviews: first?.reviews || "N/A",

      confidence: parsed.confidence || 70,
      safety_score: 98,
      match_score: first?.price ? 95 : 80,

      // Apply safe helpers to alternatives to fix broken links and images
      alternatives: filtered
        .filter(item => item !== first) // Don't include the main product in alternatives
        .slice(0, 5)
        .map((item) => ({
          title: item.title,
          price: cleanPrice(item.price),
          image: cleanImage(item.thumbnail),
          link: cleanUrl(item.link) || cleanUrl(item.product_link) || null,
        })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
