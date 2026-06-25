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
    // STEP 1: VISION MODEL
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
You are a STRICT product detection system.

Return ONLY JSON.

Rules:
- Identify ONLY what is clearly visible
- NEVER guess Pro / Pro Max / Plus
- NEVER assume storage or hidden specs
- If unclear, return base model only

Output format:
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
    let groqData = {};

    try {
      groqData = JSON.parse(groqText);
    } catch {
      return res.status(500).json({
        error: "Invalid vision response",
      });
    }

    const raw =
      groqData.choices?.[0]?.message?.content || "";

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
    // STEP 2: NORMALIZATION FIX
    // =========================
    productName = productName
      .replace(/pro max/gi, "")
      .replace(/plus/gi, "")
      .trim();

    // =========================
    // STEP 3: SERPAPI SEARCH
    // =========================
    const serpRes = await fetch(
      `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(
        productName
      )}&gl=in&hl=en&api_key=${process.env.SERPAPI_KEY}`
    );

    const serpData = await serpRes.json();
    const results = serpData.shopping_results || [];

    // Remove ads + junk
    const cleanResults = results.filter(
      (r) =>
        r.title &&
        r.price &&
        !r.link?.includes("google.com")
    );

    const first =
      cleanResults.find((r) => r.price) ||
      cleanResults[0];

    // =========================
    // HELPERS
    // =========================
    const cleanUrl = (url) => {
      if (!url) return "#";
      try {
        const u = new URL(url);
        if (u.hostname.includes("google")) return "#";
        return u.toString();
      } catch {
        return "#";
      }
    };

    const cleanPrice = (p) =>
      p ? p.replace(/[^\d₹$€,.]/g, "") : "N/A";

    // =========================
    // STEP 4: SMART ALTERNATIVES
    // =========================
    const alternatives = cleanResults
      .slice(0, 5)
      .map((item) => ({
        title: item.title,
        price: cleanPrice(item.price),
        image:
          item.thumbnail ||
          "https://via.placeholder.com/150",
        link: cleanUrl(item.product_link || item.link),
      }));

    // =========================
    // STEP 5: RESPONSE
    // =========================
    return res.status(200).json({
      product_name: first?.title || productName,
      description: first?.snippet || "Detected by ShopLens AI",
      price: cleanPrice(first?.price),
      image:
        first?.thumbnail ||
        cleanResults[0]?.thumbnail ||
        "",
      buy_url: cleanUrl(
        first?.product_link || first?.link
      ),
      store: first?.source || "Unknown",
      rating: first?.rating || "N/A",
      reviews: first?.reviews || "N/A",

      confidence: parsed.confidence || 70,

      safety_score: 98,
      match_score: first?.price ? 95 : 80,

      alternatives,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
