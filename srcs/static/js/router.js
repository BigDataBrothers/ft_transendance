// class Router {
//     constructor(routes) {
//         this.routes = routes;
//         this.rootElem = document.getElementById('app');

//         window.addEventListener('popstate', () => this.handleRoute());

//         document.addEventListener('click', (e) => {
//             const link = e.target.closest('[data-link]');
//             if (link) {
//                 e.preventDefault();
//                 this.navigateTo(link.getAttribute('href'));
//             }
//         });
//     }

//     async navigateTo(url) {
//         history.pushState(null, null, url);
//         await this.handleRoute();
//     }

//     async handleRoute() {
//         const path = window.location.pathname;
//         const route = this.routes[path] || this.routes['/404'];

//         this.rootElem.innerHTML = '<div class="loading">Chargement...</div>';

//         try {
//             const view = await route();
//             this.rootElem.innerHTML = view;
//         } catch (err) {
//             console.error('Erreur lors du chargement de la vue:', err);
//             this.rootElem.innerHTML = '<div class="error">Erreur de chargement</div>';
//         }
//     }
// }

// // Définition des routes
// const routes = {
//     '/': async () => { 
//         try {
//             const response = await fetch('/api/home/', { headers: { "X-Requested-With": "XMLHttpRequest" } });
//             if (!response.ok) throw new Error(`Erreur réseau (${response.status})`);
            
//             const data = await response.json();
            
//             if (!data.is_authenticated) {
//                 return `<div class="alert alert-warning">You are not logged in. <a href="/login" data-link>Log in here</a>.</div>`;
//             }

//             return `
//                 <h1>Welcome, ${data.username}!</h1>
//                 <p>You have played <strong>${data.user_profile.games_played}</strong> games 
//                 and achieved a win rate of <strong>${data.user_profile.win_rate}%</strong>.</p>

//                 <h2>Featured Games</h2>
//                 <div class="row">
//                     ${data.featured_games.map(game => `
//                         <div class="col-md-4">
//                             <div class="card">
//                                 <img src="${game.image}" class="card-img-top">
//                                 <div class="card-body">
//                                     <h5>${game.title}</h5>
//                                     <a href="${game.url}" class="btn btn-primary">Play Now</a>
//                                 </div>
//                             </div>
//                         </div>
//                     `).join("")}
//                 </div>

//                 <h2>Recent Activity</h2>
//                 <ul>
//                     ${data.recent_activity.map(activity => `<li>${activity.user} ${activity.action}</li>`).join("")}
//                 </ul>
//             `;
//         } catch (err) {
//             console.error('Erreur lors du chargement de l\'accueil:', err);
//             return `<div class="error">Erreur lors du chargement de la page d'accueil (${err.message})</div>`;
//         }
//     },
//     '/404': () => '<div class="error">Page non trouvée</div>'
// };

// // Initialisation du router
// export const router = new Router(routes);
