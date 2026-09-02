/* ============================================================
   home.js
   Logica della homepage: effetto typing, contatori animati,
   caricamento dei progetti dalla GitHub API e card espandibili
   della sezione "What I Do".
   ============================================================ */

"use strict";

/* Le funzioni chiamate qui sotto sono definite piu' avanti come
   const con arrow function, quindi non subiscono l'hoisting delle
   function tradizionali. Il codice funziona lo stesso perche' il
   callback di DOMContentLoaded parte dopo che tutto il file e'
   stato letto, quando le const esistono gia'. */
document.addEventListener("DOMContentLoaded", () => {
  /* Componenti condivisi definiti in app.js. Il parametro "home"
     dice alla navbar quale voce evidenziare. */
  renderNavbar("home");
  renderFooter();

  initTypingEffect();
  initStatsAnimation();
  loadFeaturedProjects();
  initServiceCards();
});

/* ============================================================
   EFFETTO TYPING

   Cambia il ruolo mostrato nell'hero ogni due secondi.
   ============================================================ */

const initTypingEffect = () => {
  const roles = [
    "Cloud Developer",
    "Backend Engineer",
    "AWS Certified",
    "Security Specialist"
  ];

  const typingElement = document.getElementById("typing-text");

  /* Uscita anticipata se l'elemento non c'e'. Senza questo
     controllo la riga successiva darebbe errore su null. */
  if (!typingElement) return;

  let currentIndex = 0;

  /* Mostriamo subito il primo ruolo: altrimenti lo spazio
     resterebbe vuoto per i primi due secondi. */
  typingElement.textContent = roles[currentIndex];

  /* setInterval ripete la funzione a ogni intervallo, a differenza
     di setTimeout che la esegue una volta sola.
     L'operatore modulo (%) riporta l'indice a 0 dopo l'ultimo
     ruolo, cosi' il ciclo non esce mai dai limiti dell'array. */
  setInterval(() => {
    currentIndex = (currentIndex + 1) % roles.length;
    typingElement.textContent = roles[currentIndex];
  }, 2000);
};

/* ============================================================
   CONTATORI ANIMATI

   I numeri della sezione statistiche salgono da 0 al valore
   finale. Il valore sta nell'HTML come attributo data-target,
   non nel JavaScript: cosi' per cambiare una statistica si
   modifica il markup senza toccare il codice.
   ============================================================ */

const initStatsAnimation = () => {
  const statNumbers = document.querySelectorAll(".stat__number");

  statNumbers.forEach((stat) => {
    /* dataset legge gli attributi data-*. parseInt lo converte in
       numero, perche' gli attributi HTML sono sempre stringhe e
       "6" + 1 darebbe "61" invece di 7. Il secondo argomento e' la
       base decimale, per evitare interpretazioni diverse. */
    const target = parseInt(stat.dataset.target, 10);

    /* Suffisso opzionale, ad esempio il "+" di "8+". Se manca,
       dataset.suffix e' undefined e usiamo la stringa vuota. */
    const suffix = stat.dataset.suffix || "";

    let current = 0;

    /* Trenta passi da 50ms fanno circa un secondo e mezzo di
       animazione, indipendentemente da quanto e' grande il numero.
       Math.ceil evita che un incremento sotto 1 blocchi il conteggio. */
    const increment = Math.ceil(target / 30);

    const counter = setInterval(() => {
      current += increment;

      if (current >= target) {
        /* L'ultimo passo puo' superare il target: forziamo il
           valore esatto e fermiamo il timer con clearInterval.
           Senza clearInterval l'intervallo continuerebbe a girare
           a vuoto per tutta la vita della pagina. */
        current = target;
        stat.textContent = `${current}${suffix}`;
        clearInterval(counter);
      } else {
        stat.textContent = `${current}${suffix}`;
      }
    }, 50);
  });
};

/* ============================================================
   DATI DI RISERVA

   La GitHub API puo' non rispondere: rete assente, oppure il
   limite di 60 richieste all'ora per indirizzo IP superato.
   In quel caso mostriamo questi progetti invece di lasciare la
   sezione vuota. Hanno gli stessi nomi di proprieta' della
   risposta reale, cosi' la funzione di rendering non cambia.
   ============================================================ */

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

/* La GitHub API non conosce le anteprime locali. Questa mappa
   collega il nome del repository alla sua immagine: cercare in un
   oggetto e' immediato e aggiungere un progetto costa una riga. */
const projectImages = {
  BodyPoseRec: "assets/BodyPoseRec.png",
  "ridfix-backend": "assets/ridfix-backend.png",
  LuxCommand: "assets/LuxCommand.jpg",
  "ridfix-ecommerce": "assets/ridfix-ecommerce.png",
  ProgammingPrincipleExam: "assets/ProgammingPrincipleExam.png"
};

/* ============================================================
   CARICAMENTO PROGETTI DALLA GITHUB API

   async/await e' il modo moderno di gestire le Promise: il codice
   si legge dall'alto in basso come se fosse sincrono, invece di
   incatenare .then(). Gli errori si intercettano con try/catch
   come per il codice normale.
   ============================================================ */

const loadFeaturedProjects = async () => {
  const projectsGrid = document.getElementById("projects-grid");
  const spinner = document.getElementById("projects-spinner");

  /* let perche' il valore viene assegnato o nel try o nel catch. */
  let projects;

  try {
    /* fetch restituisce una Promise che si risolve con la Response.
       await mette in pausa questa funzione, non tutta la pagina:
       il resto dell'interfaccia continua a rispondere. */
    const response = await fetch(
      "https://api.github.com/users/AliouneDiagne/repos"
    );

    /* fetch considera un errore solo la rete caduta: una risposta
       404 o 403 arriva comunque come Response. Il controllo su
       response.ok verifica che lo status sia nell'intervallo 200-299
       e trasforma il resto in un'eccezione per il catch. */
    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status}`);
    }

    /* Anche json() e' asincrono: il corpo della risposta puo'
       arrivare a pezzi e va atteso per intero. */
    const repos = await response.json();

    projects = repos
      /* Ordine decrescente per data: sottraendo due Date si
         ottiene la differenza in millisecondi, che e' il numero
         che sort() si aspetta come criterio. */
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 3)
      /* map crea un nuovo array senza modificare l'originale.
         Lo spread copia le proprieta' del repository e aggiunge
         l'anteprima locale presa dalla mappa. */
      .map((project) => ({
        ...project,
        image: projectImages[project.name] || "assets/profile.png"
      }));
  } catch (error) {
    /* Un solo catch copre sia l'errore di rete sia il throw qui
       sopra. console.error lascia la traccia per il debug, mentre
       all'utente mostriamo un messaggio comprensibile. */
    console.error("Errore nel caricamento dei progetti da GitHub:", error);

    projects = fallbackProjects.slice(0, 3);

    showToast("Progetti caricati dalla copia locale", "warning");
  } finally {
    /* finally viene eseguito in ogni caso, con o senza errore.
       Lo spinner va tolto sempre: metterlo nel try lo lascerebbe
       girare per sempre quando la chiamata fallisce. */
    if (spinner) {
      spinner.remove();
    }
  }

  renderProjectCards(projects, projectsGrid);
};

/* ============================================================
   CREAZIONE DELLE CARD

   Le card non esistono nell'HTML: le costruiamo qui a partire dai
   dati, quindi il numero di progetti mostrati dipende solo dalla
   risposta dell'API.
   ============================================================ */

const renderProjectCards = (projects, container) => {
  projects.forEach((project) => {
    /* Destructuring: estrae le proprieta' dell'oggetto in variabili
       con una sola istruzione. I due punti rinominano il campo,
       perche' html_url e stargazers_count sono i nomi usati da
       GitHub ma url e stars si leggono meglio qui dentro. */
    const {
      name,
      description,
      html_url: url,
      language,
      stargazers_count: stars,
      image
    } = project;

    /* article e non div: e' un contenuto autonomo e ha senso da
       solo, che e' esattamente il criterio del tag semantico. */
    const card = document.createElement("article");

    /* La classe visible viene aggiunta subito insieme a fade-in:
       queste card nascono dopo che IntersectionObserver ha gia'
       finito il suo giro, quindi senza visible resterebbero
       trasparenti per sempre. */
    card.classList.add("project-card", "fade-in", "visible");

    /* loading="lazy" rimanda il download delle immagini fuori
       schermo, cosi' la pagina si apre prima. */
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

/* ============================================================
   CARD "WHAT I DO"

   Un click apre i dettagli e chiude le altre card, come in una
   fisarmonica. I dettagli sono gia' nell'HTML con l'attributo
   hidden: cosi' restano leggibili dai motori di ricerca e dagli
   screen reader anche prima del click.
   ============================================================ */

const initServiceCards = () => {
  const serviceCards = document.querySelectorAll(".services__card");

  serviceCards.forEach((card) => {
    card.addEventListener("click", (event) => {
      const details = card.querySelector(".services__details");

      if (!details) return;

      /* hidden e' una proprieta' booleana: assegnarle false
         equivale a togliere l'attributo dall'HTML. */
      if (details.hidden) {
        /* Prima chiudiamo le altre, altrimenti resterebbero
           aperte tutte insieme e la sezione diventerebbe lunga. */
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
        /* Secondo click sulla stessa card: la richiude. */
        details.hidden = true;
        card.classList.remove("services__card--expanded");
      }
    });
  });
};
