/* ============================================================
   certifications.js — Card certificazioni, dashboard competenze
   e form di verifica. Dati e rendering separati.
   ============================================================ */

"use strict";

/* Icone come escape Unicode; &middot; come separatore. */

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

/* Competenze raggruppate per area. priority → stile CSS, percentage → larghezza barra. */

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

/* ---- CARD CERTIFICAZIONI ---- */

const renderCertifications = () => {
  const container = document.getElementById("certs-container");
  if (!container) return;

  certifications.forEach((cert) => {
    const card = document.createElement("div");
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

    /* Toggle espansione al click. */
    card.addEventListener("click", () => {
      const details = card.querySelector(".cert-card__details");
      details.classList.toggle("expanded");

      const summary = card.querySelector(".cert-card__summary");
      summary.textContent = details.classList.contains("expanded")
        ? "Click to hide details"
        : "Click to see details";
    });

    container.appendChild(card);
  });
};

/* ---- DASHBOARD COMPETENZE ---- */

const renderSkills = () => {
  const container = document.getElementById("skills-container");
  if (!container) return;

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
      const skillItem = document.createElement("button");
      skillItem.type = "button";
      skillItem.className = "skill-item";
      skillItem.setAttribute("aria-expanded", "false");

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
        const expanded = skillItem.classList.toggle("is-expanded");
        skillItem.setAttribute("aria-expanded", String(expanded));

        const details = skillItem.querySelector(".skill-item__details");
        details.style.maxHeight = expanded ? "3rem" : "0";
        details.style.paddingTop = expanded ? "0.65rem" : "0";
        details.style.opacity = expanded ? "1" : "0";
      });

      list.appendChild(skillItem);

      /* Barre animate a cascata con ritardo crescente. */
      setTimeout(() => {
        fill.style.width = "100%";
        fill.style.transform = `scaleX(${skill.percentage / 100})`;
        fill.style.transformOrigin = "left center";
      }, (categoryIndex * 100) + (skillIndex * 70));
    });

    container.appendChild(categoryCard);
  });
};

/* ---- FORM DI VERIFICA ---- */

const initFormValidation = () => {
  const form = document.getElementById("certVerifyForm");
  if (!form) return;

  const certNameInput = document.getElementById("certName");
  const certIdInput = document.getElementById("certId");
  const certOrgSelect = document.getElementById("certOrg");

  const certNameError = document.getElementById("certNameError");
  const certIdError = document.getElementById("certIdError");
  const certOrgError = document.getElementById("certOrgError");

  /** Valida campo vuoto e aggiorna UI. */
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

  /** Controlla formato ID (es. COMP001-2024-XXXX). */
  const validateCertIdFormat = (id) => {
    const pattern = /^[A-Za-z0-9]+-[A-Za-z0-9-]+$/;
    return pattern.test(id) && id.length >= 4;
  };

  /* Validazione in tempo reale. */

  certNameInput.addEventListener("input", () => {
    validateField(certNameInput, certNameError);
  });

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

  certOrgSelect.addEventListener("input", () => {
    validateField(certOrgSelect, certOrgError);
  });

  /* Controllo finale al submit. */

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let isValid = true;

    if (!validateField(certNameInput, certNameError)) isValid = false;

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

    if (!validateField(certOrgSelect, certOrgError)) isValid = false;

    if (isValid) {
      const formData = {
        certName: certNameInput.value.trim(),
        certId: certIdValue,
        certOrg: certOrgSelect.value
      };

      /* Invio simulato — i dati vanno solo in console. */
      console.log("Verification request submitted:", formData);
      showToast("Verification request submitted", "success");
      form.reset();

      [certNameInput, certIdInput, certOrgSelect].forEach((input) => {
        input.classList.remove("input-error");
      });
    } else {
      showToast("Please fix the errors in the form before submitting", "error");
    }
  });
};

/* ---- AVVIO ---- */

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("certifications");
  renderCertifications();
  renderSkills();
  initFormValidation();
  initScrollAnimations();
});
