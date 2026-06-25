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

document.getElementById("scanResultContainer").innerHTML = "";

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
<div class="premium-loader">

<div class="loader-header">
✨ ShopLens AI Scanner
</div>

<div class="progress-row done">
<div class="circle">✓</div>
<span>Image Uploaded</span>
</div>

<div class="progress-row active">
<div class="circle">⚡</div>
<span>Identifying Product</span>
</div>

<div class="progress-row">
<div class="circle">🔍</div>
<span>Finding Best Deals</span>
</div>

<div class="progress-row">
<div class="circle">🛡</div>
<span>Safety Verification</span>
</div>

<div class="loader-bar">
<div class="loader-fill"></div>
</div>

<p class="loader-text">
Analyzing your product...
</p>

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
<div class="premium-result">

<div class="product-left">
<img src="${data.image}">
</div>

<div class="product-right">

<div class="match-badge">
${data.match_score}% Match
</div>

<h2>${data.product_name}</h2>

<p>${data.description}</p>

<div class="stats-grid">

<div class="stat">
<span>💰 Price</span>
<h3>${data.price}</h3>
</div>

<div class="stat">
<span>🛡 Safety</span>
<h3>${data.safety_score}%</h3>
</div>

<div class="stat">
<span>⭐ Rating</span>
<h3>${data.rating}</h3>
</div>

<div class="stat">
<span>🔥 Trend</span>
<h3>${data.sales_trend}</h3>
</div>

</div>

<a href="${data.buy_url}"
target="_blank"
class="store-btn">
Visit Store →
</a>

<div id="alternativeProducts"></div>

</div>
</div>
`;
 const alternativesHtml =
(data.alternatives || [])
.map(item => `
<a
href="${item.product_link || item.link || '#'}"
target="_blank"
class="alt-card">

<img src="${item.thumbnail || ''}">

<h4>${item.title || 'Product'}</h4>

<p>${item.price || "N/A"}</p>

</a>
`).join("");

resultBox.innerHTML += `
<h3 class="alt-title">
Similar Products
</h3>

<div class="alt-grid">
${alternativesHtml}
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
