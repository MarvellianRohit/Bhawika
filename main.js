document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-gift-btn');
    const backBtn = document.getElementById('back-btn');
    const landingView = document.getElementById('landing-page');
    const giftView = document.getElementById('gift-view');

    openBtn.addEventListener('click', () => {
        landingView.classList.remove('active');
        giftView.classList.add('active');

        // Start the portrait animation
        startPortraitAnimation();

        // Add some fun effects when gift is opened
        launchConfetti();
    });

    backBtn.addEventListener('click', () => {
        giftView.classList.remove('active');
        landingView.classList.add('active');
        resetAnimation();
    });

    let animationId = null;

    function resetAnimation() {
        if (animationId) cancelAnimationFrame(animationId);
        const canvas = document.getElementById('portrait-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        const butterfly = document.getElementById('butterfly-cursor');
        if (butterfly) butterfly.classList.remove('active');
    }

    async function startPortraitAnimation() {
        const canvas = document.getElementById('portrait-canvas');
        const ctx = canvas.getContext('2d');
        const butterfly = document.getElementById('butterfly-cursor');

        // Set canvas resolution for crispness
        canvas.width = 600;
        canvas.height = 800;

        // Load images
        console.log('Loading animation assets...');
        try {
            const sereneImg = await loadImage('./assets/bhawika_serene.png');
            const smilingImg = await loadImage('./assets/bhawika_smiling.png');
            const finalImg = await loadImage('./assets/bhawika.jpg');
            console.log('Assets loaded successfully.');

            butterfly.classList.add('active');

            const startTime = performance.now();
            const duration = 10000; // 10 seconds

            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Phase 1: Sketching (0-4s) - The "Drawing" Phase
                // Now drawing the bhawika_smiling.png image specifically
                if (progress <= 0.4) {
                    const sketchProgress = progress / 0.4;

                    // Draw revealed part of the smiling portrait
                    ctx.save();
                    const revealY = sketchProgress * canvas.height;
                    ctx.beginPath();
                    ctx.rect(0, 0, canvas.width, revealY);
                    ctx.clip();
                    ctx.drawImage(smilingImg, 0, 0, canvas.width, canvas.height);
                    ctx.restore();

                    updateButterflyDrawing(butterfly, sketchProgress, canvas);
                }
                // Phase 2: Flourish & Transition Start (4-5s)
                else if (progress <= 0.5) {
                    ctx.drawImage(smilingImg, 0, 0, canvas.width, canvas.height);
                    const flourishProgress = (progress - 0.4) / 0.1;
                    updateButterflyFlourish(butterfly, flourishProgress, canvas);
                }
                // Phase 3: Watercolor Bloom & Final Image (5-10s)
                else {
                    const bloomProgress = (progress - 0.5) / 0.5;
                    // Transition from the peach shirt smile to the final night photo
                    drawWatercolorBloom(ctx, smilingImg, finalImg, bloomProgress);
                    butterfly.classList.remove('active');
                }

                if (progress < 1) {
                    animationId = requestAnimationFrame(animate);
                } else {
                    ctx.drawImage(finalImg, 0, 0, canvas.width, canvas.height);
                }
            }

            animationId = requestAnimationFrame(animate);
        } catch (error) {
            console.error('Failed to load animation assets:', error);
            // Fallback: just show the main picture if something fails
            const fallbackImg = new Image();
            fallbackImg.src = '/assets/bhawika.jpg';
            fallbackImg.onload = () => ctx.drawImage(fallbackImg, 0, 0, canvas.width, canvas.height);
        }
    }

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                reject(new Error(`Image load failed: ${src}`));
            };
        });
    }

    function updateButterflyDrawing(butterfly, progress, canvas) {
        const rect = canvas.parentElement.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Butterfly moves in a zig-zag/drawing pattern across the current "line"
        const x = (0.5 + Math.sin(progress * Math.PI * 20) * 0.4) * width;
        const y = progress * height;

        butterfly.style.left = `${x}px`;
        butterfly.style.top = `${y}px`;

        // Tilt butterfly based on movement direction
        const tilt = Math.cos(progress * Math.PI * 20) * 15;
        butterfly.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;
    }

    function updateButterflyFlourish(butterfly, progress, canvas) {
        const rect = canvas.parentElement.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // A graceful circular flourish at the end
        const x = centerX + Math.cos(progress * Math.PI * 2) * 80;
        const y = centerY - 100 + Math.sin(progress * Math.PI * 2) * 30;

        butterfly.style.left = `${x}px`;
        butterfly.style.top = `${y}px`;
        butterfly.style.opacity = 1 - progress;
    }

    function drawWatercolorBloom(ctx, serene, smiling, progress) {
        ctx.save();

        // Draw Serene base with fading
        ctx.globalAlpha = 1 - progress;
        ctx.drawImage(serene, 0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw Smiling with blooming alpha and scale effect
        ctx.globalAlpha = progress;
        // Mocking a "bloom" by using a radial gradient as a mask or just alpha
        ctx.drawImage(smiling, 0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.restore();
    }

    function launchConfetti() {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since we don't have a library, we'll simulate it with simple particles
            createParticles(particleCount);
        }, 250);
    }

    function createParticles(count) {
        const colors = ['#E6E6FA', '#D4AF37', '#F9D976', '#B8860B'];
        const container = document.body;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            // Ensure particles are fixed and high z-index
            Object.assign(particle.style, {
                position: 'fixed',
                zIndex: '9999',
                pointerEvents: 'none',
                background: colors[Math.floor(Math.random() * colors.length)],
                left: Math.random() * 100 + 'vw',
                top: '-10px',
                borderRadius: '2px'
            });

            const size = Math.random() * 8 + 6 + 'px';
            particle.style.width = size;
            particle.style.height = size;

            container.appendChild(particle);

            const travelX = Math.random() * 400 - 200;
            const animation = particle.animate([
                { transform: `translate3d(0, 0, 0) rotate(0deg)`, opacity: 1 },
                { transform: `translate3d(${travelX}px, 100vh, 0) rotate(${Math.random() * 1080}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 2500 + 2500,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });

            animation.onfinish = () => particle.remove();
        }
    }
});
