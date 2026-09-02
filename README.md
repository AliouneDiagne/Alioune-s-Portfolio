# Alioune Diagne - Developer Portfolio

A fully interactive web application built with **HTML5**, **CSS3**, and **vanilla JavaScript**. This portfolio showcases my projects, certifications, and skills as a Cloud & Backend Developer.

## Project Overview

This is a **web application** (not a static website) that emphasizes JavaScript functionality and DOM manipulation. It features a simulated authentication system, dynamic content loading via the GitHub API, multiple forms with validation, responsive design, and interactive UI elements.

## Features

### Core Features (Mandatory Requirements)
- **Semantic HTML5**: All pages use `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- **Accessibility**: Every input has an associated `<label>` (visually hidden with `.sr-only` where the design requires it), `alt` text on all images, `aria-label` / `aria-expanded` on interactive controls
- **5 Pages + Login**: Home, Projects, Certifications, Contact, Profile + Login page
- **Flexbox Layout**: Used throughout for navigation, grids, cards, and page structure
- **Responsive Design**: Media queries at 480px, 768px and 1024px breakpoints, mobile hamburger menu
- **Consistent Color Scheme**: Dark professional theme with blue/cyan accents
- **JavaScript on Every Page**: Event listeners, DOM manipulation (add/remove/update elements)
- **Navigation Menu**: Dynamic navbar with active page highlighting and auth-aware links
- **User Feedback**: Toast notification system for success/error/info messages
- **Form Validation**: Login + Contact + Certification verification + Edit profile (4 forms total)
- **Fetch API**: Asynchronous loading of GitHub repositories with async/await
- **Simulated Login System**: Fake auth with different UI states (logged in vs. guest)
- **User Profile Page**: Dynamic profile display with edit functionality

### Bonus Features
- **CSS Animations**: Hover transitions, loading spinners, fade-in scroll animations, typing effect
- **SEO Metadata**: `<meta>` tags for description, keywords, and author on all pages

## Pages

| Page | File | Description |
|------|------|-------------|
| Login | `login.html` | Simulated login with form validation |
| Home | `index.html` | Hero section, featured projects, services overview |
| Projects | `projects.html` | Dynamic project loading from GitHub API with search/filter |
| Certifications | `certifications.html` | Interactive cert cards, skills dashboard, verification form |
| Contact | `contact.html` | Contact form with real-time validation and char counter |
| Profile | `profile.html` | User profile with edit functionality (auth-protected) |

## Forms (all with client-side validation)

| Form | Page | Validation | On submit |
|------|------|-----------|-----------|
| Login | `login.html` | Required fields, min length, real-time feedback, shake animation on failure | Simulated auth via `Auth.login()` + redirect |
| Contact | `contact.html` | Name, email regex, subject, message min length, 500-char counter | `console.log` of the payload + success message in the DOM |
| Certification verification | `certifications.html` | Required fields, ID format via regex, select validation | `console.log` of the payload + toast |
| Edit profile | `profile.html` | Name, email regex, role required | Updates the DOM and persists to `localStorage` |

## Demo Credentials

| Username | Password | Role |
|----------|----------|------|
| `alioune` | `admin123` | Cloud & Backend Developer |
| `guest` | `guest123` | Visitor |

## Technologies Used

- **HTML5** - Semantic markup and accessibility
- **CSS3** - Flexbox, media queries, custom properties, animations
- **JavaScript (ES6+)** - DOM manipulation, Fetch API, async/await, event handling

## Project Structure

```
alioune-portfolio/
├── index.html              # Home page
├── login.html              # Login page
├── projects.html           # Projects page
├── certifications.html     # Certifications & Skills page
├── contact.html            # Contact page
├── profile.html            # User Profile page
├── css/
│   └── style.css           # Main stylesheet
├── js/
│   ├── app.js              # Shared: navigation, auth, toast, utilities
│   ├── home.js             # Home page logic
│   ├── login.js            # Login form validation and auth
│   ├── projects.js         # GitHub API fetch, search/filter
│   ├── certifications.js   # Cert cards, skills dashboard, verification form
│   ├── contact.js          # Contact form validation
│   └── profile.js          # Profile display and edit
├── .gitignore              # Excludes local virtual envs and editor files
├── assets/                 # Local profile and project images
│   ├── profile.png
│   ├── BodyPoseRec.png
│   ├── ridfix-backend.png
│   ├── ridfix-ecommerce.png
│   ├── ProgammingPrincipleExam.png
│   └── LuxCommand.jpg
└── README.md               # This file
```

## How to Run

1. Download or clone this repository
2. Start a local static server for the GitHub Fetch API, for example:
	`python -m http.server 8000`
3. Open `http://localhost:8000/index.html`

## JavaScript Concepts Demonstrated

- **Variables**: `const` and `let` (block-scoped) vs `var` (function-scoped)
- **DOM Selection**: `getElementById`, `querySelector`, `querySelectorAll`
- **DOM Manipulation**: `createElement`, `appendChild`, `removeChild`, `textContent`, `innerHTML`
- **Events**: `addEventListener`, `preventDefault`, event delegation, event propagation
- **Async/Await**: Fetch API with `async/await` and `.then()/.catch()` patterns
- **Form Validation**: Client-side validation with regex, real-time feedback
- **CSS Classes**: `classList.add()`, `classList.remove()`, `classList.toggle()`
- **Template Literals**: Backtick strings with `${}` interpolation
- **Arrow Functions**: `() => {}` syntax
- **Array Methods**: `.map()`, `.filter()`, `.forEach()`, `.find()`, `.sort()`, `.join()`
- **LocalStorage**: Persistent data storage for simulated authentication
- **JSON**: `JSON.parse()` and `JSON.stringify()` for data serialization
- **Closures**: Used in event handlers and timeout callbacks
- **IntersectionObserver**: Scroll-based animations

## External API

- **GitHub REST API** (`https://api.github.com/users/AliouneDiagne/repos`) - Used to dynamically load project data. Includes a fallback mechanism with hardcoded data if the API is unavailable.

## Author

**Alioune Diagne**  
Computer Engineering & AI Graduate  
CompTIA Security+ | AWS Solutions Architect  
GitHub: [github.com/AliouneDiagne](https://github.com/AliouneDiagne)
