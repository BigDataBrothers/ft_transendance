// app.js

function checkAvatar(input) {
    const file = input.files[0];
    if (file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            alert('Veuillez télécharger une image valide (JPEG, PNG, GIF).');
            input.value = '';
        } else {
            console.log('Image sélectionnée :', file.name);
        }
    }
}

// ROUTEUR SPA
const router = {
    routes: {},

    on(path, handler) {
        const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
        this.routes[normalizedPath] = handler;
    },

    navigate(path) {
        const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
        if (this.routes[normalizedPath]) {
            window.history.pushState({}, '', path);
            this.routes[normalizedPath]();
        } else {
            console.warn(`Aucune route trouvée pour ${path}`);
        }
    },

    start() {
        window.addEventListener('popstate', () => {
            const currentPath = window.location.pathname;
            const normalizedPath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;
            
            if (this.routes[normalizedPath]) {
                this.routes[normalizedPath]();
            } else {
                this.navigate('/');
            }
        });
    
        const initialPath = window.location.pathname;
        const normalizedInitialPath = initialPath.endsWith('/') ? initialPath.slice(0, -1) : initialPath;
        
        if (this.routes[normalizedInitialPath]) {
            this.routes[normalizedInitialPath]();
        } else {
            this.navigate('/');
        }
    }
};

document.addEventListener('click', function(event) {
    const link = event.target.closest('a[data-link]');
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
    const csrftoken = getCookie('csrftoken');

    fetch('/api/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/';
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
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    
    try {
        const csrftoken = getCookie('csrftoken');
        const response = await fetch('/logout/', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur lors du logout : ${response.statusText}`);
        }

        await updateNavbar();
        window.location.href = '/';
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
        document.querySelector('#app').innerHTML = generateHomePageContent(data);
    })
    .catch(error => console.error('Erreur lors du fetch:', error));
}

function loadSignUpPage() {
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
    document.querySelector('#signup-form').addEventListener('submit', handleSignUp);
    
    const avatarInput = document.querySelector('#id_profile_photo');
    if (avatarInput) {
        avatarInput.addEventListener('change', function() {
            checkAvatar(avatarInput);
        });
    }
}

async function handleSignUp(event) {
    event.preventDefault();

    const form = document.querySelector('#signup-form');
    const formData = new FormData(form);

    try {
        const response = await fetch('/api/signup/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            alert('Inscription réussie !');
            window.location.href = data.redirect_url;
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

async function loadProfilePage() {
    try {
        const response = await fetch('/api/profile/');
        if (!response.ok) throw new Error('Failed to fetch profile data');

        const data = await response.json();

        if (data.is_authenticated) {
            document.querySelector('#app').innerHTML = generateProfileContent(data);
        } else {
            document.querySelector('#app').innerHTML = '<h2>Please log in to view your profile</h2>';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function generateProfileContent(data) {

    console.log("Profile data received:", data);
    console.log("Profile photo URL:", data.profile_photo);

    // Modifiez la façon dont vous construisez l'URL de l'image
    const profilePhotoUrl = data.profile_photo || '/static/images/default_avatar.jpg';
    console.log("Final profile photo URL:", profilePhotoUrl);
    
    const html = `
    <div class="container mt-4">
        <div class="profile-background">
            <div class="notification-center" id="notificationCenter">
                <div class="notification-header">
                    <h3>Notifications</h3>
                    <span class="notification-count" id="notificationCount">${data.notifications.length}</span>
                </div>
                <div class="notification-list" id="notificationList">
                    ${data.notifications.map(notification => `
                        <div class="notification-item ${notification.type}">
                            <i class="fas ${notification.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                            <span>${notification.message}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Profile Header Section -->
            <div class="profile-header" style="background: linear-gradient(to right, ${data.profile_gradient_start}, ${data.profile_gradient_end});">
                <div class="profile-summary">
                    <div class="avatar-section">
                        <img src="${profilePhotoUrl}" 
                            alt="Avatar" 
                            class="profile-avatar"
                            onerror="this.src='/static/images/default_avatar.jpg'">
                    </div>
                    <div class="profile-details">
                        <h1>${data.username}</h1>
                        <div class="player-level">
                            <span class="level-icon">${data.level}</span>
                            <div class="level-progress">
                                <div class="progress">
                                    <div class="progress-bar" role="progressbar" style="width: ${data.win_rate}%">${data.win_rate}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Profile Content -->
            <div class="profile-content">
                <!-- Sidebar Section -->
                <div class="sidebar">
                    <div class="profile-card">
                        <div class="recent-activity">
                            <h3>Recent Activity</h3>
                            <p>Last played: <span class="data">${data.last_played_game || 'N/A'}</span></p>
                            <p>Time played: <span class="data">${data.time_played} hrs</span></p>
                        </div>
                    </div>
                    <button id="customizeProfile" class="profile-link custom-change-password-btn" style="margin-top: 10px;">
                        <i class="fas fa-palette"></i> Customize Profile Colors
                    </button>
                    <div class="profile-links">
                        <a href="/change-password" class="profile-link custom-change-password-btn" data-link>
                            <i class="fas fa-key"></i> Change Password
                        </a>
                        <button class="profile-link danger" id="logoutButton">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>

                <!-- Main Content Section -->
                <div class="main-content">
                    <div class="stats-showcase">
                        <div class="stat-card"><h4>Games Played</h4><span class="stat-value">${data.games_played}</span></div>
                        <div class="stat-card"><h4>Win Rate</h4><span class="stat-value">${data.win_rate}%</span></div>
                        <div class="stat-card"><h4>Total Score</h4><span class="stat-value">${data.total_score}</span></div>
                    </div>

                    <div class="achievements">
                        <h3>Recent Achievements (<span class="stat-value">${data.achievements.length}</span>)</h3>
                        <div class="achievement-grid">
                            ${data.achievements.map(ach => `
                                <div class="achievement">
                                    <i class="${ach.icon}"></i>
                                    <span>${ach.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="friends-section">
                        <h3>My Friends (<span class="stat-value">${data.friends.length}</span>)</h3>
                        <div class="friends-grid">
                            ${data.friends.map(friend => `
                                <div class="friend-card">
                                    <div class="friend-avatar">
                                        <img src="${friend.profile_photo || '/static/images/default_avatar.jpg'}" alt="${friend.username}">
                                    </div>
                                    <div class="friend-info">
                                        <span class="friend-name">${friend.username}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div id="colorPickerModal" class="color-picker-modal">
                        <div class="color-picker-container">
                            <h3 style="color: #fcfcec; margin-bottom: 15px;">Customize Profile Colors</h3>
                            <div class="color-input-group">
                                <label style="color: #fcfcec">Start Color:</label>
                                <input type="color" id="startColor" class="color-input" value="#1b2838">
                            </div>
                            <div class="color-input-group">
                                <label style="color: #fcfcec">End Color:</label>
                                <input type="color" id="endColor" class="color-input" value="#2a475e">
                            </div>
                            <div class="preview-gradient" id="gradientPreview"></div>
                           <div class="modal-buttons">
                                <button id="applyGradientBtn" class="profile-link custom-apply-btn">Apply</button>
                                <button id="cancelColorPickerBtn" class="profile-link danger">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    document.addEventListener('click', (event) => {
        if (event.target.closest('#customizeProfile')) {
            const modal = document.getElementById('colorPickerModal');
            modal.style.display = 'block';
            
            const startColorInput = document.getElementById('startColor');
            const endColorInput = document.getElementById('endColor');
            
            if (startColorInput && endColorInput) {
                const updatePreview = () => {
                    const startColor = startColorInput.value;
                    const endColor = endColorInput.value;
                    document.getElementById('gradientPreview').style.background = 
                        `linear-gradient(to right, ${startColor}, ${endColor})`;
                };
                
                updatePreview();
                
                startColorInput.addEventListener('input', updatePreview);
                endColorInput.addEventListener('input', updatePreview);
                
                document.querySelector('.custom-apply-btn')?.addEventListener('click', () => {
                    const startColor = startColorInput.value;
                    const endColor = endColorInput.value;
                    
                    const profileHeader = document.querySelector('.profile-header');
                    profileHeader.style.background = `linear-gradient(to right, ${startColor}, ${endColor})`;
                    
                    saveProfileColors(startColor, endColor);
                    modal.style.display = 'none';
                });
                
                document.querySelector('.modal-buttons .danger')?.addEventListener('click', () => {
                    modal.style.display = 'none';
                });
            }
        }
    });

    setTimeout(() => {
        // Ajouter l'écouteur d'événement au bouton de logout dans le profil
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }
    }, 0);

    return html;
}

function updatePreview() {
    const startColor = document.getElementById('startColor').value;
    const endColor = document.getElementById('endColor').value;
    document.getElementById('gradientPreview').style.background = `linear-gradient(to right, ${startColor}, ${endColor})`;
}

function closeColorPicker() {
    document.getElementById('colorPickerModal').style.display = 'none';
}

function applyGradient() {
    const startColor = document.getElementById('startColor').value;
    const endColor = document.getElementById('endColor').value;

    const profileHeader = document.querySelector('.profile-header');
    profileHeader.style.background = `linear-gradient(to right, ${startColor}, ${endColor})`;

    saveProfileColors(startColor, endColor);
    closeColorPicker();
}

function saveProfileColors(startColor, endColor) {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    fetch('/api/profile/colors/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({ startColor, endColor })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Colors updated successfully');
        }
    })
    .catch(error => console.error('Error saving colors:', error));
}

function loadLoginPage() {
    const csrfToken = getCookie('csrftoken');
    
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
            <p>Connect with 42: <a href="/api/42/" id="connect-42-link">Connect Here!</a></p>
        </div>
    `;

    document.querySelector('#app').innerHTML = loginHTML;
    
    document.addEventListener('click', function (event) {
        const link = event.target.closest('#connect-42-link');
        if (link) {
            event.preventDefault();
            window.location.href = '/api/42/';
        }
    });
    
    document.querySelector('#login-form').addEventListener('submit', handleLogin);
}

function loadChangePasswordPage() {
    const csrfToken = getCookie('csrftoken');

    const changePasswordHTML = `
        <div class="login-section">
            <h2>Change Password</h2>
            <div id="password-change-errors" class="error-message"></div>
            <form id="password-change-form" method="post" class="fade-in">
                <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
                
                <div class="form-group">
                    <label for="old_password">Old Password</label>
                    <input type="password" name="old_password" id="old_password" class="form-control" placeholder="Enter your current password" required>
                </div>

                <div class="form-group">
                    <label for="new_password1">New Password</label>
                    <input type="password" name="new_password1" id="new_password1" class="form-control" placeholder="Enter a new password" required>
                </div>

                <div class="form-group">
                    <label for="new_password2">Confirm New Password</label>
                    <input type="password" name="new_password2" id="new_password2" class="form-control" placeholder="Confirm new password" required>
                </div>

                <button type="submit" class="btn animated-btn">Change Password</button>
            </form>
        </div>
    `;

    document.querySelector('#app').innerHTML = changePasswordHTML;

    document.getElementById('password-change-form').addEventListener('submit', handlePasswordChange);
}


function loadPasswordChangeSuccessPage() {
    const successHTML = `
        <div class="success-section">
            <h2>Password Changed Successfully</h2>
            <p>Your password has been updated successfully.</p>
            <a href="/profile" data-link>Return to Profile</a>
        </div>
    `;

    document.querySelector('#app').innerHTML = successHTML;
}


async function handlePasswordChange(event) {
    event.preventDefault();

    const form = document.getElementById('password-change-form');
    const formData = new FormData(form);

    try {
        const response = await fetch('/auth/password_change/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            router.navigate('/password-change-success');
        } else {
            displayPasswordChangeErrors(result.errors || { error: ['An unexpected error occurred.'] });
        }
    } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
    }
}

function displayPasswordChangeErrors(errors) {
    const errorDiv = document.getElementById('password-change-errors');
    errorDiv.innerHTML = '';

    for (const field in errors) {
        errors[field].forEach(error => {
            const p = document.createElement('p');
            p.textContent = `${field}: ${error}`;
            p.style.color = 'var(--danger-color)';
            p.style.margin = '5px 0';
            errorDiv.appendChild(p);
        });
    }
}

function generateHomePageContent(data) {
    if (data.is_authenticated) {
        return `
            <div class="container mt-4">
                <!-- Section Utilisateur Connecté -->
                <div class="user-info card mb-4 shadow">
                    <div class="card-body text-center">
                        <h2 class="card-title">Welcome, ${data.username}!</h2>
                        <p class="card-text">
                            You have played <strong>${data.user_profile.games_played}</strong> games and achieved a win rate of <strong>${data.user_profile.win_rate}%</strong>.
                        </p>
                        <a href="/profile" class="btn btn-primary" data-link>View Your Profile</a>
                    </div>
                </div>

                <!-- Section Jeux Populaires -->
                <div class="featured-games card mb-4 shadow">
                    <div class="card-body">
                        <h2 class="card-title text-center mb-4">Featured Games</h2>
                        <div class="row">
                            ${data.featured_games.map(game => `
                                <div class="col-md-4 mb-4">
                                    <div class="card h-100 shadow-sm">
                                        <img src="${game.image}" class="card-img-top" alt="${game.title}">
                                        <div class="card-body">
                                            <h5 class="card-title">${game.title}</h5>
                                            <p class="card-text">${game.description}</p>
                                            <a href="${game.url}" class="btn btn-primary">Play Now</a>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Section Activité Récente -->
                <div class="recent-activity card mb-4 shadow">
                    <div class="card-body">
                        <h2 class="card-title text-center mb-4">Recent Activity</h2>
                        <ul class="list-group list-group-flush">
                            ${data.recent_activity.map(activity => `
                                <li class="list-group-item">${activity}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="login-prompt card mb-4 shadow">
                <div class="card-body text-center">
                    <h2 class="card-title">Please log in to access all features</h2>
                    <a class="nav-link btn btn-primary" href="/login" data-link>Log In</a>
                    <a href="/signup" data-link class="nav-link btn btn-secondary">Sign Up</a>
                </div>
            </div>
        `;
    }
}

// DÉFINIR LES ROUTES
router.on('/', loadHomePage);
router.on('/login', loadLoginPage);
router.on('/signup', loadSignUpPage);
router.on('/profile', loadProfilePage);
router.on('/change-password', loadChangePasswordPage);
router.on('/password-change-success', loadPasswordChangeSuccessPage);


// DÉMARRER LE ROUTEUR
router.start();

// Gestion du thème sombre
function toggleDarkMode() {
    const body = document.documentElement;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? '' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Initialiser le thème au chargement
function initDarkMode() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
    
    const darkModeBtn = document.querySelector('#theme-toggle');
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', toggleDarkMode);
    }
});