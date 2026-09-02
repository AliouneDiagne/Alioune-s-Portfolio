/* ============================================================
   certifications.js
   Pagina certificazioni: card espandibili, dashboard delle
   competenze con barre animate e form di verifica.

   Dati e presentazione sono separati. Gli array qui sotto
   descrivono solo il contenuto; le funzioni di rendering lo
   trasformano in HTML. Per aggiungere una certificazione basta
   una voce nell'array, senza toccare il resto del codice.
   ============================================================ */

"use strict";

/* Icone e separatori non sono scritti come caratteri speciali ma
   come escape Unicode e HTML entity: il file resta in puro ASCII e
   non dipende dalla codifica con cui viene aperto.
   \u{FE0F} chiede al browser la versione a colori del simbolo,
   &middot; e' il punto centrale che separa le voci. */

const certifications = [
  {
    name: "CompTIA Security+",
    issuer: "CompTIA",
    date: "2024",
    icon: "\u{1F6E1}\u{FE0F}",
    description: "Industry-leading certification validating baseline security skills. Covers network security, threat management, cryptography, identity management, and security infrastructure.",
    topics: ["Network Security", "Threat Analysis", "Cryptography", "Risk Management"]
  },
  {
    name: "AWS Solutions Architect",
    issuer: "Amazon Web Services",
    date: "2024",
    icon: "\u{2601}\u{FE0F}",
    description: "Professional certification for designing distributed systems on AWS. Covers EC2, S3, Lambda, VPC, IAM, CloudFormation, and architectural best practices.",
    topics: ["Cloud Architecture", "AWS Services", "Scalability", "High Availability"]
  }
];

/* Competenze raggruppate per area. La proprieta' priority decide
   quanto risalto dare alla categoria nel CSS, mentre percentage
   guida la lunghezza della barra. */

const skills = [
  {
    name: "Cloud & Infrastructure",
    icon: "\u{2601}",
    priority: "primary",
    skills: [
      { name: "AWS", label: "Cloud infrastructure", percentage: 85, details: "EC2 &middot; S3 &middot; IAM &middot; VPC &middot; CloudWatch" },
      { name: "Linux", label: "Systems administration", percentage: 82, details: "CLI &middot; permissions &middot; processes &middot; networking" },
      { name: "Docker", label: "Containerization", percentage: 80, details: "Images &middot; containers &middot; Compose &middot; registries" },
      { name: "Kubernetes", label: "Orchestration", percentage: 72, details: "Deployments &middot; services &middot; config &middot; scaling" },
      { name: "Terraform", label: "Infrastructure as Code", percentage: 70, details: "Providers &middot; modules &middot; state &middot; planning" },
      { name: "Networking", label: "Network foundations", percentage: 72, details: "TCP/IP &middot; DNS &middot; HTTP &middot; security groups" }
    ]
  },
  {
    name: "DevOps & Automation",
    icon: "\u{2699}",
    priority: "primary",
    skills: [
      { name: "Git / GitHub", label: "Version control", percentage: 88, details: "Branches &middot; pull requests &middot; workflows" },
      { name: "CI/CD", label: "Continuous delivery", percentage: 80, details: "Builds &middot; tests &middot; releases &middot; pipelines" },
      { name: "GitHub Actions", label: "Workflow automation", percentage: 78, details: "Jobs &middot; runners &middot; secrets &middot; artifacts" },
      { name: "Jenkins", label: "Pipeline automation", percentage: 70, details: "Agents &middot; stages &middot; build automation" },
      { name: "Infrastructure as Code", label: "Repeatable environments", percentage: 70, details: "Declarative config &middot; versioned infrastructure" }
    ]
  },
  {
    name: "Backend Development",
    icon: "\u{26A1}",
    priority: "primary",
    skills: [
      { name: "Java", label: "Backend engineering", percentage: 90, details: "OOP &middot; design patterns &middot; enterprise services" },
      { name: "Spring Boot", label: "Application framework", percentage: 85, details: "REST &middot; security &middot; dependency injection" },
      { name: "Python", label: "Automation and services", percentage: 80, details: "APIs &middot; scripting &middot; data processing" },
      { name: "Node.js", label: "Server-side JavaScript", percentage: 75, details: "Services &middot; async I/O &middot; APIs" },
      { name: "REST APIs", label: "Service design", percentage: 88, details: "Resources &middot; authentication &middot; documentation" },
      { name: "PostgreSQL", label: "Relational data", percentage: 85, details: "SQL &middot; schemas &middot; queries &middot; optimization" }
    ]
  },
  {
    name: "Frontend Development",
    icon: "\u{25C7}",
    priority: "secondary",
    skills: [
      { name: "JavaScript", label: "Browser applications", percentage: 75, details: "DOM &middot; Fetch API &middot; events &middot; modules" },
      { name: "HTML/CSS", label: "Accessible interfaces", percentage: 75, details: "Semantic HTML &middot; responsive CSS &middot; layouts" },
      { name: "React", label: "Component interfaces", percentage: 65, details: "Components &middot; state &middot; modern UI patterns" }
    ]
  }
];

/* ============================================================
   CARD DELLE CERTIFICAZIONI
   ============================================================ */

/** Crea una card per ogni certificazione e la rende espandibile. */
const renderCertifications = () => {
  const container = document.getElementById("certs-container");
  if (!container) return;

  certifications.forEach((cert) => {
    const card = document.createElement("div");

    /* fade-in insieme a visible: queste card nascono dopo che
       IntersectionObserver ha gia' controllato la pagina, quindi
       senza visible resterebbero invisibili. */
    card.className = "cert-card fade-in visible";

    card.innerHTML = `
      <div class="cert-card__header">
        <span class="cert-card__icon">${cert.icon}</span>
        <div>
          <h3 class="cert-card__name">${cert.name}</h3>
          <p class="cert-card__issuer">${cert.issuer} &mdash; ${cert.date}</p>
        </div>
      </div>
      <p class="cert-card__summary">Click to see details</p>
      <div class="cert-card__details">
        <p class="cert-card__description">${cert.description}</p>
        <div class="cert-card__topics">
          ${cert.topics.map((topic) => `<span class="cert-card__topic">${topic}</span>`).join("")}
        </div>
      </div>
    `;

    /* Il listener va aggiunto qui, non fuori dal ciclo: ogni card
       deve aprire i propri dettagli, e la variabile card cambia a
       ogni giro. */
    card.addEventListener("click", () => {
      const details = card.querySelector(".cert-card__details");

      /* Il CSS anima max-height tra 0 e un valore pieno. Con
         display:none non ci sarebbe nessuna transizione, perche'
         un elemento nascosto cosi' non ha altezza da animare. */
      details.classList.toggle("expanded");

      const summary = card.querySelector(".cert-card__summary");

      /* contains legge lo stato dopo il toggle e aggiorna il
         testo dell'invito al click. */
      if (details.classList.contains("expanded")) {
        summary.textContent = "Click to hide details";
      } else {
        summary.textContent = "Click to see details";
      }
    });

    container.appendChild(card);
  });
};

/* ============================================================
   DASHBOARD DELLE COMPETENZE
   ============================================================ */

/** Crea le categorie, le voci cliccabili e anima le barre. */
const renderSkills = () => {
  const container = document.getElementById("skills-container");
  if (!container) return;

  /* forEach passa anche l'indice: qui serve a scaglionare le
     animazioni categoria per categoria. */
  skills.forEach((category, categoryIndex) => {
    const categoryCard = document.createElement("article");
    categoryCard.className = `skill-category skill-category--${category.priority} fade-in visible`;

    categoryCard.innerHTML = `
      <header class="skill-category__header">
        <span class="skill-category__icon">${category.icon}</span>
        <div>
          <p class="skill-category__eyebrow">Technical focus</p>
          <h3>${category.name}</h3>
        </div>
      </header>
      <div class="skill-category__list"></div>
    `;

    const list = categoryCard.querySelector(".skill-category__list");

    category.skills.forEach((skill, skillIndex) => {
      /* button e non div: l'elemento e' cliccabile, quindi deve
         essere raggiungibile con il tasto Tab e attivabile con
         Invio. Un div andrebbe reso accessibile a mano. */
      const skillItem = document.createElement("button");

      /* Dentro un form un button vale submit: type="button" evita
         invii non voluti se un giorno la dashboard finisse in un form. */
      skillItem.type = "button";
      skillItem.className = "skill-item";

      /* aria-expanded comunica agli screen reader se i dettagli
         sono aperti. Va tenuto allineato allo stato reale. */
      skillItem.setAttribute("aria-expanded", "false");

      /* La barra e' decorativa: il valore e' gia' scritto in cifre
         accanto al nome, quindi aria-hidden la esclude dalla
         lettura per non ripetere la stessa informazione. */
      skillItem.innerHTML = `
        <span class="skill-item__topline">
          <span><strong>${skill.name}</strong><small>${skill.label}</small></span>
          <b>${skill.percentage}%</b>
        </span>
        <span class="skill-item__track" aria-hidden="true"><span class="skill-item__fill"></span></span>
        <span class="skill-item__details">${skill.details}</span>
      `;

      const fill = skillItem.querySelector(".skill-item__fill");

      skillItem.addEventListener("click", () => {
        /* toggle restituisce true se la classe e' stata aggiunta,
           quindi ci dice subito lo stato nuovo. */
        const expanded = skillItem.classList.toggle("is-expanded");

        /* setAttribute vuole una stringa: String() converte il
           booleano in "true" o "false". */
        skillItem.setAttribute("aria-expanded", String(expanded));

        const details = skillItem.querySelector(".skill-item__details");
        details.style.maxHeight = expanded ? "3rem" : "0";
        details.style.paddingTop = expanded ? "0.65rem" : "0";
        details.style.opacity = expanded ? "1" : "0";
      });

      list.appendChild(skillItem);

      /* Le barre partono con un ritardo crescente, cosi' si
         riempiono a cascata invece che tutte insieme.
         scaleX ridimensiona la barra senza cambiarne la larghezza
         reale: il browser lo gestisce sulla scheda grafica e
         l'animazione resta fluida. transformOrigin la fa crescere
         da sinistra invece che dal centro. */
      setTimeout(() => {
        fill.style.width = "100%";
        fill.style.transform = `scaleX(${skill.percentage / 100})`;
        fill.style.transformOrigin = "left center";
      }, (categoryIndex * 100) + (skillIndex * 70));
    });

    container.appendChild(categoryCard);
  });
};

/* ============================================================
   FORM DI VERIFICA CERTIFICAZIONE
   ============================================================ */

/** Collega la validazione al form, sia mentre si scrive sia al submit. */
const initFormValidation = () => {
  const form = document.getElementById("certVerifyForm");
  if (!form) return;

  const certNameInput = document.getElementById("certName");
  const certIdInput = document.getElementById("certId");
  const certOrgSelect = document.getElementById("certOrg");

  const certNameError = document.getElementById("certNameError");
  const certIdError = document.getElementById("certIdError");
  const certOrgError = document.getElementById("certOrgError");

  /**
   * Controlla che un campo non sia vuoto e aggiorna l'interfaccia.
   * @param {HTMLElement} input campo da controllare
   * @param {HTMLElement} errorSpan messaggio di errore collegato
   * @returns {boolean} true se il campo e' compilato
   */
  const validateField = (input, errorSpan) => {
    const value = input.value.trim();

    if (value === "") {
      errorSpan.classList.add("visible");
      input.classList.add("input-error");
      return false;
    }

    errorSpan.classList.remove("visible");
    input.classList.remove("input-error");
    return true;
  };

  /**
   * Controlla la forma dell'ID: un gruppo di lettere o numeri, un
   * trattino e almeno un altro gruppo. Esempio: COMP001-2024-XXXX.
   * @param {string} id valore da controllare
   * @returns {boolean} true se il formato e' corretto
   */
  const validateCertIdFormat = (id) => {
    /* ^ e $ ancorano il pattern a inizio e fine stringa: senza,
       basterebbe una parte qualsiasi del testo a farlo passare. */
    const pattern = /^[A-Za-z0-9]+-[A-Za-z0-9-]+$/;
    return pattern.test(id) && id.length >= 4;
  };

  /* Validazione a ogni tasto premuto. */

  certNameInput.addEventListener("input", () => {
    validateField(certNameInput, certNameError);
  });

  /* L'ID ha due errori possibili, vuoto o mal formattato, quindi
     non basta validateField: cambiamo anche il testo del messaggio
     per dire all'utente qual e' il problema. */
  certIdInput.addEventListener("input", () => {
    const value = certIdInput.value.trim();

    if (value === "") {
      certIdError.textContent = "Please enter a valid certification ID";
      certIdError.classList.add("visible");
      certIdInput.classList.add("input-error");
    } else if (!validateCertIdFormat(value)) {
      certIdError.textContent = "ID format: XXXX-XXXX (use letters, numbers, and hyphens)";
      certIdError.classList.add("visible");
      certIdInput.classList.add("input-error");
    } else {
      certIdError.classList.remove("visible");
      certIdInput.classList.remove("input-error");
    }
  });

  /* Sulla select l'evento input scatta alla scelta dell'opzione,
     come change. Lo usiamo per coerenza con gli altri campi. */
  certOrgSelect.addEventListener("input", () => {
    validateField(certOrgSelect, certOrgError);
  });

  /* ---- Controllo finale al submit ---- */

  form.addEventListener("submit", (e) => {
    /* Blocca l'invio al server e il ricaricamento della pagina. */
    e.preventDefault();

    let isValid = true;

    if (!validateField(certNameInput, certNameError)) {
      isValid = false;
    }

    const certIdValue = certIdInput.value.trim();

    if (certIdValue === "") {
      certIdError.textContent = "Please enter a valid certification ID";
      certIdError.classList.add("visible");
      certIdInput.classList.add("input-error");
      isValid = false;
    } else if (!validateCertIdFormat(certIdValue)) {
      certIdError.textContent = "ID format: XXXX-XXXX (use letters, numbers, and hyphens)";
      certIdError.classList.add("visible");
      certIdInput.classList.add("input-error");
      isValid = false;
    } else {
      certIdError.classList.remove("visible");
      certIdInput.classList.remove("input-error");
    }

    if (!validateField(certOrgSelect, certOrgError)) {
      isValid = false;
    }

    if (isValid) {
      const formData = {
        certName: certNameInput.value.trim(),
        certId: certIdValue,
        certOrg: certOrgSelect.value
      };

      /* Invio simulato: i dati finiscono nella console del browser.
         Con un backend vero partirebbe una fetch verso il servizio
         di verifica dell'ente emittente. */
      console.log("Verification request submitted:", formData);

      showToast("Verification request submitted", "success");

      form.reset();

      /* reset svuota i campi ma lascia le classi aggiunte da noi:
         senza questo ciclo i bordi rossi resterebbero su campi
         ormai vuoti. */
      [certNameInput, certIdInput, certOrgSelect].forEach((input) => {
        input.classList.remove("input-error");
      });
    } else {
      showToast("Please fix the errors in the form before submitting", "error");
    }
  });
};

/* ============================================================
   AVVIO
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("certifications");
  renderCertifications();
  renderSkills();
  initFormValidation();

  /* Va chiamata dopo il rendering: IntersectionObserver puo'
     osservare solo elementi gia' presenti nel DOM. */
  initScrollAnimations();
});
