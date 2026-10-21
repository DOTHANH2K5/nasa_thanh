/* ポートフォリオの動き：モバイルナビ、スクロール表示、控えめな背景パララックス */
/* スマホのナビを開(ひら)く・閉(と)じる / Open and close the mobile menu */
const navToggle = document.querySelector(".nav-toggle");
const headerNav = document.querySelector(".header-nav");
const navLinks = document.querySelectorAll(".header-nav a");

function closeNavigation() {
    if (!navToggle || !headerNav) return;

    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "メニューを開く");
    headerNav.classList.remove("is-open");
}

if (navToggle && headerNav) {
    navToggle.addEventListener("click", () => {
        const isOpen = navToggle.getAttribute("aria-expanded") === "true";

        navToggle.setAttribute("aria-expanded", String(!isOpen));
        navToggle.setAttribute("aria-label", isOpen ? "メニューを開く" : "メニューを閉じる");
        headerNav.classList.toggle("is-open", !isOpen);
    });

    /* リンクを押(お)したらメニューを閉(と)じます / Close after choosing a link */
    navLinks.forEach((link) => {
        link.addEventListener("click", closeNavigation);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeNavigation();
    });

    window.matchMedia("(min-width: 769px)").addEventListener("change", closeNavigation);
}

/* スクロールに合わせて要素をふんわり表示 / Reveal content on scroll */
document.documentElement.classList.add("has-js");

const revealTargets = document.querySelectorAll(
    ".section-common:not(.section1) .head-line, .card, .list-item, .wrap-item, .custom-table, .faq-item, .google-form-container, .form-submit"
);

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -36px 0px"
    });

    revealTargets.forEach((element, index) => {
        element.classList.add("reveal-on-scroll");
        element.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
        revealObserver.observe(element);
    });
} else {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
}

/* ヒーロー背景を少しだけ動かす / Gentle hero parallax */
const heroBackground = document.querySelector(".hero-bg");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (heroBackground && !reduceMotion.matches) {
    let ticking = false;

    window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;

        window.requestAnimationFrame(() => {
            const offset = Math.min(window.scrollY * 0.12, 34);
            heroBackground.style.transform = `translate3d(0, ${offset}px, 0)`;
            ticking = false;
        });
    }, { passive: true });
}
