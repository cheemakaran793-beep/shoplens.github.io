// ===========================================
// 1. Theme and Animation Logic (Original)
// ===========================================
const initTheme = () => {
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    const themeBtn = document.querySelector('.theme-btn');
    if (themeBtn) {
        themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        themeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isDark = html.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        });
    }
};

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

// ===========================================
// 2. Scan Logic (The "iPhone Reliable" Way)
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();

    const trigger = document.getElementById('scanTrigger');
    const picker = document.getElementById('filePicker');

    if (trigger && picker) {
        // Use mousedown/touchstart for faster response on iPhone
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            picker.click();
        });

                picker.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // 1. Alert user it's processing
            alert("Analyzing your product... (Please wait)");

            // 2. Shrink the image to max 800px wide
            const img = new Image();
            img.src = URL.createObjectURL(file);
            
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                const scale = Math.min(800 / img.width, 800 / img.height);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Convert to JPEG with medium quality to ensure it's < 1MB
                const smallData = canvas.toDataURL('image/jpeg', 0.6);

                try {
                    const response = await fetch('/api/scan', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: smallData })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        alert("Found: " + data.product_name + "\nPrice: " + data.price);
                    } else {
                        alert("Scan Failed: " + (data.error || "Server error"));
                    }
                } catch (err) {
                    alert("Network Error: " + err.message);
                }
            };
        });
