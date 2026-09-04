/* ============================================================
   home.js — Logica della homepage: typing, contatori, progetti
   da GitHub e card "What I Do".
   ============================================================ */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("home");
  renderFooter();

  initTypingEffect();
  initStatsAnimation();
  loadFeaturedProjects();
  initServiceCards();
});

/* ---- EFFETTO TYPING ---- */

const initTypingEffect = () => {
  const roles = [
    "Cloud Developer",
    "Backend Engineer",
    "AWS Certified",
    "Security Specialist"
  ];

  const typingElement = document.getElementById("typing-text");
  if (!typingElement) return;

  let currentIndex = 0;
  typingElement.textContent = roles[currentIndex];

  /* Cambia ruolo ogni 2 secondi, ciclando con il modulo. */
  setInterval(() => {
    currentIndex = (currentIndex + 1) % roles.length;
    typingElement.textContent = roles[currentIndex];
  }, 2000);
};

/* ---- CONTATORI ANIMATI ----
   I valori vengono da data-target nell'HTML. */

const initStatsAnimation = () => {
  const statNumbers = document.querySelectorAll(".stat__number");

  statNumbers.forEach((stat) => {
    const target = parseInt(stat.dataset.target, 10);
    const suffix = stat.dataset.suffix || "";
    let current = 0;
    const increment = Math.ceil(target / 30);

    const counter = setInterval(() => {
      current += increment;

      if (current >= target) {
        current = target;
        stat.textContent = `${current}${suffix}`;
        clearInterval(counter);
      } else {
        stat.textContent = `${current}${suffix}`;
      }
    }, 50);
  });
};

/* ---- DATI DI RISERVA ----
   Usati se la GitHub API non risponde (rete assente o rate limit). */

const fallbackProjects = [
  {
    name: "BodyPoseRec",
    description: "Computer Vision application for body pose recognition using machine learning techniques and real-time video processing.",
    html_url: "https://github.com/AliouneDiagne/BodyPoseRec",
    language: "Python",
    stargazers_count: 0,
    image: "assets/BodyPoseRec.png"
  },
  {
    name: "ridfix-backend",
    description: "Backend REST API for the Ridfix platform. Built with Java Spring Boot, featuring authentication, CRUD operations, and database integration.",
    html_url: "https://github.com/AliouneDiagne/ridfix-backend",
    language: "Java",
    stargazers_count: 0,
    image: "assets/ridfix-backend.png"
  },
  {
    name: "LuxCommand",
    description: "Application demonstrating Object-Oriented Design Patterns including Command, Observer, and Strategy patterns in Java.",
    html_url: "https://github.com/AliouneDiagne/LuxCommand",
    language: "Java",
    stargazers_count: 0,
    image: "assets/LuxCommand.jpg"
  },
  {
    name: "ridfix-ecommerce",
    description: "Full-stack e-commerce application with product catalog, shopping cart, and user authentication built with React.",
    html_url: "https://github.com/AliouneDiagne/ridfix-ecommerce",
    language: "React",
    stargazers_count: 0,
    image: "assets/ridfix-ecommerce.png"
  },
  {
    name: "ProgammingPrincipleExam",
    description: "Collection of programming exercises demonstrating core programming principles, data structures, and algorithms in Java.",
    html_url: "https://github.com/AliouneDiagne/ProgammingPrincipleExam",
    language: "Java",
    stargazers_count: 0,
    image: "assets/ProgammingPrincipleExam.png"
  }
];

/* Mappa nome-repo → immagine locale. */
const projectImages = {
  BodyPoseRec: "assets/BodyPoseRec.png",
  "ridfix-backend": "assets/ridfix-backend.png",
  LuxCommand: "assets/LuxCommand.jpg",
  "ridfix-ecommerce": "assets/ridfix-ecommerce.png",
  ProgammingPrincipleExam: "assets/ProgammingPrincipleExam.png"
};

/* ---- CARICAMENTO PROGETTI DA GITHUB ---- */

const loadFeaturedProjects = async () => {
  const projectsGrid = document.getElementById("projects-grid");
  const spinner = document.getElementById("projects-spinner");
  let projects;

  try {
    const response = await fetch(
      "https://api.github.com/users/AliouneDiagne/repos"
    );

    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status}`);
    }

    const repos = await response.json();

    /* Ultimi 3 aggiornati, con immagine locale aggiunta. */
    projects = repos
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 3)
      .map((project) => ({
        ...project,
        image: projectImages[project.name] || "assets/profile.png"
      }));
  } catch (error) {
    console.error("Errore nel caricamento dei progetti da GitHub:", error);
    projects = fallbackProjects.slice(0, 3);
    showToast("Progetti caricati dalla copia locale", "warning");
  } finally {
    if (spinner) spinner.remove();
  }

  renderProjectCards(projects, projectsGrid);
};

/* ---- CREAZIONE DELLE CARD ---- */

const renderProjectCards = (projects, container) => {
  projects.forEach((project) => {
    const {
      name,
      description,
      html_url: url,
      language,
      stargazers_count: stars,
      image
    } = project;

    const card = document.createElement("article");
    /* visible subito: IntersectionObserver ha gia' fatto il suo giro. */
    card.classList.add("project-card", "fade-in", "visible");

    card.innerHTML = `
      <div class="project-card__media">
        <img src="${image || 'assets/profile.png'}" alt="${name} project preview" loading="lazy">
      </div>
      <div class="project-card__content">
        <div class="project-card__header">
          <h3 class="project-card__title">${name}</h3>
          <span class="project-card__language">${language || "N/A"}</span>
        </div>
        <p class="project-card__description">
          ${description || "No description available."}
        </p>
        <div class="project-card__footer">
          <span class="project-card__stars">${stars || 0} stars</span>
          <a href="${url}" target="_blank" rel="noopener noreferrer"
             class="project-card__link">
            View on GitHub &rarr;
          </a>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
};

/* ---- CARD "WHAT I DO" ----
   Fisarmonica: un click apre i dettagli e chiude le altre. */

const initServiceCards = () => {
  const serviceCards = document.querySelectorAll(".services__card");

  serviceCards.forEach((card) => {
    card.addEventListener("click", (event) => {
      const details = card.querySelector(".services__details");
      if (!details) return;

      if (details.hidden) {
        /* Chiudi le altre prima di aprire questa. */
        serviceCards.forEach((otherCard) => {
          const otherDetails = otherCard.querySelector(".services__details");
          if (otherDetails && otherCard !== card) {
            otherDetails.hidden = true;
            otherCard.classList.remove("services__card--expanded");
          }
        });

        details.hidden = false;
        card.classList.add("services__card--expanded");
      } else {
        details.hidden = true;
        card.classList.remove("services__card--expanded");
      }
    });
  });
};
