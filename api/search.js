export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const { query } = req.body;

  if (!query || query.trim() === "") {
    return res.status(400).json({
      error: "Please enter a search query."
    });
  }

  const SERPAPI_KEY = process.env.SERPAPI_KEY;

  if (!SERPAPI_KEY) {
    return res.status(500).json({
      error: "SERPAPI_KEY is missing."
    });
  }

  try {

    const url =
      `https://serpapi.com/search.json?engine=google_shopping` +
      `&q=${encodeURIComponent(query)}` +
      `&gl=in` +
      `&hl=en` +
      `&location=India` +
      `&google_domain=google.co.in` +
      `&num=10` +
      `&api_key=${SERPAPI_KEY}`;

    const response = await fetch(url);

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || "SerpAPI request failed."
      });
    }

    if (data.error) {
      return res.status(500).json({
        error: data.error
      });
    }

    const allowedStores = [
      "Amazon",
      "Flipkart",
      "Myntra",
      "Ajio",
      "Nykaa",
      "Croma",
      "Reliance Digital",
      "Vijay Sales",
      "Tata CLiQ"
    ];

    const results = (data.shopping_results || [])
      .filter(item => {

        if (!item.source) return true;

        return allowedStores.some(store =>
          item.source.toLowerCase().includes(store.toLowerCase())
        );

      })
      .slice(0, 6)
      .map(item => ({

        name: item.title || "Unknown Product",

        description:
          item.snippet ||
          `${item.source || "Verified Seller"} • ${item.price || "See Store"}`,

        price: item.price || "Price unavailable",

        rating: item.rating || "N/A",

        reviews: item.reviews || "N/A",

        image: item.thumbnail || "",

        status: "SAFE",

        store: item.source || "Online Store",

        url:
          `https://www.google.com/search?q=` +
          encodeURIComponent(item.title + " " + (item.source || "")) +
          "&btnI=I"

      }));

    return res.status(200).json({

      success: true,

      total: results.length,

      results

    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({

      error: err.message || "Internal Server Error"

    });

  }

}
