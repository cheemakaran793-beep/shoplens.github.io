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

const cta = document.querySelector('.cta-card');
cta?.addEventListener('click', () => {
  alert('📷 AI image upload coming soon!');
});

const navBtn = document.querySelector('.nav-btn');
navBtn?.addEventListener('click', () => {
  cta?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
