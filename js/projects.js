/* ============================================================
   projects.js
   Pagina progetti: scarica i repository dalla GitHub API, crea le
   card e le filtra in tempo reale per testo e linguaggio.

   Tutto il file sta dentro un unico callback di DOMContentLoaded.
   Le variabili restano cosi' chiuse in quella funzione invece di
   finire nell'oggetto window, dove potrebbero entrare in conflitto
   con quelle di un altro script.
   ============================================================ */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("projects");
  renderFooter();

  const projectsContainer = document.getElementById("projects-container");
  const searchInput = document.getElementById("searchInput");
  const filterLanguage = document.getElementById("filterLanguage");
  const loadingSpinner = document.getElementById("loading-spinner");

  /* Copia completa dei progetti scaricati. La teniamo da parte per
     filtrare in memoria: rifare una fetch a ogni tasto premuto
     sarebbe lentissimo e brucerebbe subito il limite di richieste
     della GitHub API. */
  let allProjects = [];

  /* ============================================================
     DATI DI RISERVA

     Usati quando la GitHub API non risponde, cosi' la pagina
     mostra comunque qualcosa invece di restare vuota.
     ============================================================ */

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

  /* Anteprime locali associate al nome del repository. La GitHub
     API non le fornisce, quindi le colleghiamo qui: aggiungere un
     progetto significa aggiungere una riga, senza toccare la
     logica di caricamento. */
  const projectImages = {
    BodyPoseRec: "assets/BodyPoseRec.png",
    "ridfix-backend": "assets/ridfix-backend.png",
    LuxCommand: "assets/LuxCommand.jpg",
    "ridfix-ecommerce": "assets/ridfix-ecommerce.png",
    ProgammingPrincipleExam: "assets/ProgammingPrincipleExam.png"
  };

  /* ============================================================
     CARICAMENTO DEI DATI
     ============================================================ */

  /**
   * Scarica i repository e prepara l'array usato dai filtri.
   * La funzione e' async, quindi restituisce sempre una Promise e
   * al suo interno possiamo usare await per aspettare la risposta.
   */
  const loadProjects = async () => {
    loadingSpinner.style.display = "flex";

    try {
      const response = await fetch("https://api.github.com/users/AliouneDiagne/repos");

      /* response.ok e' true solo per gli status 200-299. Va
         controllato a mano: fetch fallisce solo se la richiesta non
         parte, mentre un 404 arriva come risposta regolare. */
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const repos = await response.json();

      /* map costruisce un nuovo array tenendo solo i campi che
         servono alle card. La risposta di GitHub ha decine di
         proprieta' per repository e portarsele dietro tutte
         renderebbe il resto del codice piu' difficile da seguire. */
      allProjects = repos.map((repo) => ({
        name: repo.name,
        /* L'operatore || sostituisce i valori mancanti: su GitHub
           description e language possono essere null. */
        description: repo.description || "No description available",
        language: repo.language || "Unknown",
        html_url: repo.html_url,
        topics: repo.topics || [],
        image: projectImages[repo.name] || "assets/profile.png"
      }));
    } catch (error) {
      /* console.warn e non console.error: il fallback e' previsto,
         non e' un guasto dell'applicazione. */
      console.warn("Failed to fetch from GitHub API, using fallback data:", error.message);
      allProjects = fallbackProjects;
    } finally {
      /* finally viene eseguito sia dopo il try sia dopo il catch.
         Spegnere lo spinner e disegnare le card serve in entrambi
         i casi, quindi va scritto una volta sola qui. */
      loadingSpinner.style.display = "none";
      renderProjects(allProjects);
    }
  };

  /* ============================================================
     DISEGNO DELLE CARD
     ============================================================ */

  /**
   * Svuota il contenitore e ridisegna le card ricevute.
   * @param {Array} projects progetti da mostrare
   */
  const renderProjects = (projects) => {
    /* Svuotiamo prima di ridisegnare, altrimenti a ogni filtro le
       card nuove si aggiungerebbero a quelle vecchie.
       removeChild in ciclo toglie anche i listener collegati ai
       nodi rimossi, quindi non restano riferimenti in memoria. */
    while (projectsContainer.firstChild) {
      projectsContainer.removeChild(projectsContainer.firstChild);
    }

    /* Nessun risultato: meglio un messaggio esplicito che una
       pagina vuota, che sembrerebbe un errore di caricamento. */
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

      /* dataset scrive un attributo data-url sull'elemento. Il dato
         resta attaccato alla card e lo si puo' rileggere nel
         listener senza cercare il progetto nell'array. */
      card.dataset.url = project.html_url;

      /* I topics diventano tag: map li trasforma in stringhe HTML e
         join("") le unisce. Senza join, l'array verrebbe convertito
         in stringa con le virgole tra un elemento e l'altro. */
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

  /* ============================================================
     RICERCA E FILTRO
     ============================================================ */

  /**
   * Applica insieme il testo cercato e il linguaggio scelto.
   * I due criteri lavorano sempre sull'array completo, non sul
   * risultato precedente: altrimenti cancellare una lettera dalla
   * ricerca non farebbe piu' ricomparire i progetti esclusi.
   */
  const applyFilters = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedLanguage = filterLanguage.value;

    /* filter costruisce un nuovo array con i soli elementi per cui
       la funzione restituisce true, e lascia intatto l'originale. */
    const filtered = allProjects.filter((project) => {
      /* Confronto in minuscolo su entrambi i lati, cosi' la ricerca
         non distingue maiuscole e minuscole. */
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm);

      /* "All" e' il valore che disattiva il filtro sul linguaggio. */
      const matchesLanguage =
        selectedLanguage === "All" || project.language === selectedLanguage;

      /* Servono entrambe le condizioni: i filtri si sommano. */
      return matchesSearch && matchesLanguage;
    });

    renderProjects(filtered);
  };

  /* input scatta a ogni modifica del campo, quindi la lista si
     aggiorna mentre si scrive. */
  searchInput.addEventListener("input", applyFilters);

  /* change su una select scatta alla scelta dell'opzione, non
     mentre si scorre la tendina. */
  filterLanguage.addEventListener("change", applyFilters);

  /* ============================================================
     CLICK SULLE CARD

     Un solo listener sul contenitore invece di uno per card. Le
     card vengono ricreate a ogni filtro: con i listener sulle
     singole card andrebbero ricollegati ogni volta, mentre il
     contenitore resta sempre lo stesso.
     ============================================================ */

  projectsContainer.addEventListener("click", (event) => {
    /* event.target e' l'elemento preciso cliccato, che puo' essere
       il titolo o l'immagine dentro la card. closest risale i
       genitori fino a trovare la card, o restituisce null. */
    const card = event.target.closest(".project-card");

    /* Click a vuoto sullo spazio tra le card. */
    if (!card) return;

    /* Sul link lasciamo fare al browser: deve aprire GitHub, non
       selezionare la card. */
    if (event.target.tagName === "A") return;

    card.classList.toggle("card--active");
  });

  /* Avvio: tutto il resto e' gia' collegato e reagisce da solo. */
  loadProjects();
});
