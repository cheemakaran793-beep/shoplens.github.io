// ===============================
// 🔥 SHOPLENS CORE NAV SYSTEM
// ===============================

function showPage(pageId) {
  const pages = document.querySelectorAll(".page");

  pages.forEach(page => {
    page.style.display = "none";
  });

  const target = document.getElementById(pageId);
  if (target) {
    target.style.display = "block";
  }
}

// ===============================
// 🤖 AI SEARCH SYSTEM
// ===============================

function searchAI() {
  let input = document.getElementById("searchBox");
  let out = document.getElementById("results");

  if (!input || !out) return;

  let q = input.value.toLowerCase();

  if (q.includes("shoes")) {
    out.innerHTML = `
      <div class="card">
        👟 Nike Running Shoes<br>
        💰 ₹1499<br>
        ⭐ Quality: High<br>
        📦 Stock: Available<br>
        🧠 Best for gym & daily wear
      </div>
    `;
  } 
  else if (q.includes("outfit")) {
    out.innerHTML = `
      <div class="card">
        👕 Streetwear Outfit<br>
        Hoodie + Jeans + Sneakers<br>
        💰 ₹2499 estimated<br>
        ⭐ Trending style
      </div>
    `;
  } 
  else {
    out.innerHTML = `
      <div class="card">
        Try searching:<br>
        • shoes<br>
        • outfit<br>
        • gym wear<br>
        • streetwear
      </div>
    `;
  }
}

// ===============================
// ✨ YOUR ORIGINAL FEATURE ANIMATION
// ===============================

// Scroll reveal for feature cards
const cards = document.querySelectorAll('.feat');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, i * 130);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

cards.forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(28px)';
  card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(card);
});

// ===============================
// 📷 CTA CLICK (SAFE VERSION)
// ===============================

const cta = document.querySelector('.cta-card');

cta?.addEventListener('click', () => {
  alert('📷 AI image upload coming soon!');
});

// ===============================
// 📌 NAV BUTTON SCROLL (SAFE)
// ===============================

const navBtn = document.querySelector('.nav-btn');

navBtn?.addEventListener('click', () => {
  cta?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
