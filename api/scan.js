export default async function handler(req, res) {
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
- Identify ONLY what is visible
- NEVER assume Pro / Pro Max / Plus
- NEVER guess hidden specs
- If uncertain → choose base model

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

    const raw =
      groqData?.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
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

    const first =
      results.find((r) => r.price) || results[0];

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
      p ? p.replace(/[^\d₹$€,.]/g, "").trim() : "N/A";

    // =========================
    // 5. FILTER RESULTS
    // =========================
    const filtered = results.filter((item) =>
      item.title?.toLowerCase().includes(
        productName.toLowerCase().split(" ")[0]
      )
    );

    // =========================
    // 6. BUILD RESPONSE
    // =========================
    return res.status(200).json({
      product_name: first?.title || productName,
      description: first?.snippet || "Detected by ShopLens AI",

      price: cleanPrice(first?.price),

      image:
        first?.thumbnail ||
        results.find((r) => r.thumbnail)?.thumbnail ||
        "",

      buy_url:
        cleanUrl(first?.product_link) ||
        cleanUrl(first?.link) ||
        null,

      store: first?.source || "Unknown",
      rating: first?.rating || "N/A",
      reviews: first?.reviews || "N/A",

      confidence: parsed.confidence || 70,
      safety_score: 98,
      match_score: first?.price ? 95 : 80,

      alternatives: filtered.slice(0, 5).map((item) => ({
        title: item.title,
        price: cleanPrice(item.price),
        image:
          item.thumbnail ||
          "https://via.placeholder.com/150",
        link:
          cleanUrl(item.product_link) ||
          cleanUrl(item.link) ||
          null,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
