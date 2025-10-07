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
    AOS.init(
        {
            duration: 800,
            once: true
        }
    );

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
        AOS.init({ once: true, duration: 700, easing: 'ease-out-cubic' });
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
});
