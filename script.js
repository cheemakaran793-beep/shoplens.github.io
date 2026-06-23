// ===============================
// --- Theme Handling (FIXED) ---
// ===============================
const initTheme = () => {
  const html = document.documentElement;

  // Apply saved theme
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

  const cards = document.querySelectorAll(
    '.feat, .result-card, .trend-card, .about-card'
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, i * 100);

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  cards.forEach((card) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });

  const cta = document.querySelector('.cta-card');
  if (cta) cta.addEventListener('click', () => (window.location.href = 'search.html'));

  const navBtn = document.querySelector('.nav-btn');
  if (navBtn) navBtn.addEventListener('click', () => (window.location.href = 'search.html'));
};

// Safe load (prevents page-specific bugs)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
document.addEventListener('DOMContentLoaded', () => {
    const getStartedBtn = document.getElementById('getStartedBtn'); // Make sure this ID matches your HTML
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    getStartedBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onloadend = async () => {
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: reader.result })
            });
            const data = await response.json();
            // Trigger your iOS-style overlay modal here with the 'data'
            showModal(data); 
        };
        reader.readAsDataURL(file);
    });
});
