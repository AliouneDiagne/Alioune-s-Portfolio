/* ============================================================
   app.js
   Modulo condiviso, incluso da tutte le pagine prima degli
   script specifici. Contiene quattro cose che servono ovunque:
   il sistema di login simulato, i toast di feedback, la navbar
   e il footer generati via JavaScript.

   Va caricato per primo perche' gli altri file usano Auth,
   showToast, renderNavbar e renderFooter definiti qui.
   ============================================================ */

"use strict";

/* Chiavi con cui salviamo i dati nel localStorage.
   Sono const perche' non cambiano mai: se le scrivessi a mano
   in ogni punto del codice basterebbe un errore di battitura
   per rompere il login senza accorgersene. */
const AUTH_KEY = "portfolio_auth";
const USER_KEY = "portfolio_user";

/* ============================================================
   AUTENTICAZIONE SIMULATA

   Non c'e' un server: lo stato di login vive nel localStorage
   del browser, che conserva i dati anche dopo la chiusura della
   pagina (a differenza del sessionStorage, che li perde).

   Auth e' un oggetto che raggruppa dati e funzioni collegate.
   Cosi' il resto del codice chiama Auth.login() invece di avere
   variabili sparse in giro.
   ============================================================ */

const Auth = {
  /* Utenti finti. In un'applicazione reale sarebbero su un
     database e la password non viaggerebbe mai in chiaro. */
  users: [
    { username: "alioune", password: "admin123", name: "Alioune Diagne", email: "alioune.diagne@email.com", role: "Cloud & Backend Developer" },
    { username: "guest", password: "guest123", name: "Guest User", email: "guest@email.com", role: "Visitor" }
  ],

  /**
   * Controlla le credenziali e, se sono giuste, salva la sessione.
   * @param {string} username
   * @param {string} password
   * @returns {object|null} i dati dell'utente, oppure null se le credenziali sono sbagliate
   */
  login(username, password) {
    /* find() scorre l'array e restituisce il primo elemento che
       soddisfa la condizione, oppure undefined se non trova nulla. */
    const user = this.users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      /* Salviamo una copia dell'utente senza la password: non ha
         senso tenere in memoria un dato che non serve piu'. */
      const userData = { username: user.username, name: user.name, email: user.email, role: user.role };

      localStorage.setItem(AUTH_KEY, "true");

      /* localStorage memorizza solo stringhe, quindi l'oggetto va
         convertito in JSON prima di salvarlo. */
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      return userData;
    }

    return null;
  },

  /** Chiude la sessione cancellando i dati salvati. */
  logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /** @returns {boolean} true se esiste una sessione attiva. */
  isLoggedIn() {
    /* getItem restituisce null se la chiave non esiste, quindi il
       confronto con "true" copre anche il caso "mai loggato". */
    return localStorage.getItem(AUTH_KEY) === "true";
  },

  /** @returns {object|null} i dati dell'utente loggato. */
  getUser() {
    const data = localStorage.getItem(USER_KEY);

    /* JSON.parse fa il contrario di JSON.stringify: dalla stringa
       salvata ricostruisce l'oggetto JavaScript. */
    return data ? JSON.parse(data) : null;
  },

  /**
   * Aggiorna i dati dell'utente loggato e li riscrive nel localStorage.
   * Serve alla pagina profilo: senza questo metodo le modifiche
   * resterebbero solo a schermo e sparirebbero al reload.
   * @param {object} updates proprieta' da aggiornare, es. { name, email, role }
   * @returns {object|null} l'utente aggiornato, null se nessuno e' loggato
   */
  updateUser(updates) {
    const current = this.getUser();
    if (!current) return null;

    /* Lo spread operator copia tutte le proprieta' di current e poi
       sovrascrive solo quelle presenti in updates. Cosi' non perdiamo
       i campi che il form non modifica, come username. */
    const updated = { ...current, ...updates };

    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  }
};

/* ============================================================
   TOAST DI FEEDBACK

   Messaggio temporaneo in alto a destra. Lo usiamo al posto di
   alert() perche' alert blocca tutta la pagina finche' l'utente
   non clicca, mentre il toast sparisce da solo.
   ============================================================ */

/**
 * Mostra un messaggio temporaneo all'utente.
 * @param {string} message testo da mostrare
 * @param {string} type "success", "error", "warning" o "info"
 */
function showToast(message, type = "info") {
  /* Il container esiste solo dopo il primo toast, quindi lo cerchiamo
     e lo creiamo al volo se manca. E' let perche' viene riassegnato. */
  let container = document.querySelector(".toast-container");

  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");

  /* La classe modificatrice decide il colore del bordo via CSS. */
  toast.className = `toast toast--${type}`;

  /* Le icone sono scritte come HTML entity, come nel resto del
     progetto: il file sorgente resta in ASCII e il browser le
     converte nei simboli corrispondenti. */
  const icons = { success: "&#10003;", error: "&#10007;", warning: "&#9888;", info: "&#8505;" };

  /* Se il tipo passato non esiste nella mappa, icons[type] vale
     undefined e l'operatore || fa scattare il valore di riserva. */
  const icon = icons[type] || icons.info;

  toast.innerHTML = `
    <span class="toast__icon">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  /* setTimeout esegue la funzione una sola volta dopo il ritardo
     indicato in millisecondi. Il controllo su parentNode evita
     l'errore se il toast fosse gia' stato rimosso. */
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
}

/* ============================================================
   NAVBAR

   Il menu e' scritto una volta sola qui e generato via JavaScript
   in ogni pagina. Se fosse copiato nell'HTML di tutte le pagine,
   aggiungere una voce vorrebbe dire modificare sei file.
   ============================================================ */

/**
 * Genera il menu di navigazione e collega i suoi eventi.
 * @param {string} currentPage nome della pagina corrente, per evidenziarla
 */
function renderNavbar(currentPage) {
  const nav = document.getElementById("navbar");

  /* La pagina di login non ha la navbar: usciamo subito invece di
     andare in errore su un elemento che non esiste. */
  if (!nav) return;

  const isLogged = Auth.isLoggedIn();

  /* I template literal (backtick) permettono stringhe su piu' righe
     e l'interpolazione con ${}. Qui li usiamo per costruire il menu
     e per cambiarlo in base allo stato di login: da sloggati compare
     Login, da loggati compaiono Profile e Logout. */
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

  /* Gli elementi vanno cercati dopo aver scritto innerHTML: prima
     di quella riga il bottone e la lista non esistono nel DOM. */
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");

  /* Menu hamburger. classList.toggle aggiunge la classe se manca e
     la toglie se c'e', quindi un solo listener apre e chiude. */
  toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
  });

  /* Event delegation: un solo listener sulla lista invece di uno per
     ogni link. L'evento click parte dal link e risale ai genitori
     (bubbling), quindi qui leggiamo e.target per sapere cosa e'
     stato cliccato davvero. Su mobile serve a chiudere il menu
     dopo la scelta di una voce. */
  menu.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      menu.classList.remove("open");
    }
  });

  /* Il bottone Logout esiste solo se l'utente e' loggato. */
  const logoutBtn = document.getElementById("navLogout");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      /* Il logout e' un tag <a>: senza preventDefault il browser
         seguirebbe l'href e ricaricherebbe la pagina. */
      e.preventDefault();

      Auth.logout();
      showToast("Logout effettuato con successo", "success");

      /* Un secondo di attesa serve solo a far leggere il toast prima
         che la pagina cambi. */
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    });
  }
}

/* ============================================================
   FOOTER
   ============================================================ */

/** Genera il footer, uguale in tutte le pagine che hanno #footer. */
function renderFooter() {
  const footer = document.getElementById("footer");
  if (!footer) return;

  /* L'anno e' calcolato a runtime, cosi' non va aggiornato a mano. */
  const year = new Date().getFullYear();

  /* Sui link esterni target="_blank" apre una nuova scheda e
     rel="noopener noreferrer" impedisce alla pagina aperta di
     accedere a questa tramite window.opener. */
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

/* ============================================================
   ANIMAZIONI ALLO SCROLL
   ============================================================ */

/**
 * Fa comparire gli elementi con classe .fade-in quando entrano
 * nello schermo. Usiamo IntersectionObserver invece dell'evento
 * scroll perche' scroll scatta centinaia di volte al secondo e
 * costringe a calcolare la posizione a mano, mentre l'observer
 * avvisa solo quando la visibilita' cambia davvero.
 */
function initScrollAnimations() {
  const elements = document.querySelectorAll(".fade-in");

  const observer = new IntersectionObserver(
    (entries) => {
      /* entries contiene solo gli elementi la cui visibilita' e'
         cambiata rispetto al controllo precedente. */
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          /* La classe .visible attiva la transizione definita nel CSS. */
          entry.target.classList.add("visible");

          /* L'animazione va fatta una volta sola: smettiamo di
             osservare l'elemento gia' comparso. */
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 } // scatta quando almeno il 10% e' visibile
  );

  elements.forEach((el) => observer.observe(el));
}

/* ============================================================
   AVVIO

   DOMContentLoaded scatta quando l'HTML e' stato letto e il DOM
   costruito, senza aspettare immagini e risorse esterne come fa
   invece l'evento load. E' il momento giusto per manipolare gli
   elementi: prima non esisterebbero ancora.

   Qui restano solo le parti comuni a tutte le pagine. La navbar
   la chiama ogni pagina passando il proprio nome.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  renderFooter();
  initScrollAnimations();
});
