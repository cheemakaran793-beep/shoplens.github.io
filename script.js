window.onload = function() {
    const trigger = document.getElementById('scanTrigger');
    const picker = document.getElementById('filePicker');

    if (!trigger) {
        alert("Error: scanTrigger not found in HTML!");
    } else if (!picker) {
        alert("Error: filePicker not found in HTML!");
    } else {
        trigger.addEventListener('click', function() {
            picker.click();
        });
    }
};

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

      alert("Analyzing... (Wait 5-10 seconds)");

      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = async () => {
        try {
          // Add a timeout to the fetch
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);

          const response = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: reader.result }),
            signal: controller.signal
          });

          clearTimeout(timeout);

          const data = await response.json();
          alert("Success: " + data.product_name);
        } catch (err) {
          if (err.name === 'AbortError') {
            alert("Error: The server took too long to respond. Check Vercel logs.");
          } else {
            alert("Error: " + err.message);
          }
        }
      };
    });
  }
// PUT THIS AT THE VERY BOTTOM OF YOUR SCRIPT.JS
const trigger = document.getElementById('scanTrigger');
const picker = document.getElementById('filePicker');

if (trigger) {
    trigger.onclick = function() {
        console.log("Button clicked!"); // Check this in your browser console
        picker.click();
    };
} else {
    console.log("Could not find scanTrigger button!");
}
