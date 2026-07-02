export default async function handler(req, res) {
if (req.method !== "GET" && req.method !== "POST") {
return res.status(405).json({
error: "Method not allowed"
});
}

const SERPAPI_KEY = process.env.SERPAPI_KEY;

if (!SERPAPI_KEY) {
return res.status(500).json({
error: "SERPAPI_KEY is missing"
});
}

const categories = [
{
title: "Clothing",
query: "trending clothing india"
},
{
title: "Shoes",
query: "trending shoes india"
},
{
title: "Beauty Products",
query: "trending beauty products india"
},
{
title: "Accessories",
query: "trending accessories india"
},
{
title: "Gadgets",
query: "trending gadgets india"
}
];

try {
const results = [];

```
for (const category of categories) {
  try {
    const url =
      `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(
        category.query
      )}&gl=in&hl=en&num=10&api_key=${SERPAPI_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error(
        `SerpAPI Error (${category.title})`,
        data
      );

      results.push({
        title: category.title,
        products: []
      });

      continue;
    }

    const products = (data.shopping_results || [])
      .filter(item => item && item.title)
      .slice(0, 8)
      .map(item => ({
        name: item.title || "Unknown Product",

        price:
          item.price ||
          item.extracted_price ||
          "Price unavailable",

        image:
          item.thumbnail ||
          item.image ||
          "https://via.placeholder.com/500?text=No+Image",

        source:
          item.source ||
          item.seller ||
          "Online Store",

        link:
          item.link ||
          item.product_link ||
          "#",

        rating:
          item.rating ||
          "4.5",

        reviews:
          item.reviews ||
          100,

        trending_score:
          Math.floor(Math.random() * 20) + 80,

        discount:
          Math.floor(Math.random() * 50) + 10,

        badge:
          ["🔥 Hot", "🚀 Rising", "👑 Bestseller"][
            Math.floor(Math.random() * 3)
          ]
      }));

    results.push({
      title: category.title,
      products
    });

  } catch (categoryError) {
    console.error(
      `Category Error (${category.title})`,
      categoryError
    );

    results.push({
      title: category.title,
      products: []
    });
  }
}

return res.status(200).json({
  success: true,
  updated_at: new Date().toISOString(),
  total_categories: results.length,
  categories: results
});
```

} catch (error) {
console.error(
"Trending API Error:",
error
);

```
return res.status(500).json({
  success: false,
  error:
    error.message ||
    "Internal Server Error"
});


}
}
