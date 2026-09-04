/* ============================================================
   app.js — Modulo condiviso: autenticazione simulata, toast,
   navbar e footer. Va caricato per primo.
   ============================================================ */

"use strict";

const AUTH_KEY = "portfolio_auth";
const USER_KEY = "portfolio_user";

/* ---- AUTENTICAZIONE SIMULATA ----
   Stato di login in localStorage (persiste tra le sessioni). */

const Auth = {
  /* Utenti finti — in produzione starebbero su un database. */
  users: [
    { username: "alioune", password: "admin123", name: "Alioune Diagne", email: "alioune.diagne@email.com", role: "Cloud & Backend Developer" },
    { username: "guest", password: "guest123", name: "Guest User", email: "guest@email.com", role: "Visitor" }
  ],

  /** Controlla le credenziali; se corrette salva la sessione. */
  login(username, password) {
    const user = this.users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      const userData = { username: user.username, name: user.name, email: user.email, role: user.role };
      localStorage.setItem(AUTH_KEY, "true");
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      return userData;
    }

    return null;
  },

  /** Chiude la sessione. */
  logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /** @returns {boolean} true se c'e' una sessione attiva. */
  isLoggedIn() {
    return localStorage.getItem(AUTH_KEY) === "true";
  },

  /** @returns {object|null} dati dell'utente loggato. */
  getUser() {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  /** Aggiorna i dati utente nel localStorage. */
  updateUser(updates) {
    const current = this.getUser();
    if (!current) return null;

    const updated = { ...current, ...updates };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  }
};

/* ---- TOAST DI FEEDBACK ----
   Messaggio temporaneo in alto a destra, sparisce dopo 3 s. */

function showToast(message, type = "info") {
  let container = document.querySelector(".toast-container");

  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;

  const icons = { success: "&#10003;", error: "&#10007;", warning: "&#9888;", info: "&#8505;" };
  const icon = icons[type] || icons.info;

  toast.innerHTML = `
    <span class="toast__icon">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 3000);
}

/* ---- NAVBAR ----
   Menu generato via JS: si modifica in un punto solo. */

function renderNavbar(currentPage) {
  const nav = document.getElementById("navbar");
  if (!nav) return;

  const isLogged = Auth.isLoggedIn();

  nav.innerHTML = `
    <div class="container">
      <a href="index.html" class="navbar__logo">AD<span>.dev</span></a>
      <button class="navbar__toggle" id="navToggle" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
      <ul class="navbar__menu" id="navMenu">
        <li><a href="index.html" class="${currentPage === 'home' ? 'active' : ''}">Home</a></li>
        <li><a href="projects.html" class="${currentPage === 'projects' ? 'active' : ''}">Projects</a></li>
        <li><a href="certifications.html" class="${currentPage === 'certifications' ? 'active' : ''}">Certifications</a></li>
        <li><a href="contact.html" class="${currentPage === 'contact' ? 'active' : ''}">Contact</a></li>
        ${isLogged ? `<li><a href="profile.html" class="${currentPage === 'profile' ? 'active' : ''}">Profile</a></li>` : ''}
        <li>
          ${isLogged
            ? '<a href="#" class="btn-nav-auth" id="navLogout">Logout</a>'
            : '<a href="login.html" class="btn-nav-auth">Login</a>'
          }
        </li>
      </ul>
    </div>
  `;

  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");

  toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
  });

  /* Chiudi il menu al click su un link (utile su mobile). */
  menu.addEventListener("click", (e) => {
    if (e.target.tagName === "A") menu.classList.remove("open");
  });

  const logoutBtn = document.getElementById("navLogout");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      Auth.logout();
      showToast("Logout effettuato con successo", "success");
      setTimeout(() => { window.location.href = "index.html"; }, 1000);
    });
  }
}

/* ---- FOOTER ---- */

function renderFooter() {
  const footer = document.getElementById("footer");
  if (!footer) return;

  const year = new Date().getFullYear();

  footer.innerHTML = `
    <div class="container">
      <p class="footer__text">&copy; ${year} Alioune Diagne. All rights reserved.</p>
      <div class="footer__links">
        <a href="https://github.com/AliouneDiagne" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/in/alioune-diagne-328b042b0/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="contact.html">Contact</a>
      </div>
    </div>
  `;
}

/* ---- ANIMAZIONI ALLO SCROLL ----
   IntersectionObserver aggiunge .visible agli elementi .fade-in. */

function initScrollAnimations() {
  const elements = document.querySelectorAll(".fade-in");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  elements.forEach((el) => observer.observe(el));
}

/* ---- AVVIO ---- */

document.addEventListener("DOMContentLoaded", () => {
  renderFooter();
  initScrollAnimations();
});
