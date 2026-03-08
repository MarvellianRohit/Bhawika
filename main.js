document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-gift-btn');
    const backBtn = document.getElementById('back-btn');
    const landingView = document.getElementById('landing-page');
    const giftView = document.getElementById('gift-view');

    openBtn.addEventListener('click', () => {
        landingView.classList.remove('active');
        giftView.classList.add('active');
        startPortraitAnimation();
        launchConfetti();
    });

    backBtn.addEventListener('click', () => {
        giftView.classList.remove('active');
        landingView.classList.add('active');
        resetAnimation();
    });

    let animationId = null;

    function resetAnimation() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        const canvas = document.getElementById('portrait-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        const butterfly = document.getElementById('butterfly-cursor');
        if (butterfly) {
            butterfly.classList.remove('active');
            butterfly.style.opacity = '0';
        }
    }

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            // Use crossOrigin for images on GitHub Pages
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = (e) => {
                console.error('Failed to load image:', src, e);
                reject(new Error('Image load failed: ' + src));
            };
            img.src = src;
        });
    }

    // Get the base URL so paths work on GitHub Pages subdirectory and locally
    const BASE = (function () {
        const scripts = document.querySelectorAll('script[src]');
        for (const s of scripts) {
            if (s.src.includes('main.js')) {
                return s.src.replace('main.js', '');
            }
        }
        return './';
    })();

    async function startPortraitAnimation() {
        const canvas = document.getElementById('portrait-canvas');
        const ctx = canvas.getContext('2d');
        const butterfly = document.getElementById('butterfly-cursor');

        canvas.width = 600;
        canvas.height = 800;

        const assetBase = BASE + 'assets/';
        console.log('Loading assets from:', assetBase);

        try {
            const [sereneImg, smilingImg, finalImg] = await Promise.all([
                loadImage(assetBase + 'bhawika_serene.png'),
                loadImage(assetBase + 'bhawika_smiling.png'),
                loadImage(assetBase + 'bhawika.jpg'),
            ]);
            console.log('All assets loaded!');

            // Show butterfly
            butterfly.style.display = 'block';
            butterfly.style.opacity = '1';

            const startTime = performance.now();
            const duration = 10000;

            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (progress <= 0.4) {
                    // Phase 1: Butterfly draws the smiling portrait (0-4s)
                    const p = progress / 0.4;
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(0, 0, canvas.width, p * canvas.height);
                    ctx.clip();
                    ctx.drawImage(smilingImg, 0, 0, canvas.width, canvas.height);
                    ctx.restore();
                    updateButterflyDrawing(butterfly, p, canvas);
                } else if (progress <= 0.5) {
                    // Phase 2: Flourish (4-5s)
                    ctx.drawImage(smilingImg, 0, 0, canvas.width, canvas.height);
                    const p = (progress - 0.4) / 0.1;
                    updateButterflyFlourish(butterfly, p, canvas);
                } else {
                    // Phase 3: Watercolor bloom into final photo (5-10s)
                    const p = (progress - 0.5) / 0.5;
                    ctx.save();
                    ctx.globalAlpha = 1 - p;
                    ctx.drawImage(smilingImg, 0, 0, canvas.width, canvas.height);
                    ctx.globalAlpha = p;
                    ctx.drawImage(finalImg, 0, 0, canvas.width, canvas.height);
                    ctx.restore();
                    butterfly.style.opacity = '0';
                }

                if (progress < 1) {
                    animationId = requestAnimationFrame(animate);
                } else {
                    ctx.globalAlpha = 1;
                    ctx.drawImage(finalImg, 0, 0, canvas.width, canvas.height);
                }
            }

            animationId = requestAnimationFrame(animate);

        } catch (err) {
            console.error('Animation failed:', err);
            // Fallback: draw final image directly
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            img.src = BASE + 'assets/bhawika.jpg';
        }
    }

    function updateButterflyDrawing(butterfly, progress, canvas) {
        const wrapper = canvas.parentElement;
        const rect = wrapper.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        const x = (0.5 + Math.sin(progress * Math.PI * 16) * 0.38) * w;
        const y = progress * h;

        butterfly.style.left = x + 'px';
        butterfly.style.top = y + 'px';
        butterfly.style.transform = 'translate(-50%, -50%) rotate(' + (Math.cos(progress * Math.PI * 16) * 20) + 'deg)';
        butterfly.style.opacity = '1';
    }

    function updateButterflyFlourish(butterfly, progress, canvas) {
        const wrapper = canvas.parentElement;
        const rect = wrapper.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        const x = cx + Math.cos(progress * Math.PI * 2) * 80;
        const y = cy - 80 + Math.sin(progress * Math.PI * 2) * 40;

        butterfly.style.left = x + 'px';
        butterfly.style.top = y + 'px';
        butterfly.style.transform = 'translate(-50%, -50%)';
        butterfly.style.opacity = String(1 - progress);
    }

    function launchConfetti() {
        const colors = ['#E6E6FA', '#D4AF37', '#F9D976', '#FFD1FF', '#E0C3FC'];
        const end = Date.now() + 5000;

        function tick() {
            if (Date.now() > end) return;
            for (let i = 0; i < 8; i++) {
                const p = document.createElement('div');
                p.style.cssText = `
                    position:fixed;z-index:9999;pointer-events:none;
                    width:${6 + Math.random() * 8}px;height:${6 + Math.random() * 8}px;
                    border-radius:2px;background:${colors[Math.floor(Math.random() * colors.length)]};
                    left:${Math.random() * 100}vw;top:-10px;
                `;
                document.body.appendChild(p);
                const anim = p.animate([
                    { transform: `translate3d(0,0,0) rotate(0deg)`, opacity: 1 },
                    { transform: `translate3d(${Math.random() * 300 - 150}px, 100vh, 0) rotate(${Math.random() * 720}deg)`, opacity: 0 }
                ], { duration: 3000 + Math.random() * 2000, easing: 'ease-in' });
                anim.onfinish = () => p.remove();
            }
            setTimeout(tick, 200);
        }
        tick();
    }
});
