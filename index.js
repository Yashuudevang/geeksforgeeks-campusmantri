// Nav bar start
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

var prevScrollpos = window.pageYOffset;
var navWrap = document.getElementById("navbar-wrap");
var navBody = document.getElementById("navbar");

window.onscroll = function () {
    var currentScrollPos = window.pageYOffset;
    if (prevScrollpos >= currentScrollPos) {
        navWrap.style.top = "0";
        navBody.style.boxShadow = "-1px 4px 15px 0px rgba(209, 205, 209, 0.5)";
    } else {
        navWrap.style.top = "-91px";
        navBody.style.boxShadow = "-1px 4px 15px 0px rgba(209, 205, 209, 0)";
    }
    prevScrollpos = currentScrollPos;
}
// Nav bar end


// Events Start
var swiper = new Swiper(".mySwiper", {
    breakpoints: {
        1500: { slidesPerView: 3 },
        900: { slidesPerView: 2, spaceBetween: 25 },
    },
    spaceBetween: 10,
    slidesPerView: 1,
    centeredSlides: false,
    loop: true,
    autoplay: {
        delay: 2500,
        disableOnInteraction: false,
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
        dynamicBullets: true,
    },
});
// Events end





// Loading screen start
const pageLoaded = () => {
    // Animate on scroll
    // allow AOS to animate every time elements enter viewport
    AOS.init({ duration: 800, once: false });

    // Remove loader
    const loader = document.getElementById('loader_block');
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 300);

    // Lazy load images with cdn
    const imgs = document.querySelectorAll('[data-src]');
    imgs.forEach(img => {
        img.setAttribute('src', 'https://cdn.jsdelivr.net/gh/GfG-IIIT-Bh/GfG-IIIT-Bh.github.io' + img.getAttribute('data-src').substring(1));
    });

    // Lazy load images without cdn
    const imgs2 = document.querySelectorAll('[data-src-noncdn]');
    imgs2.forEach(img => {
        img.setAttribute('src', img.getAttribute('data-src-noncdn'));
    });

    // Lazy load contact form iframe
    const contactIframe = document.getElementById('contact-form') || document.getElementById('contact-iframe');
    if (contactIframe) {
        contactIframe.setAttribute('src', 'https://docs.google.com/forms/d/e/1FAIpQLSfS7FQCerPWm6jspzz-cVzw1i-P-dfYw45XDABiULRjOkOmVA/viewform?usp=header_3&embedded=true');
    }
  
    window.removeEventListener('load', pageLoaded);
}
window.addEventListener('load', pageLoaded);
// Loading screen end

document.addEventListener('DOMContentLoaded', function () {
    // initialize AOS (safe to call if already initialized)
    if (window.AOS) {
        AOS.init({ once: false, duration: 700, easing: 'ease-out-cubic' });
    }

    // Apply fade-up + staggered delay to campus crew cards
    const campusCrew = document.querySelectorAll('.team-members.crew .our-team');
    campusCrew.forEach((card, i) => {
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', String(i * 80)); // 0ms,80ms,160ms...
        card.setAttribute('data-aos-offset', '120');
    });

    // Remove any AOS attributes for execution crew so they do not animate
    const execCrew = document.querySelectorAll('.team-members.execution .our-team');
    execCrew.forEach(card => {
        card.removeAttribute('data-aos');
        card.removeAttribute('data-aos-delay');
        card.removeAttribute('data-aos-offset');
    });

    // Refresh AOS so it picks up newly added/removed attributes
    if (window.AOS) AOS.refresh();

    // load form into the page (prevent new tab). If multiple event links exist this handles them all.
    document.querySelectorAll('.event-link[data-form-src]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const formUrl = this.dataset.formSrc;
            const iframe = document.getElementById('contact-iframe') || document.getElementById('contact-form');
            if (iframe) iframe.src = formUrl;
            const section = document.getElementById('contact-loc');
            if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => iframe && iframe.focus(), 600);
        });
    });

    // Register button: same behaviour as event-link (loads form in-page and scrolls)
    const regBtn = document.getElementById('register-btn');
    if (regBtn) {
        regBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const formUrl = this.dataset.formSrc;
            const iframe = document.getElementById('contact-iframe') || document.getElementById('contact-form');
            if (iframe) iframe.src = formUrl;
            const section = document.getElementById('contact-loc');
            if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => iframe && iframe.focus(), 600);
        });
    }

    // --- ADD: apply entrance animations with a small stagger ---
    try {
        const selectors = [
            '#logo .logo img', '#bonjour', '#welcome', '#geeksforgeeks',
            '.our-team-head', '.events-head', '.contact-head',
            '.team-members .our-team .name', '.team-members .our-team .title',
            '.social-item', '.register-btn', '.event-poster img',
            '#socials-img img', '.swiper-slide img', '.our-team .picture img'
        ];
        const elems = document.querySelectorAll(selectors.join(','));
        elems.forEach((el, i) => {
            // mark ready to avoid FOUC
            el.setAttribute('data-animate-ready', 'true');
            // stagger
            const delay = (i % 12) * 80; // 0..880ms then repeat pattern
            el.style.animationDelay = delay + 'ms';
            // decide classes
            el.classList.add('animate-in');
            // add float to images and event poster, pulse to logo
            if (el.matches && (el.matches('img') || el.tagName === 'IMG')) {
                el.classList.add('animate-float');
                // make float slightly slower for large posters
                if (el.closest('.event-poster')) el.style.animationDuration = '8s';
            }
            if (el.matches && el.matches('#logo .logo img')) {
                el.classList.add('animate-pulse');
                el.style.animationDelay = '200ms';
            }
            // cleanup inline attribute after animation complete (optional)
            el.addEventListener('animationend', () => {
                el.style.animationDelay = '';
                el.removeAttribute('data-animate-ready');
            }, { once: true });
        });
    } catch (err) {
        console.warn('animation init failed', err);
    }

    // --- ADD: IntersectionObserver to replay animations on every scroll ---
    try {
        const replaySelectors = [
            '#logo .logo img', '#bonjour', '#welcome', '#geeksforgeeks',
            '.our-team-head', '.events-head', '.contact-head',
            '.team-members .our-team .name', '.team-members .our-team .title',
            '.social-item', '.register-btn', '.event-poster img',
            '#socials-img img', '.swiper-slide img', '.our-team .picture img'
        ];
        const replayElems = document.querySelectorAll(replaySelectors.join(','));
        const observerOpts = { threshold: 0.18, rootMargin: '0px 0px -8% 0px' };

        const replayObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                if (entry.isIntersecting) {
                    // force reflow then add class to replay animation
                    el.classList.remove('animate-in');
                    void el.offsetWidth;
                    el.classList.add('animate-in');
                    // for images also ensure float/pulse classes are present
                    if (el.tagName === 'IMG') {
                        el.classList.add('animate-float');
                        if (el.closest && el.closest('#logo')) el.classList.add('animate-pulse');
                    }
                } else {
                    // remove classes so animation can run again when re-entering
                    el.classList.remove('animate-in');
                    if (el.tagName === 'IMG') {
                        el.classList.remove('animate-float');
                        el.classList.remove('animate-pulse');
                    }
                }
            });
        }, observerOpts);

        replayElems.forEach(el => replayObserver.observe(el));
    } catch (err) {
        console.warn('replay observer init failed', err);
    }

    // Replayable fade-up animation for campus crew cards (staggered)
    (function initCrewFadeUp(){
        const crewCards = Array.from(document.querySelectorAll('.team-members.crew .our-team'));
        if (!crewCards.length) return;

        const obsOpts = { threshold: 0.18, rootMargin: '0px 0px -8% 0px' };
        const crewObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                const idx = crewCards.indexOf(el);
                if (entry.isIntersecting) {
                    // stagger by index
                    el.style.animationDelay = (idx * 80) + 'ms';
                    el.classList.add('animate-fade-up');
                } else {
                    el.classList.remove('animate-fade-up');
                    el.style.animationDelay = '';
                }
            });
        }, obsOpts);

        crewCards.forEach(card => crewObserver.observe(card));
    })();

// ---------- Countdown (robust) ----------
(function initCountdown() {
    // target: 13 Oct 2025 at 12:30 local time
    const targetDate = new Date(2025, 9, 13, 12, 30, 0); // monthIndex 9 = October
    console.log('Countdown target:', targetDate.toString());

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    const daysProgress = document.getElementById('days-progress');
    const hoursProgress = document.getElementById('hours-progress');
    const minutesProgress = document.getElementById('minutes-progress');
    const secondsProgress = document.getElementById('seconds-progress');

    if (!daysEl && !hoursEl && !minutesEl && !secondsEl) {
        console.warn('Countdown elements not found — skipping countdown init.');
        return;
    }

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function updateCountdown() {
        const now = new Date();
        const diff = targetDate - now;
        // debug
        // console.log('now:', now.toString(), 'diff(ms):', diff);

        if (isNaN(targetDate.getTime())) {
            console.error('Invalid targetDate for countdown.');
            return;
        }

        if (diff <= 0) {
            const container = document.getElementById('countdown');
            if (container) container.innerHTML = '<div class="count-item"><span class="count-num">0</span><span class="count-label">Event started</span></div>';
            clearInterval(timer);
            window.dispatchEvent(new CustomEvent('eventStarted', { detail: { target: targetDate } }));
            return;
        }

        let rem = diff;
        const days = Math.floor(rem / (1000 * 60 * 60 * 24)); rem %= (1000 * 60 * 60 * 24);
        const hours = Math.floor(rem / (1000 * 60 * 60)); rem %= (1000 * 60 * 60);
        const minutes = Math.floor(rem / (1000 * 60)); rem %= (1000 * 60);
        const seconds = Math.floor(rem / 1000);

        if (daysEl) daysEl.textContent = String(days);
        if (hoursEl) hoursEl.textContent = pad(hours);
        if (minutesEl) minutesEl.textContent = pad(minutes);
        if (secondsEl) secondsEl.textContent = pad(seconds);

        // progress circles (if present)
        try {
            const fullCircle = 283;
            if (daysProgress) daysProgress.style.strokeDashoffset = (fullCircle - (days / 365) * fullCircle).toString();
            if (hoursProgress) hoursProgress.style.strokeDashoffset = (fullCircle - (hours / 24) * fullCircle).toString();
            if (minutesProgress) minutesProgress.style.strokeDashoffset = (fullCircle - (minutes / 60) * fullCircle).toString();
            if (secondsProgress) secondsProgress.style.strokeDashoffset = (fullCircle - (seconds / 60) * fullCircle).toString();
        } catch (e) {
            // ignore if SVG elements missing
        }
    }

    // start
    updateCountdown();
    let timer = setInterval(updateCountdown, 1000);
})();
});
