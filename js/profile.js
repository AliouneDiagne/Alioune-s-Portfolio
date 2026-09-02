/* ============================================================
   profile.js
   Pagina profilo, visibile solo a chi ha effettuato l'accesso.
   Mostra i dati dell'utente, permette di modificarli e gestisce
   il logout.

   E' la pagina che dimostra i due stati dell'interfaccia: da
   loggati si vede il profilo, da visitatori un invito ad
   accedere. La protezione e' solo lato client e serve a
   mostrare il meccanismo: chi apre il file sorgente vede tutto
   comunque. In un'applicazione vera il controllo starebbe sul
   server, che senza sessione valida non invierebbe i dati.
   ============================================================ */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("profile");

  /* I due blocchi esistono entrambi nell'HTML. Non ne creiamo uno
     al volo: mostriamo quello giusto togliendo la classe hidden. */
  const authContent = document.getElementById("auth-content");
  const guestContent = document.getElementById("guest-content");

  if (Auth.isLoggedIn()) {
    authContent.classList.remove("hidden");
    guestContent.classList.add("hidden");

    /* getUser legge da localStorage e restituisce
       { username, name, email, role }. */
    const user = Auth.getUser();

    /* Caso limite: il flag di login c'e' ma i dati mancano, ad
       esempio se qualcuno ha cancellato solo una delle due chiavi.
       Meglio fermarsi che proseguire con user uguale a null. */
    if (!user) {
      showToast("Errore nel caricamento del profilo", "error");
      return;
    }

    /* L'ordine conta: setupEditButton cerca un bottone che
       renderProfileDetails ha appena creato. Invertendo le due
       chiamate non troverebbe nulla. */
    renderProfileHeader(user);
    renderProfileDetails(user);
    setupEditButton();
    setupEditForm(user);
    setupLogoutButton();
  } else {
    authContent.classList.add("hidden");
    guestContent.classList.remove("hidden");
  }
});

/* ============================================================
   INTESTAZIONE DEL PROFILO
   ============================================================ */

/**
 * Costruisce l'intestazione con foto, nome, email e ruolo.
 * Gli id displayName, displayEmail e displayRole servono al form
 * di modifica per aggiornare i valori a schermo dopo il salvataggio.
 * @param {object} user dati dell'utente loggato
 */
const renderProfileHeader = (user) => {
  const headerContainer = document.getElementById("profile-header");

  const profileImage = "assets/profile.png";

  headerContainer.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar">
        <img src="${profileImage}" alt="${user.name} profile photo" />
      </div>
      <div class="profile-info">
        <h2 id="displayName">${user.name}</h2>
        <p id="displayEmail">${user.email}</p>
        <p id="displayRole" class="text-accent">${user.role}</p>
        <span class="profile-badge">&#10003; Verified</span>
      </div>
    </div>
  `;
};

/* ============================================================
   CARD DEL PROFILO

   Qui usiamo createElement invece di innerHTML. E' piu' lungo da
   scrivere ma inserisce i testi con textContent, che non
   interpreta l'HTML: se un utente salvasse un tag dentro il
   proprio nome, comparirebbe come testo invece di essere eseguito.
   ============================================================ */

/**
 * Crea la griglia con le tre card informative.
 * @param {object} user dati dell'utente loggato
 */
const renderProfileDetails = (user) => {
  const detailsContainer = document.getElementById("profile-details");

  const grid = document.createElement("div");
  grid.className = "grid grid--3 mt-3";

  /* Ogni card e' costruita da una funzione dedicata: tenerle
     separate rende chiaro cosa contiene ciascuna senza dover
     leggere un blocco unico lungo cento righe. */
  grid.appendChild(createAboutCard(user));
  grid.appendChild(createActivityCard());
  grid.appendChild(createSettingsCard());

  /* Un solo appendChild alla fine: la griglia e' stata composta in
     memoria, quindi il browser ridisegna la pagina una volta sola
     invece che a ogni card aggiunta. */
  detailsContainer.appendChild(grid);
};

/**
 * Card "About": biografia e tag delle competenze.
 * @param {object} user dati dell'utente loggato
 * @returns {HTMLElement} la card pronta da inserire
 */
const createAboutCard = (user) => {
  const card = document.createElement("div");
  card.className = "card fade-in visible";

  const title = document.createElement("h3");
  title.textContent = "About";
  card.appendChild(title);

  const bio = document.createElement("p");
  bio.className = "mt-2";

  /* Il testo si adatta ai dati dell'utente. E' spezzato su piu'
     righe con la concatenazione per non superare la larghezza
     leggibile del file. */
  bio.textContent = `Ciao! Sono ${user.name}, appassionato di tecnologia e sviluppo software. ` +
    `Attualmente lavoro come ${user.role}, con focus su architetture cloud, ` +
    `backend scalabili e best practices di sviluppo.`;
  card.appendChild(bio);

  const tagsContainer = document.createElement("div");
  tagsContainer.className = "card__tags mt-2";

  const skills = ["Cloud Computing", "Backend", "DevOps", "Python"];

  skills.forEach((skill) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = skill;
    tagsContainer.appendChild(tag);
  });

  card.appendChild(tagsContainer);

  return card;
};

/**
 * Card "Activity": elenco delle attivita' recenti.
 * I dati sono fissi perche' non c'e' un backend che li registri.
 * @returns {HTMLElement} la card pronta da inserire
 */
const createActivityCard = () => {
  const card = document.createElement("div");
  card.className = "card fade-in visible";

  const title = document.createElement("h3");
  title.textContent = "Activity";
  card.appendChild(title);

  const activities = [
    { text: "Aggiornato il progetto Portfolio", time: "2 ore fa" },
    { text: "Completata certificazione AWS", time: "3 giorni fa" },
    { text: "Nuovo commit su GitHub", time: "1 settimana fa" },
    { text: "Pubblicato articolo su DevOps", time: "2 settimane fa" }
  ];

  /* ul e li perche' e' una lista vera: gli screen reader
     annunciano il numero di voci, cosa che con dei div non
     succederebbe. Lo stile e' tutto nelle classi CSS. */
  const list = document.createElement("ul");
  list.className = "profile-activity mt-2";

  activities.forEach((activity) => {
    const li = document.createElement("li");
    li.className = "profile-activity__item";

    const actText = document.createElement("span");
    actText.className = "profile-activity__text";
    actText.textContent = activity.text;

    const actTime = document.createElement("span");
    actTime.className = "profile-activity__time";
    actTime.textContent = activity.time;

    li.appendChild(actText);
    li.appendChild(actTime);

    list.appendChild(li);
  });

  card.appendChild(list);

  return card;
};

/**
 * Card "Settings": bottoni per modificare il profilo e uscire.
 * I listener non sono collegati qui ma in setupEditButton e
 * setupLogoutButton, chiamate dopo che la card e' nel DOM.
 * @returns {HTMLElement} la card pronta da inserire
 */
const createSettingsCard = () => {
  const card = document.createElement("div");
  card.className = "card fade-in visible";

  const title = document.createElement("h3");
  title.textContent = "Settings";
  card.appendChild(title);

  const desc = document.createElement("p");
  desc.className = "mt-2";
  desc.textContent = "Gestisci il tuo account e le preferenze del profilo.";
  card.appendChild(desc);

  const btnContainer = document.createElement("div");
  btnContainer.className = "profile-actions mt-2";

  const editBtn = document.createElement("button");
  editBtn.className = "btn btn--outline btn--small";
  editBtn.id = "editProfileBtn";
  editBtn.textContent = "Modifica Profilo";
  btnContainer.appendChild(editBtn);

  const logoutBtn = document.createElement("button");
  logoutBtn.className = "btn btn--danger btn--small";
  logoutBtn.id = "logoutBtn";
  logoutBtn.textContent = "Logout";
  btnContainer.appendChild(logoutBtn);

  card.appendChild(btnContainer);

  return card;
};

/* ============================================================
   APERTURA DELL'EDITOR
   ============================================================ */

/** Collega il bottone che mostra e nasconde il form di modifica. */
const setupEditButton = () => {
  const editBtn = document.getElementById("editProfileBtn");

  if (editBtn) {
    editBtn.addEventListener("click", () => {
      const editSection = document.getElementById("edit-section");

      editSection.classList.toggle("hidden");

      /* Il testo del bottone segue lo stato della sezione, cosi'
         l'utente sa sempre cosa succede al prossimo click. */
      if (editSection.classList.contains("hidden")) {
        editBtn.textContent = "Modifica Profilo";
      } else {
        editBtn.textContent = "Chiudi Editor";
      }
    });
  }
};

/* ============================================================
   FORM DI MODIFICA
   ============================================================ */

/**
 * Precompila il form, valida i campi e salva le modifiche.
 * @param {object} user dati attuali dell'utente
 */
const setupEditForm = (user) => {
  const form = document.getElementById("editProfileForm");

  const nameInput = document.getElementById("editName");
  const emailInput = document.getElementById("editEmail");
  const roleInput = document.getElementById("editRole");

  /* Campi precompilati: modificare un dato e' piu' comodo che
     riscriverlo da zero. */
  nameInput.value = user.name;
  emailInput.value = user.email;
  roleInput.value = user.role;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newName = nameInput.value.trim();
    const newEmail = emailInput.value.trim();
    const newRole = roleInput.value.trim();

    /* Puliamo gli errori del tentativo precedente, altrimenti
       resterebbero segnati campi ormai corretti. */
    clearFormErrors();

    let isValid = true;

    if (newName.length === 0) {
      showFieldError("editName", "nameError");
      isValid = false;
    }

    /* Controllo di forma sull'email: c'e' del testo, una chiocciola,
       altro testo, un punto e un dominio. */
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(newEmail)) {
      showFieldError("editEmail", "emailError");
      isValid = false;
    }

    if (newRole.length === 0) {
      showFieldError("editRole", "roleError");
      isValid = false;
    }

    /* Uscita anticipata: senza return il codice sotto salverebbe
       comunque i dati sbagliati. */
    if (!isValid) {
      showToast("Correggi gli errori nel form", "error");
      return;
    }

    /* Aggiornamento immediato di quello che si vede a schermo. */
    const displayName = document.getElementById("displayName");
    const displayEmail = document.getElementById("displayEmail");
    const displayRole = document.getElementById("displayRole");

    displayName.textContent = newName;
    displayEmail.textContent = newEmail;
    displayRole.textContent = newRole;

    /* Salvataggio nel localStorage tramite Auth.updateUser, definita
       in app.js. Senza questa riga la modifica resterebbe solo
       visiva e sparirebbe al primo reload della pagina. */
    Auth.updateUser({ name: newName, email: newEmail, role: newRole });

    /* Chiudiamo l'editor e riportiamo il bottone allo stato
       iniziale: il lavoro e' finito. */
    const editSection = document.getElementById("edit-section");
    editSection.classList.add("hidden");

    const editBtn = document.getElementById("editProfileBtn");

    if (editBtn) {
      editBtn.textContent = "Modifica Profilo";
    }

    showToast("Profilo aggiornato con successo", "success");
  });

  /* Bottone Annulla: chiude senza salvare. */
  const cancelBtn = document.getElementById("cancelEditBtn");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      /* Rimettiamo nei campi i valori mostrati a schermo, che sono
         quelli salvati: cosi' le modifiche scritte ma non
         confermate vengono buttate via. */
      nameInput.value = document.getElementById("displayName").textContent;
      emailInput.value = document.getElementById("displayEmail").textContent;
      roleInput.value = document.getElementById("displayRole").textContent;

      const editSection = document.getElementById("edit-section");
      editSection.classList.add("hidden");

      const editBtn = document.getElementById("editProfileBtn");

      if (editBtn) {
        editBtn.textContent = "Modifica Profilo";
      }

      clearFormErrors();
    });
  }
};

/* ============================================================
   SUPPORTO ALLA VALIDAZIONE
   ============================================================ */

/**
 * Segnala un campo come non valido.
 * Riceve gli id invece degli elementi perche' i messaggi sono
 * gia' scritti nell'HTML: qui basta renderli visibili.
 * @param {string} inputId id del campo
 * @param {string} errorId id dello span con il messaggio
 */
const showFieldError = (inputId, errorId) => {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  input.classList.add("input-error");
  error.classList.add("visible");
};

/**
 * Toglie tutti gli errori dal form di modifica.
 * Il selettore parte da #editProfileForm per non toccare per
 * sbaglio i campi di altri form presenti nella pagina.
 */
const clearFormErrors = () => {
  const errorInputs = document.querySelectorAll("#editProfileForm .input-error");

  errorInputs.forEach((input) => {
    input.classList.remove("input-error");
  });

  const errorMessages = document.querySelectorAll("#editProfileForm .form-error");

  errorMessages.forEach((msg) => {
    msg.classList.remove("visible");
  });
};

/* ============================================================
   LOGOUT
   ============================================================ */

/** Collega il bottone di uscita nella card Settings. */
const setupLogoutButton = () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      /* Cancella le chiavi dal localStorage: al prossimo controllo
         isLoggedIn restituira' false. */
      Auth.logout();

      showToast("Logout effettuato con successo", "success");

      /* Un secondo di attesa per far leggere il messaggio prima del
         cambio pagina. Dalla pagina profilo si esce verso il login,
         perche' senza sessione qui non ci sarebbe piu' nulla da
         mostrare. */
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    });
  }
};
