// app.js

function checkAvatar(input) {
    const file = input.files[0];
    if (file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            alert('Veuillez télécharger une image valide (JPEG, PNG, GIF).');
            input.value = ''; // Réinitialiser l'input si non valide
        } else {
            console.log('Image sélectionnée :', file.name);
        }
    }
}

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

    const username = document.querySelector('#id_username').value;
    const password = document.querySelector('#id_password').value;

    const data = { username, password };
    const csrftoken = getCookie('csrftoken'); // Récupère le token CSRF

    fetch('/api/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken // On ajoute le CSRF token ici
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/'; // Redirection vers la home
        } else {
            alert('Identifiants incorrects');
        }
    })
    .catch(error => console.error('Erreur lors du login:', error));
}

async function updateNavbar() {
    try {
        const response = await fetch('/api/check-auth/', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            const navbar = document.getElementById('navbar-auth');

            // Met à jour la navbar selon l'état de connexion
            if (data.is_authenticated) {
                navbar.innerHTML = `
                    <li class="nav-item">
                        <a class="nav-link" href="/" data-link>Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" id="logout-link">Logout</a>
                    </li>
                `;
                document.getElementById('logout-link').addEventListener('click', handleLogout);
            } else {
                navbar.innerHTML = `
                    <li class="nav-item">
                        <a class="nav-link" href="/" data-link>Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/login" data-link>Login</a>
                    </li>
                `;
            }
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la navbar:', error.message);
    }
}

// LOGOUT VIA AJAX
async function handleLogout(event) {
    event.preventDefault(); // Empêche le comportement par défaut du lien
    try {
        const response = await fetch('/logout/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Erreur lors du logout : ${response.statusText}`);
        }

        console.log('Déconnexion réussie');
        await updateNavbar(); // Rafraîchit dynamiquement la navbar
        window.location.reload();
    } catch (error) {
        console.error('Erreur lors du logout:', error.message);
    }
}

document.addEventListener('DOMContentLoaded', updateNavbar);

// RÉCUPÉRER LE COOKIE CSRF
function getCookie(name) {
    return document.cookie.split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1] || null;
}

// CHARGER DYNAMIQUEMENT LA PAGE D'ACCUEIL
function loadHomePage() {
    fetch('/api/home/')
    .then(response => response.json())
    .then(data => {
        console.log('Données reçues:', data);
        document.querySelector('#app').innerHTML = generateHomePageContent(data);
    })
    .catch(error => console.error('Erreur lors du fetch:', error));
}

function loadSignUpPage() {
    console.log("Chargement de la page d'inscription...");

    const csrfToken = getCookie('csrftoken');

    const signUpHTML = `
    <div class="signup-section">
        <h2>Sign Up</h2>
        <div id="error-messages" class="alert alert-danger" style="display: none;"></div>
        <form id="signup-form" enctype="multipart/form-data">
            <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
            <div class="form-group">
                <label for="id_username">Username:</label>
                <input type="text" name="username" id="id_username" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="id_email">Email:</label>
                <input type="email" name="email" id="id_email" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="id_profile_photo">Profile Photo:</label>
                <input type="file" id="id_profile_photo" name="profile_photo" class="form-control" accept="image/*" required>
            </div>
            <div class="form-group">
                <label for="id_first_name">First Name:</label>
                <input type="text" name="first_name" id="id_first_name" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="id_last_name">Last Name:</label>
                <input type="text" name="last_name" id="id_last_name" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="id_password">Password:</label>
                <input type="password" name="password" id="id_password" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="id_confirm_password">Confirm Password:</label>
                <input type="password" name="confirm_password" id="id_confirm_password" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary">Sign Up</button>
        </form>
        <p>Already have an account? <br><a href="#" data-link="/login">Log in here</a>.</p>
    </div>
`;

    document.querySelector('#app').innerHTML = signUpHTML;

    const signUpForm = document.querySelector('#signup-form');
    if (signUpForm) {
        signUpForm.addEventListener('submit', handleSignUp);
        console.log("Event listener ajouté au formulaire d'inscription");
    } else {
        console.error("Formulaire d'inscription non trouvé après injection");
    }

    // Attacher l'événement onchange pour l'avatar après l'injection
    const avatarInput = document.querySelector('#id_avatar');
    if (avatarInput) {
        avatarInput.addEventListener('change', function() {
            checkAvatar(avatarInput);
        });
    } else {
        console.error("Champ Avatar non trouvé après injection");
    }
}

const avatarInput = document.querySelector('#id_avatar');
if (avatarInput) {
    avatarInput.addEventListener('change', () => checkAvatar(avatarInput));
}


async function handleSignUp(event) {
    event.preventDefault();

    const form = document.querySelector('#signup-form');
    const formData = new FormData(form);

    try {
        const response = await fetch('/api/signup/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken') // Assure-toi que cette fonction récupère bien le token
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            alert('Inscription réussie !');
            window.location.href = data.redirect_url;  // Redirection automatique
        } else {
            const errorData = await response.json();
            document.getElementById('error-messages').style.display = 'block';
            document.getElementById('error-messages').innerText = errorData.detail || 'Erreur inconnue';
        }
    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        alert('Une erreur est survenue lors de l\'inscription.');
    }
}

// Ajout de l'écouteur d'événement sur le formulaire
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('signup-form').addEventListener('submit', handleSignUp);
});
// Attacher la fonction au formulaire
// document.querySelector('#signup-form').addEventListener('submit', handleSignUp);




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
router.on('/signup', loadSignUpPage);


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

console.log("Token CSRF:", getCookie('csrftoken'));

function showNotification(message, type) {
    const notificationContainer = document.createElement('div');
    notificationContainer.classList.add('notification', type);
    notificationContainer.textContent = message;
    
    // Ajoute la notification au DOM
    document.body.appendChild(notificationContainer);
    
    // Retire la notification après 5 secondes
    setTimeout(() => notificationContainer.remove(), 5000);
}

console.log(FormData);

console.log(signUpForm);