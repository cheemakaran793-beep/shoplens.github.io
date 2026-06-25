// ===========================================
// 1. Theme and Animation Logic (ORIGINAL - UNCHANGED)
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

// ===========================================
// 2. Animation Init (ORIGINAL - UNCHANGED)
// ===========================================
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
// 3. SCAN SYSTEM (FIXED - iPHONE + VERCEL SAFE)
// ===========================================
document.addEventListener('DOMContentLoaded', () => {

    initApp();
    const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("mobileDrawer");
const overlay = document.getElementById("drawerOverlay");
const closeBtn = document.getElementById("closeDrawer");

function closeDrawer(){
    drawer?.classList.remove("open");
    overlay?.classList.remove("show");
}

menuBtn?.addEventListener("click", () => {
    drawer?.classList.add("open");
    overlay?.classList.add("show");
});

closeBtn?.addEventListener("click", closeDrawer);
overlay?.addEventListener("click", closeDrawer);

    const trigger = document.getElementById('scanTrigger');
    const picker = document.getElementById('filePicker');

    if (!trigger || !picker) {
        console.log("Scan elements not found");
        return;
    }

    // OPEN FILE PICKER (SAFE FOR iPHONE)
    const openPicker = (e) => {
        if (e) e.preventDefault();
        picker.click();
    };

trigger.addEventListener('click', () => {
    picker.click();
});
    // FILE SELECT HANDLER
    picker.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // safety check
        if (file.size > 4000000) {
            alert("File too large. Please upload smaller image.");
            return;
        }

        // LOADING UI (NO ALERT FREEZE)
        const loader = document.createElement("div");
        loader.id = "scanLoader";
        loader.innerHTML = `
<div class="scan-loader-box">
    <div class="scan-orb"></div>

    <h3>ShopLens AI</h3>

    <p>Analyzing product...</p>

    <div class="scan-steps">
      <span>✓ Upload received</span>
      <span id="step2">⏳ Identifying item</span>
      <span id="step3">⏳ Checking stores</span>
      <span id="step4">⏳ Comparing prices</span>
    </div>
</div>
`;
        loader.style.cssText = `
            position:fixed;
            top:50%;
            left:50%;
            transform:translate(-50%,-50%);
            background:#111;
            color:#fff;
            padding:15px 25px;
            border-radius:10px;
            z-index:999999;
            font-size:14px;
        `;
        document.body.appendChild(loader);

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = async () => {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 30000);

                const response = await fetch('/api/scan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ image: reader.result }),
                    signal: controller.signal
                });

                clearTimeout(timeout);

                const data = await response.json();

                document.getElementById("scanLoader")?.remove();

             if (response.ok) {

    const resultBox = document.getElementById("scanResultContainer");

    resultBox.innerHTML = `
    <div class="scan-result-card">

        <img src="${data.image}" class="scan-product-image">

        <div class="scan-product-info">

            <h3>${data.product_name}</h3>

            <p>Product identified by ShopLens AI</p>

            <div class="scan-badges">
                <span>💰 ${data.price || "N/A"}</span>
                <span>🛡 Trusted</span>
                <span>🔥 Trending</span>
            </div>

            <a href="${data.buy_url}" target="_blank" class="visit-store-btn">
                Visit Store →
            </a>

        </div>

    </div>
    `;

} else {
    alert("Error: " + (data.error || "Scan failed"));
}
            } catch (err) {
                document.getElementById("scanLoader")?.remove();
                alert("Scan failed or timed out. Try again.");
            }
        };
    });
});
