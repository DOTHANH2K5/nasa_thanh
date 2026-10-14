/* TODO 02：授業(じゅぎょう)でパララックスのJavaScriptを追加(ついか)します。
   Add the parallax JavaScript in class.

確認(かくにん)する要素(ようそ) / Check these elements
- .section1：ヒーローエリア
- .hero-bg：動(うご)かす背景(はいけい)画像(がぞう)

完成(かんせい)後(ご)は、スクロール量(りょう)の一部(いちぶ)を translateY() に渡(わた)します。
Use part of the scroll value in translateY().
*/

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