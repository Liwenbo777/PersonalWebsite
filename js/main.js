document.addEventListener('DOMContentLoaded', () => {
    // ========== 把原来的所有代码原封不动放到这里 ==========
    
    const DESIGN = { /* ... 保持原样 ... */ };
    const CONFIG = { /* ... 上面改过的数值 ... */ };
    // ... 其余所有代码不动，包括 class、function、animate() 等 ...
    
    animate();
});
        const DESIGN = {
            width: 2160,
            activeHeight: 1250,
            bottomHeight: 200,
            height: 1450,
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        };

        const CONFIG = {
            planeFollowStrength: 0.35,
            activeSmoothing: 0.08,
            returnSmoothing: 0.05,

            outside: {
                baseSpeed: 10,
                tileSize: 1024,
                lineCount: 20,
                smearCount: 20,
                hairCount: 15
            },
            inside: {
                baseSpeed: 30,
                tileSize: 1024,
                lineCount: 40,
                smearCount: 50,
                hairCount: 40
            },

            bgZoom: {
                idle: 1.2,
                active: 1.0,
                duration: 0.8
            }
        };

        // 向右上角飞行配置
        const FLIGHT = {
            dirX: 0.707,
            dirY: -0.707,
            depthAmp: 50,
            depthFreq: 0.025
        };

        const CLOUD_CONFIGS = [
            { src: 'assets/cloud1.png', width: 260, height: 242, scaleRange: [0.6, 1.0] },
            { src: 'assets/cloud2.png', width: 276, height: 239, scaleRange: [0.6, 1.0] },
            { src: 'assets/cloud3.png', width: 439, height: 239, scaleRange: [0.5, 0.9] }
        ];

        const CLOUD_PATHS = [
            { startX: 0.45, startY: 0, direction: 135, speed: 24, delay: -20 },
            { startX: 0.65, startY: 0, direction: 135, speed: 24, delay: 0 },
            { startX: 0.75, startY: 0, direction: 135, speed: 24, delay: 30 }
        ];

        function createTexture(params) {
            const { tileSize, lineCount, smearCount, hairCount } = params;
            const canvas = document.createElement('canvas');
            canvas.width = tileSize;
            canvas.height = tileSize;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, tileSize, tileSize);

            const colors = [
                'rgba(255, 255, 255, 0.95)',
                'rgba(255, 255, 255, 0.70)',
                'rgba(255, 255, 255, 0.40)',
                'rgba(255, 245, 190, 0.90)',
                'rgba(255, 235, 160, 0.75)',
                'rgba(255, 250, 220, 0.55)',
                'rgba(255, 230, 150, 0.45)',
            ];

            for (let i = 0; i < lineCount; i++) {
                let x = Math.random() * tileSize;
                let y = Math.random() * tileSize;
                const baseAngle = Math.PI * 0.8;
                const angle = baseAngle + (Math.random() - 0.5) * 0.15;
                const len = 60 + Math.random() * 400;
                const maxThick = 2 + Math.random() * 8;
                const taperType = Math.random();

                for (let ox of [-tileSize, 0, tileSize]) {
                    for (let oy of [-tileSize, 0, tileSize]) {
                        const sx = x + ox, sy = y + oy;
                        const ex = sx + Math.cos(angle) * len;
                        const ey = sy + Math.sin(angle) * len;
                        const cpX = (sx + ex) / 2 + (Math.random() - 0.5) * 25;
                        const cpY = (sy + ey) / 2 + (Math.random() - 0.5) * 25;
                        const steps = Math.floor(len / 3);
                        const color = colors[Math.floor(Math.random() * colors.length)];

                        for (let t = 0; t <= 1; t += 1 / steps) {
                            const mt = 1 - t;
                            const px = mt * mt * sx + 2 * mt * t * cpX + t * t * ex;
                            const py = mt * mt * sy + 2 * mt * t * cpY + t * t * ey;
                            let radius;
                            if (taperType < 0.4) {
                                radius = maxThick * 0.5 * Math.sin(t * Math.PI);
                            } else if (taperType < 0.7) {
                                radius = maxThick * (1 - t) * (1 - t);
                            } else {
                                radius = maxThick * (0.6 + 0.4 * Math.sin(t * Math.PI * 2));
                            }
                            if (radius < 0.3) continue;
                            ctx.beginPath();
                            ctx.arc(px, py, radius, 0, Math.PI * 2);
                            ctx.fillStyle = color;
                            ctx.globalAlpha = 0.4 + (1 - Math.abs(t - 0.5)) * 0.5;
                            ctx.fill();
                        }
                    }
                }
            }

            for (let i = 0; i < smearCount; i++) {
                let x = Math.random() * tileSize;
                let y = Math.random() * tileSize;
                const angle = Math.PI * 0.8 + (Math.random() - 0.5) * 0.2;
                const len = 40 + Math.random() * 120;
                const width = 3 + Math.random() * 12;
                for (let ox of [-tileSize, 0, tileSize]) {
                    for (let oy of [-tileSize, 0, tileSize]) {
                        const sx = x + ox, sy = y + oy;
                        const ex = sx + Math.cos(angle) * len;
                        const ey = sy + Math.sin(angle) * len;
                        ctx.save();
                        ctx.translate((sx + ex) / 2, (sy + ey) / 2);
                        ctx.rotate(angle);
                        ctx.beginPath();
                        ctx.ellipse(0, 0, len / 2, width / 2, 0, 0, Math.PI * 2);
                        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                        ctx.globalAlpha = 0.15 + Math.random() * 0.25;
                        ctx.fill();
                        ctx.restore();
                    }
                }
            }

            for (let i = 0; i < hairCount; i++) {
                let x = Math.random() * tileSize;
                let y = Math.random() * tileSize;
                const angle = Math.PI * 0.8 + (Math.random() - 0.5) * 0.1;
                const len = 80 + Math.random() * 250;
                for (let ox of [-tileSize, 0, tileSize]) {
                    for (let oy of [-tileSize, 0, tileSize]) {
                        ctx.beginPath();
                        const sx = x + ox, sy = y + oy;
                        ctx.moveTo(sx, sy);
                        ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
                        ctx.lineWidth = 0.4 + Math.random() * 0.8;
                        ctx.lineCap = 'round';
                        ctx.stroke();
                    }
                }
            }

            return canvas.toDataURL();
        }

        class CloudSystem {
            constructor(configs, paths) {
                this.configs = configs;
                this.paths = paths;
                this.els = [
                    document.getElementById('cloud-0'),
                    document.getElementById('cloud-1'),
                    document.getElementById('cloud-2')
                ];
                this.layer = document.getElementById('clouds-layer');

                this.clouds = this.els.map((el, i) => {
                    const cfg = configs[i];
                    const path = paths[i];
                    el.style.backgroundImage = `url(${cfg.src})`;
                    el.style.width = `${cfg.width}px`;
                    el.style.height = `${cfg.height}px`;
                    return {
                        el: el,
                        cfg: cfg,
                        path: path,
                        x: -9999, y: -9999,
                        scale: 1,
                        active: false,
                        timer: path.delay
                    };
                });
            }

            reset(cloud, zoneWidth, zoneHeight) {
                const p = cloud.path;
                cloud.scale = p.scaleOverride || this.rand(cloud.cfg.scaleRange[0], cloud.cfg.scaleRange[1]);
                cloud.x = p.startX * zoneWidth;
                cloud.y = p.startY * zoneHeight;
                const rad = p.direction * Math.PI / 180;
                cloud.dirX = Math.cos(rad);
                cloud.dirY = Math.sin(rad);
                cloud.speed = p.speed * (1 + (Math.random() - 0.5) * 0.2);
                const zIndex = Math.random() > 0.5 ? 5 : 1;
                cloud.el.style.zIndex = zIndex;
                cloud.el.style.transform = `translate(${cloud.x}px, ${cloud.y}px) scale(${cloud.scale})`;
                cloud.el.style.opacity = '1';
                cloud.active = true;
            }

            update(zoneWidth, zoneHeight) {
                this.clouds.forEach((cloud) => {
                    if (!cloud.active) {
                        cloud.timer--;
                        if (cloud.timer <= 0) {
                            this.reset(cloud, zoneWidth, zoneHeight);
                        }
                        return;
                    }

                    cloud.x += cloud.dirX * cloud.speed;
                    cloud.y += cloud.dirY * cloud.speed;
                    cloud.el.style.transform = `translate(${cloud.x}px, ${cloud.y}px) scale(${cloud.scale})`;

                    const cloudW = cloud.cfg.width * cloud.scale;
                    const cloudH = cloud.cfg.height * cloud.scale;
                    const margin = 100;

                    let isOut = false;
                    if (cloud.dirX < 0 && cloud.x < -cloudW - margin) isOut = true;
                    if (cloud.dirX > 0 && cloud.x > zoneWidth + cloudW + margin) isOut = true;
                    if (cloud.dirY < 0 && cloud.y < -cloudH - margin) isOut = true;
                    if (cloud.dirY > 0 && cloud.y > zoneHeight + cloudH + margin) isOut = true;

                    if (isOut) {
                        cloud.active = false;
                        cloud.timer = 60 + Math.floor(Math.random() * 30);
                        cloud.el.style.opacity = '0';
                    }
                });
            }

            rand(min, max) {
                return min + Math.random() * (max - min);
            }
        }

        const heroWrapper = document.getElementById('hero-wrapper');
        const heroSection = document.getElementById('hero-section');
        const speedLinesLayer = document.getElementById('speed-lines-layer');
        const cloudsLayer = document.getElementById('clouds-layer');
        const planeLayer = document.getElementById('plane-layer');
        const planeBgTop = document.getElementById('plane-bg-top');

        // ========== 飞机配置 ==========
        // smoothing 全部统一为 CONFIG.activeSmoothing (0.08)
        // followStrength 全部统一为 0.35
        // speedPhase 全部统一为 0，确保三机同步同速
        const planes = [
            {
                id: 'main',
                el: document.getElementById('plane-main'),
                subject: document.querySelector('#plane-main .plane-subject'),
                x: 0, y: 0,
                targetX: 0, targetY: 0,
                smoothing: CONFIG.activeSmoothing,   // ← 统一 0.08
                followStrength: 0.35,                // ← 统一
                baseOffsetX: 0, baseOffsetY: 0,
                halfW: 70, halfH: 70,
                sprintAngle: 0,
                spacingPhase: 0,
                speedPhase: 0,                       // ← 统一
                depthPhase: 0
            },
            {
                id: 'left',
                el: document.getElementById('plane-left'),
                subject: document.querySelector('#plane-left .plane-subject'),
                x: 0, y: 0,
                targetX: 0, targetY: 0,
                smoothing: CONFIG.activeSmoothing,   // ← 统一 0.08（原 0.04）
                followStrength: 0.35,                // ← 统一
                baseOffsetX: -100, baseOffsetY: 60,
                halfW: 49, halfH: 30,
                sprintAngle: 0,
                spacingPhase: 0,
                speedPhase: 0,                       // ← 统一（原 1.2）
                depthPhase: 2.094
            },
            {
                id: 'right',
                el: document.getElementById('plane-right'),
                subject: document.querySelector('#plane-right .plane-subject'),
                x: 0, y: 0,
                targetX: 0, targetY: 0,
                smoothing: CONFIG.activeSmoothing,   // ← 统一 0.08（原 0.035）
                followStrength: 0.35,              // ← 统一
                baseOffsetX: 88, baseOffsetY: 60,
                halfW: 42, halfH: 26,
                sprintAngle: 0,
                spacingPhase: 2.0,
                speedPhase: 0,                     // ← 统一（原 2.4）
                depthPhase: 4.189
            }
        ];

        // 初始化运行时偏移
        planes.forEach(p => {
            p.offsetX = p.baseOffsetX;
            p.offsetY = p.baseOffsetY;
        });

        const textureOutside = createTexture(CONFIG.outside);
        const textureInside = createTexture(CONFIG.inside);

        speedLinesLayer.style.backgroundImage = `url(${textureOutside})`;
        speedLinesLayer.style.backgroundSize = `${CONFIG.outside.tileSize * 0.75}px ${CONFIG.outside.tileSize * 0.75}px`;

        const cloudSystem = new CloudSystem(CLOUD_CONFIGS, CLOUD_PATHS);

        let zoneWidth = 0;
        let zoneHeight = 0;

        function updateScale() {
            zoneWidth = heroSection.clientWidth;
            zoneHeight = zoneWidth * (DESIGN.activeHeight / DESIGN.width);

            const layers = [speedLinesLayer, cloudsLayer, planeLayer];
            layers.forEach(layer => {
                layer.style.left = '0px';
                layer.style.top = '0px';
                layer.style.width = `${zoneWidth}px`;
                layer.style.height = `${zoneHeight}px`;
            });
        }

        updateScale();
        window.addEventListener('resize', updateScale);

        let state = {
            isInZone: false,
            wasInZone: false,
            mouseX: 0.5,
            mouseY: 0.5,
            bgPosX: 0,
            bgPosY: 0,
            currentSpeed: CONFIG.outside.baseSpeed,
            sprintAngle: 0
        };

        function getZoneRect() {
            const heroRect = heroSection.getBoundingClientRect();
            const m = DESIGN.margin;
            return {
                left: heroRect.left + m.left,
                top: heroRect.top + m.top,
                right: heroRect.left + m.left + zoneWidth,
                bottom: heroRect.top + m.top + zoneHeight,
                width: zoneWidth,
                height: zoneHeight
            };
        }

        document.addEventListener('mousemove', (e) => {
            const zone = getZoneRect();
            state.isInZone = e.clientX >= zone.left && e.clientX <= zone.right
                        && e.clientY >= zone.top && e.clientY <= zone.bottom;

            if (state.isInZone) {
                state.mouseX = (e.clientX - zone.left) / zone.width;
                state.mouseY = (e.clientY - zone.top) / zone.height;
            }
        });

        planeBgTop.style.transform = `scale(${CONFIG.bgZoom.idle})`;

        let time = 0;

        function animate() {
            time += 1;

            // 状态切换
            if (state.isInZone !== state.wasInZone) {
                state.wasInZone = state.isInZone;

                if (state.isInZone) {
                    heroSection.classList.add('in-zone');
                    speedLinesLayer.classList.add('active');
                    planes.forEach(p => p.subject.classList.add('floating'));
                    speedLinesLayer.style.backgroundImage = `url(${textureInside})`;
                    speedLinesLayer.style.backgroundSize = `${CONFIG.inside.tileSize * 0.75}px ${CONFIG.inside.tileSize * 0.75}px`;
                    state.sprintAngle = -16;
                    planeBgTop.style.transform = `scale(${CONFIG.bgZoom.active})`;
                } else {
                    heroSection.classList.remove('in-zone');
                    speedLinesLayer.classList.remove('active');
                    planes.forEach(p => p.subject.classList.remove('floating'));
                    speedLinesLayer.style.backgroundImage = `url(${textureOutside})`;
                    speedLinesLayer.style.backgroundSize = `${CONFIG.outside.tileSize * 0.75}px ${CONFIG.outside.tileSize * 0.75}px`;
                    state.sprintAngle = 0;
                    planeBgTop.style.transform = `scale(${CONFIG.bgZoom.idle})`;
                }
            }

            // 速度线：恒定速度
            state.currentSpeed = state.isInZone ? CONFIG.inside.baseSpeed : CONFIG.outside.baseSpeed;

            state.bgPosX -= state.currentSpeed;
            state.bgPosY += state.currentSpeed;

            const limit = CONFIG.inside.tileSize * 100;
            if (state.bgPosX < -limit) state.bgPosX += limit;
            if (state.bgPosY > limit) state.bgPosY -= limit;

            speedLinesLayer.style.backgroundPosition = `${state.bgPosX}px ${state.bgPosY}px`;

            // 主机冲刺倾斜衰减
            if (Math.abs(state.sprintAngle) > 0.3) {
                state.sprintAngle *= 0.92;
            } else {
                state.sprintAngle = 0;
            }

            // 三架飞机：间距呼吸 + 前后轮换 + 统一速度
            planes.forEach(p => {
                // 1. 横向间距呼吸
                let spacingScale = 1;
                if (p.id !== 'main') {
                    spacingScale = 1 + 0.35 * Math.sin(time * 0.03 + p.spacingPhase);
                    spacingScale = Math.max(0.65, Math.min(1.35, spacingScale));
                }

                // 2. 飞行纵深偏移（向右上角前后轮换）
                const depth = FLIGHT.depthAmp * Math.sin(time * FLIGHT.depthFreq + p.depthPhase);
                p.currentDepth = depth;

                p.offsetX = p.baseOffsetX * spacingScale + depth * FLIGHT.dirX;
                p.offsetY = p.baseOffsetY * spacingScale + depth * FLIGHT.dirY;

                // 3. 动态目标位置（followStrength 统一 0.35）
                if (state.isInZone) {
                    const rawX = (state.mouseX - 0.5) * zoneWidth * p.followStrength + p.offsetX;
                    const rawY = (state.mouseY - 0.5) * zoneHeight * p.followStrength + p.offsetY;
                    const maxX = Math.max(0, zoneWidth / 2 - p.halfW);
                    const maxY = Math.max(0, zoneHeight / 2 - p.halfH);
                    p.targetX = Math.max(-maxX, Math.min(maxX, rawX));
                    p.targetY = Math.max(-maxY, Math.min(maxY, rawY));
                } else {
                    p.targetX = p.offsetX;
                    p.targetY = p.offsetY;
                }

                // 4. 统一动态速度（speedPhase 统一为 0，三机同步 sine 起伏）
                const speedScale = Math.max(0.2, Math.min(1.4, 0.8 + 0.6 * Math.sin(time * 0.035 + p.speedPhase)));
                const baseSmooth = state.isInZone ? p.smoothing : CONFIG.returnSmoothing;
                const dynamicSmooth = Math.max(0.01, Math.min(0.15, baseSmooth * speedScale));

                // 5. 应用位置
                p.x += (p.targetX - p.x) * dynamicSmooth;
                p.y += (p.targetY - p.y) * dynamicSmooth;

                // 6. 旋转
                let totalRotate = -2;
                if (p.id === 'main') totalRotate += state.sprintAngle;
                p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${totalRotate}deg)`;
            });

            // 层级已由 CSS 固定，不再动态排序

            // 速度线遮罩跟随主机
            const main = planes[0];
            const planeAbsX = zoneWidth / 2 + main.x;
            const planeAbsY = zoneHeight / 2 + main.y;
            const maskXPercent = (planeAbsX / zoneWidth) * 100;
            const maskYPercent = (planeAbsY / zoneHeight) * 100;
            speedLinesLayer.style.setProperty('--mask-x', `${maskXPercent}%`);
            speedLinesLayer.style.setProperty('--mask-y', `${maskYPercent}%`);

            // 云朵系统
            if (state.isInZone) {
                cloudSystem.update(zoneWidth, zoneHeight);
            } else {
                cloudSystem.clouds.forEach(c => {
                    if (c.active) {
                        c.active = false;
                        c.el.style.opacity = '0';
                        c.timer = c.path.delay;
                    }
                });
            }

            requestAnimationFrame(animate);
        }

        animate();
  

// ========== 新增页面交互（完全不影响纸飞机代码） ==========
document.addEventListener('DOMContentLoaded', () => {

    // 1. 导航栏滚动变色
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 80) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 2. 平滑滚动 + 当前高亮
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll("#hero-wrapper, #portfolio, #portfolio-vx, #internship, #experience, #about");

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                const offset = navbar ? navbar.offsetHeight + 10 : 0;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    function updateActiveNav() {
        let current = '';
        const scrollPos = window.scrollY + (navbar ? navbar.offsetHeight + 100 : 100);
        sections.forEach(section => {
            if (scrollPos >= section.offsetTop) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();

    // 3. 轮播系统（支持多组，修复箭头）
function initCarousel(wrapper) {
    const viewport = wrapper.querySelector('.carousel-viewport');
    const slidesContainer = wrapper.querySelector('.carousel-slides');
    const slideEls = Array.from(wrapper.querySelectorAll('.carousel-slide'));
    const dotEls = Array.from((wrapper.parentElement || wrapper).querySelectorAll('.carousel-dots .dot'));
    const prevBtn = wrapper.querySelector('.carousel-btn.prev');
    const nextBtn = wrapper.querySelector('.carousel-btn.next');

    if (!viewport || !slidesContainer || slideEls.length === 0) return;

    let currentSlide = 0;
    const totalSlides = slideEls.length;

    function updateLayout(index) {
        const slide = slideEls[index];
        if (!slide) return;
        const offset = viewport.clientWidth * index;
        slidesContainer.style.transform = `translate3d(-${offset}px, 0, 0)`;
        viewport.style.height = `${slide.offsetHeight}px`;
    }

    function goTo(index) {
        currentSlide = ((index % totalSlides) + totalSlides) % totalSlides;
        updateLayout(currentSlide);
        dotEls.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => goTo(currentSlide - 1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => goTo(currentSlide + 1));
    }

    dotEls.forEach((dot, i) => {
        dot.addEventListener('click', () => goTo(i));
    });

    goTo(0);

    window.addEventListener('resize', () => updateLayout(currentSlide));
}

// 初始化所有轮播
document.querySelectorAll('.carousel-wrapper').forEach(initCarousel);
// 4. 卡片进入动画（Intersection Observer）
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.portfolio-card, .timeline-card, .about-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // ========== 作品详情 Modal ==========
    const modal = document.getElementById('portfolio-modal');
    if (!modal) return;
    const modalOverlay = modal.querySelector('.modal-overlay');
    const modalClose = modal.querySelector('.modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalTags = document.getElementById('modal-tags');
    const modalDesc = document.getElementById('modal-desc');
    const modalMediaWrap = document.getElementById('modal-media-wrap');
    const modalCarouselWrap = document.getElementById('modal-carousel-wrap');
    const modalSlides = document.getElementById('modal-carousel-slides');
    const modalDots = document.getElementById('modal-carousel-dots');
    const modalPrev = modal.querySelector('.modal-prev');
    const modalNext = modal.querySelector('.modal-next');
    const modalVideoWrap = document.getElementById('modal-video-wrap');
    const modalVideoIframe = document.getElementById('modal-video-iframe');
    const modalScrollWrap = document.getElementById('modal-scroll-wrap');
    const modalScrollImg = document.getElementById('modal-scroll-img');

    let modalCurrent = 0;
    let modalTotal = 0;

    function updateModalCarousel() {
        modalSlides.style.transform = `translateX(-${modalCurrent * 100}%)`;
        modalDots.querySelectorAll('.dot').forEach((d, i) => {
            d.classList.toggle('active', i === modalCurrent);
        });
    }

    function openModal(card) {
        const title = card.querySelector('h4').textContent;
        const desc = card.querySelector('.card-desc').textContent;
        const tags = Array.from(card.querySelectorAll('.tag')).map(t => t.textContent);
        const videoUrl = card.dataset.video;
        const images = card.dataset.detail ? card.dataset.detail.split(',').filter(Boolean) : [];
        const isLongFlag = card.dataset.long === 'true';

        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        modalTags.innerHTML = tags.map(t => `<span class="tag">${t}</span>`).join('');

        // 重置所有模式
        modalMediaWrap.classList.remove('is-video', 'is-long');
        modalVideoIframe.src = '';
        modalScrollImg.src = '';
        modalSlides.innerHTML = '';
        modalDots.style.display = '';

        // 判断展示模式
        if (videoUrl) {
            // 视频模式
            modalMediaWrap.classList.add('is-video');
            modalVideoIframe.src = videoUrl;
            modalDots.style.display = 'none';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        } 
        else if (images.length === 1 && isLongFlag) {
            // 手动标记的长图模式
            modalMediaWrap.classList.add('is-long');
            modalScrollImg.src = 'assets/' + images[0].trim();
            modalDots.style.display = 'none';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        else if (images.length === 1) {
            // 单张图：加载后自动判断是否为长图
            const imgSrc = 'assets/' + images[0].trim();
            const img = new Image();
            img.onload = () => {
                const isLong = img.height > img.width * 1.5 && img.height > 1000;
                if (isLong) {
                    modalMediaWrap.classList.add('is-long');
                    modalScrollImg.src = imgSrc;
                    modalDots.style.display = 'none';
                } else {
                    // 普通单图，走轮播
                    modalSlides.innerHTML = `
                        <div class="modal-carousel-slide">
                            <img src="${imgSrc}" alt="${title}" loading="lazy">
                        </div>
                    `;
                    modalTotal = 1;
                    modalCurrent = 0;
                    modalDots.innerHTML = `<span class="dot active" data-index="0"></span>`;
                    updateModalCarousel();
                }
            };
            img.src = imgSrc;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        else {
            // 普通多图轮播
            modalSlides.innerHTML = images.map(src => `
                <div class="modal-carousel-slide">
                    <img src="assets/${src.trim()}" alt="${title}" loading="lazy">
                </div>
            `).join('');

            modalTotal = images.length;
            modalCurrent = 0;

            modalDots.innerHTML = Array.from({length: modalTotal}, (_, i) => 
                `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
            ).join('');

            updateModalCarousel();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // 延迟清空，避免关闭动画期间闪白
        setTimeout(() => {
            modalSlides.innerHTML = '';
            modalDots.innerHTML = '';
            modalVideoIframe.src = '';
            modalScrollImg.src = '';
            modalMediaWrap.classList.remove('is-video', 'is-long');
        }, 350);
    }

    document.querySelectorAll('.portfolio-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.carousel-btn')) return;
            openModal(card);
        });
    });

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    modalPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        if (modalTotal === 0 || modalMediaWrap.classList.contains('is-video') || modalMediaWrap.classList.contains('is-long')) return;
        modalCurrent = (modalCurrent - 1 + modalTotal) % modalTotal;
        updateModalCarousel();
    });
    modalNext.addEventListener('click', (e) => {
        e.stopPropagation();
        if (modalTotal === 0 || modalMediaWrap.classList.contains('is-video') || modalMediaWrap.classList.contains('is-long')) return;
        modalCurrent = (modalCurrent + 1) % modalTotal;
        updateModalCarousel();
    });
    modalDots.addEventListener('click', (e) => {
        if (e.target.classList.contains('dot') && !modalMediaWrap.classList.contains('is-video') && !modalMediaWrap.classList.contains('is-long')) {
            modalCurrent = parseInt(e.target.dataset.index);
            updateModalCarousel();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // ========== 工作&实习经历展开收起 ==========
    document.querySelectorAll('.timeline-item').forEach(item => {
        const card = item.querySelector('.timeline-card');
        if (!card || card.classList.contains('empty')) return;

        card.addEventListener('click', () => {
            const isExpanded = item.getAttribute('data-expanded') === 'true';

            // 手风琴效果：收起其他已展开的项
            document.querySelectorAll('.timeline-item.expanded').forEach(other => {
                if (other !== item) {
                    other.setAttribute('data-expanded', 'false');
                    other.classList.remove('expanded');
                }
            });

            if (isExpanded) {
                item.setAttribute('data-expanded', 'false');
                item.classList.remove('expanded');
            } else {
                item.setAttribute('data-expanded', 'true');
                item.classList.add('expanded');
            }
        });
    });
});