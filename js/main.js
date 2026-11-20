/* Bingan PCs — main.js
   Entry point for site behavior. Keep individual features in separate files
   (see js/modules/) and import or include them here as the site grows. */

document.addEventListener("DOMContentLoaded", () => {
  // Automatically keep the footer year current.
  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Smooth-scroll for in-page anchor links.
  // A bare "#" is not a valid selector and used to throw on every placeholder
  // link, so skip anything without a real target.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    let target = null;
    try {
      target = document.querySelector(href);
    } catch {
      return;
    }

    if (target) {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      });
    }
  });

  // Mobile navigation dropdown.
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.querySelector(".main-nav");

  if (navToggle && mainNav) {
    const arrow = navToggle.querySelector(".nav-arrow");

    const setOpen = (open) => {
      mainNav.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (arrow) {
        arrow.style.transform = open ? "rotate(180deg)" : "rotate(0deg)";
      }
    };

    navToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      setOpen(!mainNav.classList.contains("is-open"));
    });

    // Close after picking a link, on Escape, or on a click outside the menu.
    mainNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });

    document.addEventListener("click", (event) => {
      if (!mainNav.contains(event.target) && !navToggle.contains(event.target)) {
        setOpen(false);
      }
    });
  }
});
