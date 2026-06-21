const cards = document.querySelectorAll('.feature-card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, i * 120);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

cards.forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(30px)';
  card.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  observer.observe(card);
});

const ctaCard = document.querySelector('.cta-card');
ctaCard?.addEventListener('click', () => {
  alert('📷 Image upload coming soon!');
});

const navBtn = document.querySelector('.nav-btn');
navBtn?.addEventListener('click', () => {
  ctaCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
