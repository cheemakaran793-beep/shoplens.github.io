// ===============================
// --- Theme Handling (FIXED) ---
// ===============================
const initTheme = () => {
  const html = document.documentElement;
  const savedTheme = localStorage.getItem('theme') || 'light';
  html.setAttribute('data-theme', savedTheme);
  const themeBtn = document.querySelector('.theme-btn');

  if (themeBtn) {
    themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    const toggleTheme = (e) => {
      if (e) e.preventDefault();
      const isDark = html.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
      });
    };
    themeBtn.addEventListener('click', toggleTheme);
    themeBtn.addEventListener('touchstart', toggleTheme, { passive: false });
  }
};

// ===============================
// --- Animations & App Init ---
// ===============================
const initApp = () => {
  initTheme();
  const cards = document.querySelectorAll('.feat, .result-card, .trend-card, .about-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach((card) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// ===============================
// --- NEW SCAN SYSTEM ---
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  const scanTrigger = document.getElementById('scanTrigger');
  const filePicker = document.getElementById('filePicker');

  // 1. Only open picker, do NOT redirect
  if (scanTrigger) {
    scanTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      filePicker.click();
    });
  }

  // 2. Process image when file is selected
  if (filePicker) {
    filePicker.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      alert("Analyzing your product...");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = async () => {
        try {
          const response = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: reader.result })
          });
          const data = await response.json();
          alert("Found: " + data.product_name + "\nPrice: " + data.price);
        } catch (err) {
          alert("Scan failed. Please check your internet connection.");
        }
      };
    });
  }
});
