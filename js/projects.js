/* ============================================================
   projects.js — Scarica i repo da GitHub, crea le card e le
   filtra in tempo reale per testo e linguaggio.
   ============================================================ */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("projects");
  renderFooter();

  const projectsContainer = document.getElementById("projects-container");
  const searchInput = document.getElementById("searchInput");
  const filterLanguage = document.getElementById("filterLanguage");
  const loadingSpinner = document.getElementById("loading-spinner");

  /* Copia completa dei progetti — filtriamo in memoria. */
  let allProjects = [];

  /* ---- DATI DI RISERVA (se GitHub API non risponde) ---- */

  const fallbackProjects = [
    {
      name: "BodyPoseRec",
      description: "Computer Vision project for real-time body pose recognition using MediaPipe and OpenCV",
      language: "Python",
      html_url: "https://github.com/AliouneDiagne/BodyPoseRec",
      topics: ["computer-vision", "machine-learning", "python"],
      image: "assets/BodyPoseRec.png"
    },
    {
      name: "ridfix-backend",
      description: "RESTful API backend for the RidFix platform with authentication and database management",
      language: "Java",
      html_url: "https://github.com/AliouneDiagne/ridfix-backend",
      topics: ["backend", "rest-api", "java", "database"],
      image: "assets/ridfix-backend.png"
    },
    {
      name: "LuxCommand",
      description: "OOP project implementing design patterns (Singleton, Factory, Observer, Strategy) and SOLID principles",
      language: "Java",
      html_url: "https://github.com/AliouneDiagne/LuxCommand",
      topics: ["oop", "design-patterns", "java", "solid"],
      image: "assets/LuxCommand.jpg"
    },
    {
      name: "ridfix-ecommerce",
      description: "Full-stack e-commerce application with product catalog, cart, and checkout flow",
      language: "JavaScript",
      html_url: "https://github.com/AliouneDiagne/ridfix-ecommerce",
      topics: ["react", "ecommerce", "frontend"],
      image: "assets/ridfix-ecommerce.png"
    },
    {
      name: "ProgammingPrincipleExam",
      description: "Programming fundamentals exam project covering data structures and algorithms",
      language: "Java",
      html_url: "https://github.com/AliouneDiagne/ProgammingPrincipleExam",
      topics: ["algorithms", "data-structures", "java"],
      image: "assets/ProgammingPrincipleExam.png"
    },
    {
      name: "Alioune-s-Portfolio",
      description: "Personal portfolio website showcasing projects and certifications",
      language: "HTML",
      html_url: "https://github.com/AliouneDiagne/Alioune-s-Portfolio",
      topics: ["portfolio", "html", "css"],
      image: "assets/profile.png"
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

  /* ---- CARICAMENTO DATI ---- */

  const loadProjects = async () => {
    loadingSpinner.style.display = "flex";

    try {
      const response = await fetch("https://api.github.com/users/AliouneDiagne/repos");

      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

      const repos = await response.json();

      /* Teniamo solo i campi utili alle card. */
      allProjects = repos.map((repo) => ({
        name: repo.name,
        description: repo.description || "No description available",
        language: repo.language || "Unknown",
        html_url: repo.html_url,
        topics: repo.topics || [],
        image: projectImages[repo.name] || "assets/profile.png"
      }));
    } catch (error) {
      console.warn("Failed to fetch from GitHub API, using fallback data:", error.message);
      allProjects = fallbackProjects;
    } finally {
      loadingSpinner.style.display = "none";
      renderProjects(allProjects);
    }
  };

  /* ---- RENDERING CARD ---- */

  const renderProjects = (projects) => {
    while (projectsContainer.firstChild) {
      projectsContainer.removeChild(projectsContainer.firstChild);
    }

    if (projects.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "no-results";
      emptyMessage.innerHTML = `<p>No projects found matching your criteria.</p>`;
      projectsContainer.appendChild(emptyMessage);
      return;
    }

    projects.forEach((project) => {
      const card = document.createElement("div");
      card.className = "card project-card";
      card.dataset.url = project.html_url;

      card.innerHTML = `
        <div class="project-card__media project-card__media--compact">
          <img src="${project.image || 'assets/profile.png'}" alt="${project.name} preview" loading="lazy">
        </div>
        <div class="project-card__content">
          <h3 class="card__title">${project.name}</h3>
          <p class="card__description">${project.description}</p>
          <div class="card__meta">
            <span class="card__language">${project.language}</span>
          </div>
          <div class="card__topics">
            ${project.topics
              .map((topic) => `<span class="tag">${topic}</span>`)
              .join("")}
          </div>
          <a href="${project.html_url}"
             target="_blank"
             rel="noopener noreferrer"
             class="card__link">
            View on GitHub
          </a>
        </div>
      `;

      projectsContainer.appendChild(card);
    });
  };

  /* ---- RICERCA E FILTRO ---- */

  const applyFilters = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedLanguage = filterLanguage.value;

    const filtered = allProjects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm);

      const matchesLanguage =
        selectedLanguage === "All" || project.language === selectedLanguage;

      return matchesSearch && matchesLanguage;
    });

    renderProjects(filtered);
  };

  searchInput.addEventListener("input", applyFilters);
  filterLanguage.addEventListener("change", applyFilters);

  /* ---- CLICK SULLE CARD ----
     Event delegation sul contenitore. */

  projectsContainer.addEventListener("click", (event) => {
    const card = event.target.closest(".project-card");
    if (!card) return;
    if (event.target.tagName === "A") return;

    card.classList.toggle("card--active");
  });

  loadProjects();
});
