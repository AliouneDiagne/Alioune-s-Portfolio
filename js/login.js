/* ============================================================
   login.js — Form di accesso con validazione e login simulato.
   Le credenziali sono in app.js (login finto, solo demo).
   ============================================================ */

"use strict";

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const usernameError = document.getElementById("usernameError");
const passwordError = document.getElementById("passwordError");
const submitBtn = document.getElementById("submitBtn");

/* Gia' loggato → redirect alla home. */
if (Auth.isLoggedIn()) {
  window.location.href = "index.html";
}

/* ---- FUNZIONI DI SUPPORTO ---- */

/** Mostra errore su un campo. */
function showFieldError(input, errorSpan, message) {
  errorSpan.textContent = message;
  errorSpan.classList.add("visible");
  input.classList.add("input-error");
  input.classList.remove("input-success");
}

/** Nasconde l'errore di un campo. */
function clearFieldError(input, errorSpan) {
  errorSpan.classList.remove("visible");
  input.classList.remove("input-error");
}

/** Segna un campo come valido (bordo verde). */
function markFieldSuccess(input, errorSpan) {
  errorSpan.classList.remove("visible");
  input.classList.remove("input-error");
  input.classList.add("input-success");
}

/** Valida tutti i campi, mostrando tutti gli errori insieme. */
function validateForm() {
  let isValid = true;

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

/** Stato di caricamento sul bottone. */
function setLoadingState(loading) {
  if (loading) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in...";
  } else {
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign In";
  }
}

/* ---- INVIO DEL FORM ---- */

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!validateForm()) return;

  setLoadingState(true);

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  const user = Auth.login(username, password);

  if (user) {
    showToast("Login successful. Welcome back, " + user.username, "success");
    setTimeout(function () { window.location.href = "profile.html"; }, 1000);
  } else {
    setLoadingState(false);
    showToast("Invalid username or password. Please try again.", "error");

    /* Animazione shake sul form (500ms, poi reset classe). */
    loginForm.classList.add("shake");
    setTimeout(function () { loginForm.classList.remove("shake"); }, 500);
  }
});

/* ---- VALIDAZIONE MENTRE SI SCRIVE ----
   Mostriamo solo il successo; gli errori restano al submit. */

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
