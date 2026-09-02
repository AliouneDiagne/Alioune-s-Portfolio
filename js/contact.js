/* ============================================================
   contact.js
   Form di contatto con validazione mentre si scrive, contatore
   di caratteri e invio simulato.

   Nessun dato parte davvero: senza backend il "submit" stampa
   l'oggetto in console e mostra una conferma a schermo.
   ============================================================ */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("contact");

  /* Tutti i riferimenti stanno dentro il callback perche' prima di
     DOMContentLoaded questi elementi non esistono ancora. */
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

  /* Deve restare uguale al maxlength della textarea nell'HTML.
     Come costante si cambia in un punto solo. */
  const MAX_CHARS = 500;

  /* Regex per l'email, dichiarata una volta e riusata nei due
     punti che la servono.
     Significato: almeno un carattere che non sia spazio o chiocciola,
     poi @, poi altri caratteri, poi un punto e infine il dominio.
     E' un controllo di forma, non di esistenza: solo l'invio di una
     mail di verifica puo' dire se un indirizzo esiste davvero. */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ============================================================
     CONTATORE DI CARATTERI
     ============================================================ */

  messageInput.addEventListener("input", () => {
    const currentLength = messageInput.value.length;

    charCounter.textContent = `${currentLength}/${MAX_CHARS} characters`;

    /* Sopra il 90% del limite il contatore diventa arancione, cosi'
       l'utente se ne accorge prima di trovarsi bloccato. */
    if (currentLength >= MAX_CHARS * 0.9) {
      charCounter.classList.add("char-counter--warning");
    } else {
      charCounter.classList.remove("char-counter--warning");
    }
  });

  /* ============================================================
     VALIDAZIONE

     Una sola funzione per tutti i campi: riceve gia' il risultato
     del controllo e si occupa solo di mostrarlo. La regola resta
     nel punto in cui viene chiamata, che cambia da campo a campo.
     ============================================================ */

  /**
   * Applica lo stato visivo di un campo.
   * @param {HTMLElement} fieldElement input o textarea da marcare
   * @param {boolean} isValid esito del controllo
   * @param {HTMLElement} errorElement span con il messaggio di errore
   * @returns {boolean} lo stesso isValid, per usarlo nelle condizioni
   */
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

  /* Validazione a ogni tasto: l'errore sparisce appena il campo
     diventa corretto, senza aspettare l'invio. */

  nameInput.addEventListener("input", () => {
    const value = nameInput.value.trim();
    validateField(nameInput, value.length >= 2, nameError);
  });

  emailInput.addEventListener("input", () => {
    const value = emailInput.value.trim();
    /* test() restituisce true se la stringa rispetta il pattern. */
    validateField(emailInput, emailRegex.test(value), emailError);
  });

  subjectInput.addEventListener("input", () => {
    const value = subjectInput.value.trim();
    validateField(subjectInput, value.length > 0, subjectError);
  });

  messageInput.addEventListener("input", () => {
    const value = messageInput.value.trim();
    validateField(messageInput, value.length >= 10, messageError);
  });

  /* ============================================================
     EVIDENZIAZIONE DEL CAMPO ATTIVO

     focus scatta quando si entra nel campo, blur quando lo si
     lascia. Nessuno dei due fa bubbling verso i genitori, quindi
     il listener va messo sui campi e non sul form.
     ============================================================ */

  /* querySelectorAll restituisce una NodeList: si scorre con
     forEach ma non ha i metodi degli array come map o filter. */
  const allFields = form.querySelectorAll("input, textarea");

  allFields.forEach((field) => {
    field.addEventListener("focus", () => {
      field.classList.add("input-focused");
    });

    field.addEventListener("blur", () => {
      field.classList.remove("input-focused");
    });
  });

  /* ============================================================
     INVIO DEL FORM
     ============================================================ */

  form.addEventListener("submit", (e) => {
    /* Il form ha l'attributo novalidate nell'HTML: disattiva i
       messaggi automatici del browser, che cambiano aspetto da un
       browser all'altro, e lascia il controllo a questo codice.
       preventDefault blocca il ricaricamento della pagina. */
    e.preventDefault();

    const nameValue = nameInput.value.trim();
    const emailValue = emailInput.value.trim();
    const subjectValue = subjectInput.value.trim();
    const messageValue = messageInput.value.trim();

    let isFormValid = true;

    /* Controlliamo tutti i campi senza fermarci al primo errore,
       cosi' l'utente li vede segnalati tutti insieme. Le chiamate
       sono separate proprio per questo: dentro un'unica condizione
       con && le successive non verrebbero eseguite. */
    if (!validateField(nameInput, nameValue.length >= 2, nameError)) {
      isFormValid = false;
    }

    if (!validateField(emailInput, emailRegex.test(emailValue), emailError)) {
      isFormValid = false;
    }

    if (!validateField(subjectInput, subjectValue.length > 0, subjectError)) {
      isFormValid = false;
    }

    if (!validateField(messageInput, messageValue.length >= 10, messageError)) {
      isFormValid = false;
    }

    if (isFormValid) {
      /* Oggetto con i dati raccolti. Con un backend vero questo
         sarebbe il corpo di una fetch in POST. */
      const formData = {
        name: nameValue,
        email: emailValue,
        subject: subjectValue,
        message: messageValue,
        timestamp: new Date().toISOString()
      };

      /* Invio simulato: i dati compaiono nella console del browser,
         raggiungibile con F12. */
      console.log("Form data submitted:", formData);

      showToast("Message sent successfully", "success");

      /* reset() riporta il form ai valori iniziali, ma non tocca le
         classi aggiunte da noi: vanno tolte a mano, altrimenti i
         bordi verdi resterebbero su campi ormai vuoti. */
      form.reset();

      allFields.forEach((field) => {
        field.classList.remove("input-success", "input-error");
      });

      charCounter.textContent = `0/${MAX_CHARS} characters`;
      charCounter.classList.remove("char-counter--warning");

      /* Se l'utente invia due volte di seguito, il messaggio
         precedente potrebbe essere ancora a schermo: lo togliamo
         per non ritrovarsi conferme accumulate. */
      const existingSuccess = form.parentElement.querySelector(".success-message");

      if (existingSuccess) {
        existingSuccess.remove();
      }

      /* Conferma costruita a runtime e inserita dopo il form. */
      const successDiv = document.createElement("div");
      successDiv.classList.add("success-message");

      successDiv.innerHTML = `
        <span class="success-message__icon">&#10004;</span>
        <p class="success-message__text">Thank you, ${nameValue}! Your message has been sent successfully. I'll get back to you soon.</p>
      `;

      form.parentElement.appendChild(successDiv);

      /* Il messaggio si toglie da solo dopo cinque secondi. Il
         controllo su parentNode evita l'errore se nel frattempo
         fosse gia' stato rimosso da un secondo invio. */
      setTimeout(() => {
        if (successDiv.parentNode) {
          successDiv.parentNode.removeChild(successDiv);
        }
      }, 5000);
    } else {
      showToast("Please fix the errors in the form", "error");
    }
  });
});
