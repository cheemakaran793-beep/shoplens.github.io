function toggleTheme() {
  const html = document.documentElement;
  const btn = document.querySelector('.theme-btn');
  if (html.getAttribute('data-theme') === 'light') {
    html.setAttribute('data-theme', 'dark');
    if (btn) btn.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  } else {
    html.setAttribute('data-theme', 'light');
    if (btn) btn.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  }
}

const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
const themeBtn = document.querySelector('.theme-btn');
if (themeBtn) themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

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

cards.forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(24px)';
  card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(card);
});

const cta = document.querySelector('.cta-card');
if (cta) cta.addEventListener('click', () => window.location.href = 'search.html');
const navBtn = document.querySelector('.nav-btn');
if (navBtn) navBtn.addEventListener('click', () => window.location.href = 'search.html');
