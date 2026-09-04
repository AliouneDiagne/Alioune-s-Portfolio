/* ============================================================
   contact.js — Form di contatto con validazione live,
   contatore caratteri e invio simulato (dati solo in console).
   ============================================================ */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("contact");

  const form = document.getElementById("contactForm");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const subjectInput = document.getElementById("subject");
  const messageInput = document.getElementById("message");

  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const subjectError = document.getElementById("subjectError");
  const messageError = document.getElementById("messageError");

  const charCounter = document.getElementById("charCounter");
  const MAX_CHARS = 500;

  /* Regex email: testo@testo.dominio (controllo di forma, non di esistenza). */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ---- CONTATORE CARATTERI ---- */

  messageInput.addEventListener("input", () => {
    const currentLength = messageInput.value.length;
    charCounter.textContent = `${currentLength}/${MAX_CHARS} characters`;

    if (currentLength >= MAX_CHARS * 0.9) {
      charCounter.classList.add("char-counter--warning");
    } else {
      charCounter.classList.remove("char-counter--warning");
    }
  });

  /* ---- VALIDAZIONE ---- */

  /** Applica lo stato visivo (valido/non valido) a un campo. */
  const validateField = (fieldElement, isValid, errorElement) => {
    if (isValid) {
      fieldElement.classList.remove("input-error");
      fieldElement.classList.add("input-success");
      errorElement.classList.remove("visible");
    } else {
      fieldElement.classList.add("input-error");
      fieldElement.classList.remove("input-success");
      errorElement.classList.add("visible");
    }

    return isValid;
  };

  /* Validazione in tempo reale a ogni tasto. */

  nameInput.addEventListener("input", () => {
    validateField(nameInput, nameInput.value.trim().length >= 2, nameError);
  });

  emailInput.addEventListener("input", () => {
    validateField(emailInput, emailRegex.test(emailInput.value.trim()), emailError);
  });

  subjectInput.addEventListener("input", () => {
    validateField(subjectInput, subjectInput.value.trim().length > 0, subjectError);
  });

  messageInput.addEventListener("input", () => {
    validateField(messageInput, messageInput.value.trim().length >= 10, messageError);
  });

  /* ---- FOCUS/BLUR ---- */

  const allFields = form.querySelectorAll("input, textarea");

  allFields.forEach((field) => {
    field.addEventListener("focus", () => field.classList.add("input-focused"));
    field.addEventListener("blur", () => field.classList.remove("input-focused"));
  });

  /* ---- INVIO DEL FORM ---- */

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameValue = nameInput.value.trim();
    const emailValue = emailInput.value.trim();
    const subjectValue = subjectInput.value.trim();
    const messageValue = messageInput.value.trim();

    let isFormValid = true;

    /* Controlliamo tutti i campi senza fermarci al primo errore. */
    if (!validateField(nameInput, nameValue.length >= 2, nameError)) isFormValid = false;
    if (!validateField(emailInput, emailRegex.test(emailValue), emailError)) isFormValid = false;
    if (!validateField(subjectInput, subjectValue.length > 0, subjectError)) isFormValid = false;
    if (!validateField(messageInput, messageValue.length >= 10, messageError)) isFormValid = false;

    if (isFormValid) {
      const formData = {
        name: nameValue,
        email: emailValue,
        subject: subjectValue,
        message: messageValue,
        timestamp: new Date().toISOString()
      };

      /* Invio simulato — dati in console. */
      console.log("Form data submitted:", formData);
      showToast("Message sent successfully", "success");

      form.reset();
      allFields.forEach((field) => field.classList.remove("input-success", "input-error"));
      charCounter.textContent = `0/${MAX_CHARS} characters`;
      charCounter.classList.remove("char-counter--warning");

      /* Rimuovi eventuale messaggio di successo precedente. */
      const existingSuccess = form.parentElement.querySelector(".success-message");
      if (existingSuccess) existingSuccess.remove();

      /* Conferma visiva sotto il form. */
      const successDiv = document.createElement("div");
      successDiv.classList.add("success-message");

      successDiv.innerHTML = `
        <span class="success-message__icon">&#10004;</span>
        <p class="success-message__text">Thank you, ${nameValue}! Your message has been sent successfully. I'll get back to you soon.</p>
      `;

      form.parentElement.appendChild(successDiv);

      /* Rimuovi dopo 5 secondi. */
      setTimeout(() => {
        if (successDiv.parentNode) successDiv.parentNode.removeChild(successDiv);
      }, 5000);
    } else {
      showToast("Please fix the errors in the form", "error");
    }
  });
});
