/* ============================================================
   profile.js — Pagina profilo: visibile solo da loggati.
   Mostra dati utente, permette modifica e gestisce logout.
   ============================================================ */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("profile");

  const authContent = document.getElementById("auth-content");
  const guestContent = document.getElementById("guest-content");

  if (Auth.isLoggedIn()) {
    authContent.classList.remove("hidden");
    guestContent.classList.add("hidden");

    const user = Auth.getUser();

    if (!user) {
      showToast("Errore nel caricamento del profilo", "error");
      return;
    }

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

/* ---- INTESTAZIONE PROFILO ---- */

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

/* ---- CARD DEL PROFILO ----
   Usa createElement + textContent (piu' sicuro di innerHTML). */

const renderProfileDetails = (user) => {
  const detailsContainer = document.getElementById("profile-details");

  const grid = document.createElement("div");
  grid.className = "grid grid--3 mt-3";

  grid.appendChild(createAboutCard(user));
  grid.appendChild(createActivityCard());
  grid.appendChild(createSettingsCard());

  detailsContainer.appendChild(grid);
};

/** Card "About": bio e tag competenze. */
const createAboutCard = (user) => {
  const card = document.createElement("div");
  card.className = "card fade-in visible";

  const title = document.createElement("h3");
  title.textContent = "About";
  card.appendChild(title);

  const bio = document.createElement("p");
  bio.className = "mt-2";
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

/** Card "Activity": attivita' recenti (dati fissi, no backend). */
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

/** Card "Settings": bottoni modifica e logout. */
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

/* ---- APERTURA EDITOR ---- */

const setupEditButton = () => {
  const editBtn = document.getElementById("editProfileBtn");

  if (editBtn) {
    editBtn.addEventListener("click", () => {
      const editSection = document.getElementById("edit-section");
      editSection.classList.toggle("hidden");

      editBtn.textContent = editSection.classList.contains("hidden")
        ? "Modifica Profilo"
        : "Chiudi Editor";
    });
  }
};

/* ---- FORM DI MODIFICA ---- */

const setupEditForm = (user) => {
  const form = document.getElementById("editProfileForm");

  const nameInput = document.getElementById("editName");
  const emailInput = document.getElementById("editEmail");
  const roleInput = document.getElementById("editRole");

  /* Campi precompilati con i dati attuali. */
  nameInput.value = user.name;
  emailInput.value = user.email;
  roleInput.value = user.role;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newName = nameInput.value.trim();
    const newEmail = emailInput.value.trim();
    const newRole = roleInput.value.trim();

    clearFormErrors();

    let isValid = true;

    if (newName.length === 0) { showFieldError("editName", "nameError"); isValid = false; }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(newEmail)) { showFieldError("editEmail", "emailError"); isValid = false; }

    if (newRole.length === 0) { showFieldError("editRole", "roleError"); isValid = false; }

    if (!isValid) {
      showToast("Correggi gli errori nel form", "error");
      return;
    }

    /* Aggiorna la UI e il localStorage. */
    document.getElementById("displayName").textContent = newName;
    document.getElementById("displayEmail").textContent = newEmail;
    document.getElementById("displayRole").textContent = newRole;

    Auth.updateUser({ name: newName, email: newEmail, role: newRole });

    document.getElementById("edit-section").classList.add("hidden");

    const editBtn = document.getElementById("editProfileBtn");
    if (editBtn) editBtn.textContent = "Modifica Profilo";

    showToast("Profilo aggiornato con successo", "success");
  });

  /* Bottone Annulla: chiude senza salvare. */
  const cancelBtn = document.getElementById("cancelEditBtn");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      nameInput.value = document.getElementById("displayName").textContent;
      emailInput.value = document.getElementById("displayEmail").textContent;
      roleInput.value = document.getElementById("displayRole").textContent;

      document.getElementById("edit-section").classList.add("hidden");

      const editBtn = document.getElementById("editProfileBtn");
      if (editBtn) editBtn.textContent = "Modifica Profilo";

      clearFormErrors();
    });
  }
};

/* ---- SUPPORTO VALIDAZIONE ---- */

/** Segnala un campo come non valido (riceve ID). */
const showFieldError = (inputId, errorId) => {
  document.getElementById(inputId).classList.add("input-error");
  document.getElementById(errorId).classList.add("visible");
};

/** Rimuove tutti gli errori dal form di modifica. */
const clearFormErrors = () => {
  document.querySelectorAll("#editProfileForm .input-error").forEach((input) => {
    input.classList.remove("input-error");
  });

  document.querySelectorAll("#editProfileForm .form-error").forEach((msg) => {
    msg.classList.remove("visible");
  });
};

/* ---- LOGOUT ---- */

const setupLogoutButton = () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      Auth.logout();
      showToast("Logout effettuato con successo", "success");
      setTimeout(() => { window.location.href = "login.html"; }, 1000);
    });
  }
};
