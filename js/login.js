/* ============================================================
   login.js
   Gestisce il form di accesso: validazione dei campi, invio
   simulato e feedback all'utente.

   Il login e' finto e serve a mostrare come cambia l'interfaccia
   tra utente autenticato e visitatore. Le credenziali sono in
   chiaro dentro app.js, quindi la sicurezza vera qui non esiste:
   in un'applicazione reale il controllo starebbe sul server.
   ============================================================ */

"use strict";

/* ------------------------------------------------------------
   RIFERIMENTI AL DOM

   Li prendiamo una volta sola all'avvio invece di richiamare
   getElementById dentro ogni funzione: ogni chiamata rifa' la
   ricerca nel documento, e qui gli elementi non cambiano mai.

   Sono const perche' cambiera' il contenuto degli input, non il
   riferimento all'elemento. Riassegnare loginForm sarebbe un
   errore, e const lo blocca subito invece di lasciarlo passare.
   ------------------------------------------------------------ */

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const usernameError = document.getElementById("usernameError");
const passwordError = document.getElementById("passwordError");
const submitBtn = document.getElementById("submitBtn");

/* Se c'e' gia' una sessione attiva non ha senso mostrare il form:
   mandiamo l'utente alla home. Il controllo sta fuori da qualsiasi
   funzione, quindi parte appena il file viene eseguito. */
if (Auth.isLoggedIn()) {
  window.location.href = "index.html";
}

/* ============================================================
   FUNZIONI DI SUPPORTO PER LA VALIDAZIONE

   I messaggi di errore esistono gia' nell'HTML ma sono nascosti
   dal CSS. Il JavaScript non li crea: si limita ad aggiungere o
   togliere la classe .visible. Cosi' la logica resta qui e
   l'aspetto resta nel foglio di stile.
   ============================================================ */

/**
 * Segnala un campo non valido e mostra il messaggio di errore.
 * @param {HTMLInputElement} input campo da evidenziare
 * @param {HTMLElement} errorSpan span che contiene il messaggio
 * @param {string} message testo dell'errore
 */
function showFieldError(input, errorSpan, message) {
  /* textContent inserisce testo puro. Con innerHTML il contenuto
     verrebbe interpretato come HTML, che e' la porta d'ingresso
     degli attacchi XSS quando il testo arriva dall'utente. */
  errorSpan.textContent = message;
  errorSpan.classList.add("visible");

  /* Le due classi si escludono: togliamo quella di successo
     altrimenti il bordo resterebbe verde su un campo sbagliato. */
  input.classList.add("input-error");
  input.classList.remove("input-success");
}

/**
 * Nasconde l'errore di un campo senza segnalarlo come valido.
 * Serve mentre l'utente sta ancora scrivendo.
 * @param {HTMLInputElement} input
 * @param {HTMLElement} errorSpan
 */
function clearFieldError(input, errorSpan) {
  errorSpan.classList.remove("visible");
  input.classList.remove("input-error");
}

/**
 * Segnala un campo come valido con il bordo verde.
 * @param {HTMLInputElement} input
 * @param {HTMLElement} errorSpan
 */
function markFieldSuccess(input, errorSpan) {
  errorSpan.classList.remove("visible");
  input.classList.remove("input-error");
  input.classList.add("input-success");
}

/**
 * Controlla tutti i campi del form.
 *
 * Non usciamo al primo errore: continuiamo fino in fondo cosi'
 * l'utente vede subito tutti i problemi invece di scoprirli uno
 * alla volta a ogni tentativo.
 *
 * @returns {boolean} true se ogni campo e' valido
 */
function validateForm() {
  /* let e non const: il valore passa a false appena troviamo un
     campo sbagliato. */
  let isValid = true;

  /* trim() toglie gli spazi a inizio e fine stringa, altrimenti
     un campo con soli spazi passerebbe il controllo sul vuoto. */
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (username === "") {
    showFieldError(usernameInput, usernameError, "Username is required");
    isValid = false;
  } else if (username.length < 3) {
    showFieldError(usernameInput, usernameError, "Username must be at least 3 characters");
    isValid = false;
  } else {
    markFieldSuccess(usernameInput, usernameError);
  }

  if (password === "") {
    showFieldError(passwordInput, passwordError, "Password is required");
    isValid = false;
  } else if (password.length < 6) {
    showFieldError(passwordInput, passwordError, "Password must be at least 6 characters");
    isValid = false;
  } else {
    markFieldSuccess(passwordInput, passwordError);
  }

  return isValid;
}

/**
 * Attiva o disattiva lo stato di caricamento sul bottone.
 * disabled impedisce click ripetuti mentre l'operazione e' in
 * corso, che su un form vero significherebbe invii doppi.
 * @param {boolean} loading
 */
function setLoadingState(loading) {
  if (loading) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in...";
  } else {
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign In";
  }
}

/* ============================================================
   INVIO DEL FORM
   ============================================================ */

loginForm.addEventListener("submit", function (event) {
  /* Senza preventDefault il browser invierebbe il form come
     richiesta HTTP e ricaricherebbe la pagina, buttando via lo
     stato appena calcolato. Lo blocchiamo e gestiamo tutto qui. */
  event.preventDefault();

  /* Se la validazione fallisce usciamo subito: i messaggi di
     errore li ha gia' mostrati validateForm. */
  if (!validateForm()) {
    return;
  }

  setLoadingState(true);

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  /* Auth.login sta in app.js e restituisce l'utente o null.
     Qui e' immediato perche' i dati sono in memoria; con un server
     vero sarebbe una fetch e servirebbe async/await. */
  const user = Auth.login(username, password);

  if (user) {
    showToast("Login successful. Welcome back, " + user.username, "success");

    /* Aspettiamo un secondo prima del redirect, altrimenti il
       toast sparirebbe insieme alla pagina senza essere letto. */
    setTimeout(function () {
      window.location.href = "profile.html";
    }, 1000);
  } else {
    /* Credenziali sbagliate: riabilitiamo il bottone per lasciare
       ritentare. Il messaggio non dice quale dei due campi e'
       errato, cosi' non aiuta chi prova a indovinare gli utenti. */
    setLoadingState(false);
    showToast("Invalid username or password. Please try again.", "error");

    /* La classe .shake avvia l'animazione definita nel CSS.
       Va rimossa dopo i 500ms della durata: un'animazione CSS
       riparte solo quando la classe viene tolta e rimessa, quindi
       senza questa riga il secondo tentativo sbagliato non
       produrrebbe alcun effetto visivo. */
    loginForm.classList.add("shake");

    setTimeout(function () {
      loginForm.classList.remove("shake");
    }, 500);
  }
});

/* ============================================================
   VALIDAZIONE MENTRE SI SCRIVE

   L'evento input scatta a ogni modifica del campo, compresi
   incolla e cancellazione. A differenza di change, che aspetta
   l'uscita dal campo, permette di correggere l'errore subito.

   Mentre l'utente scrive segnaliamo solo il successo: mostrare
   "troppo corto" dopo la prima lettera sarebbe solo fastidioso.
   Gli errori veri restano al submit.
   ============================================================ */

usernameInput.addEventListener("input", function () {
  const value = usernameInput.value.trim();

  if (value.length >= 3) {
    markFieldSuccess(usernameInput, usernameError);
  } else {
    clearFieldError(usernameInput, usernameError);
  }
});

passwordInput.addEventListener("input", function () {
  const value = passwordInput.value.trim();

  if (value.length >= 6) {
    markFieldSuccess(passwordInput, passwordError);
  } else {
    clearFieldError(passwordInput, passwordError);
  }
});
