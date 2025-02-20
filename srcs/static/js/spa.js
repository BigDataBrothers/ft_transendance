// app.js

// ROUTEUR SPA
const router = {
    routes: {},

    on(path, handler) {
        // Normaliser le chemin (supprimer le slash final si présent)
        const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
        this.routes[normalizedPath] = handler;
    },

    navigate(path) {
        // Normaliser le chemin pour la recherche
        const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
        if (this.routes[normalizedPath]) {
            window.history.pushState({}, '', path);
            this.routes[normalizedPath]();
        } else {
            console.warn(`Aucune route trouvée pour ${path}`);
        }
    },

    start() {
        console.log('Router started. Path:', window.location.pathname);
    
        window.addEventListener('popstate', () => {
            const currentPath = window.location.pathname;
            const normalizedPath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;
            
            console.log('Popstate triggered:', currentPath, 'Normalized:', normalizedPath);
            
            if (this.routes[normalizedPath]) {
                this.routes[normalizedPath]();
            } else {
                console.warn(`Route non trouvée: ${currentPath}, redirection vers /`);
                this.navigate('/');
            }
        });
    
        const initialPath = window.location.pathname;
        const normalizedInitialPath = initialPath.endsWith('/') ? initialPath.slice(0, -1) : initialPath;
        
        if (this.routes[normalizedInitialPath]) {
            this.routes[normalizedInitialPath]();
        } else {
            console.warn(`Route initiale non trouvée: ${initialPath}, redirection vers /`);
            this.navigate('/');
        }
    }
};

document.addEventListener('click', function(event) {
    const link = event.target.closest('a[data-link]'); // Prend uniquement les liens avec `data-link`
    if (link) {
        event.preventDefault();
        const path = link.getAttribute('href');
        navigateTo(path);
    }
});

function navigateTo(path) {
    router.navigate(path);
}

// LOGIN VIA AJAX
function handleLogin(event) {
    event.preventDefault();
    console.log("Tentative de login...");

    const username = document.querySelector('#id_username').value;
    const password = document.querySelector('#id_password').value;

    fetch('/api/login', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => {
        console.log("Réponse reçue:", response);
        return response.json();
    })
    .then(data => {
        console.log("Données reçues:", data);
        if (data.success) {
            window.location.href = '/home';
        } else {
            alert('Identifiants incorrects');
        }
    })
    .catch(error => console.error('Erreur lors du login:', error));
}


// LOGOUT VIA AJAX
function handleLogout(event) {
    event.preventDefault();

    fetch('/logout', {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/login';
        }
    })
    .catch(error => console.error('Erreur lors du logout:', error));
}

// RÉCUPÉRER LE COOKIE CSRF
function getCookie(name) {
    return document.cookie.split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1] || null;
}

// CHARGER DYNAMIQUEMENT LA PAGE D'ACCUEIL
function loadHomePage() {
    fetch('/api/home')
    .then(response => response.json())
    .then(data => {
        console.log('Données reçues:', data);
        document.querySelector('#app').innerHTML = generateHomePageContent(data);
    })
    .catch(error => console.error('Erreur lors du fetch:', error));
}

// function loadLoginPage() {
//     console.log("Chargement de la page login...");
//     fetch('/login')
//     .then(response => response.text())
//     .then(html => {
//         document.querySelector('#app').innerHTML = html;
//         console.log("HTML injecté dans #app");
        
//         // Inspecter le contenu HTML pour déboguer
//         console.log("Contenu HTML chargé:", document.querySelector('#app').innerHTML);
        
//         setTimeout(() => {
//             const loginForm = document.querySelector('#login-form');
//             console.log("Formulaire de login trouvé?", !!loginForm);
//             if (loginForm) {
//                 loginForm.addEventListener('submit', handleLogin);
//                 console.log("Event listener ajouté au formulaire");
//             } else {
//                 // Essayer d'autres sélecteurs possibles
//                 const otherForms = document.querySelectorAll('form');
//                 console.log("Autres formulaires trouvés:", otherForms.length);
//                 otherForms.forEach((form, index) => {
//                     console.log(`Formulaire ${index}:`, form.id || 'sans id');
//                 });
//             }
//         }, 100);
//     })
//     .catch(error => console.error('Erreur lors du chargement de la page de login:', error));
// }
function loadLoginPage() {
    console.log("Chargement de la page login...");
    
    // Récupérer d'abord le token CSRF
    const csrfToken = getCookie('csrftoken');
    
    // Générer le HTML du formulaire de login
    const loginHTML = `
        <div class="login-section">
            <h2>Log In</h2>
            <form id="login-form" method="POST">
                <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
                <div class="form-group">
                    <label for="id_username">Username:</label>
                    <input type="text" name="username" id="id_username" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="id_password">Password:</label>
                    <input type="password" name="password" id="id_password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary">Login</button>
            </form>    
            <p>Don't have an account? <br><a href="/signup" data-link>Sign up here</a>.</p>
            <p>Connect 42 <a href="/api" data-link>Connect Here!</a></p>
        </div>
    `;
    
    // Injecter le HTML dans le conteneur de l'application
    document.querySelector('#app').innerHTML = loginHTML;
    
    // Attacher l'événement de soumission
    const loginForm = document.querySelector('#login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log("Event listener ajouté au formulaire de login");
    } else {
        console.error("Formulaire de login non trouvé après injection");
    }
}

function generateHomePageContent(data) {
    return data.is_authenticated ? `
        <h2>Welcome, ${data.username}</h2>
        <div>Games Played: ${data.user_profile.games_played}</div>
        <div>Win Rate: ${data.user_profile.win_rate}%</div>
        <div>Featured Games:</div>
        <ul>
            ${data.featured_games.map(game => `<li><a href="${game.url}">${game.title}</a></li>`).join('')}
        </ul>
    ` : `
        <div class="login-prompt card mb-4 shadow">
            <div class="card-body">
                <h2 class="card-title">Please log in to access all features</h2>
                <a class="nav-link btn btn-primary" href="/login" data-link >Log In</a>
                <a href="{% url 'accounts:signup' %}" class="nav-link btn btn-secondary">Sign Up</a>
            </div>
        </div>
    `;
}

// ATTACHER LES ÉVÉNEMENTS SEULEMENT SI LES ÉLÉMENTS EXISTENT
document.querySelector('#logout-link')?.addEventListener('click', handleLogout);
document.querySelector('#login-form')?.addEventListener('submit', handleLogin);

// DÉFINIR LES ROUTES
router.on('/', loadHomePage);
router.on('/login', loadLoginPage);

// DÉMARRER LE ROUTEUR
router.start();

// Gestion du thème sombre
function toggleDarkMode() {
    const body = document.documentElement; // Utiliser html au lieu de body
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? '' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    
    // Sauvegarder la préférence dans localStorage
    localStorage.setItem('theme', newTheme);
    
    console.log('Thème changé vers:', newTheme || 'default');
}

// Initialiser le thème au chargement
function initDarkMode() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
}

// Ajouter après le chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM chargé, initialisation du thème...");
    initDarkMode();
    
    const darkModeBtn = document.querySelector('#theme-toggle');
    console.log("Bouton thème trouvé?", !!darkModeBtn);
    console.log("Élément trouvé:", darkModeBtn);
    
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', toggleDarkMode);
        console.log("Event listener pour thème ajouté");
    } else {
        console.warn('Bouton dark mode non trouvé');
    }
});

//Debug//
// Fonction utilitaire pour inspecter les éléments du DOM
function debugElement(selector, message = "Element") {
    const element = document.querySelector(selector);
    console.log(`${message} '${selector}':`, element ? "Trouvé ✅" : "Non trouvé ❌", element);
    return element;
}

// Fonction pour déboguer le thème
function debugTheme() {
    console.group("Debug Thème");
    console.log("data-theme actuel:", document.documentElement.getAttribute('data-theme') || "default");
    console.log("theme dans localStorage:", localStorage.getItem('theme') || "non défini");
    debugElement('#theme-toggle', "Bouton thème");
    console.groupEnd();
}

// Fonction pour déboguer le login
function debugLogin() {
    console.group("Debug Login");
    debugElement('#login-form', "Formulaire login");
    debugElement('#app', "Conteneur app");
    console.log("Routes définies:", Object.keys(router.routes));
    console.log("URL courante:", window.location.pathname);
    console.groupEnd();
}

// Ajouter au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log("==== DÉBOGAGE DÉMARRÉ ====");
    debugTheme();
    debugLogin();
    
    // Tester le cookie CSRF
    console.log("CSRF Token présent?", !!getCookie('csrftoken'));
});