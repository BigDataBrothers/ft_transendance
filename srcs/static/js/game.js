// game.js - Logique principale du jeu Pong

export class PongGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error("Canvas not found!");
            return;
        }
        this.context = this.canvas.getContext('2d');
        this.initGame();
        this.bindEvents();
        document.addEventListener("game:start", () => this.play());
    }

    initGame() {
        this.PLAYER_HEIGHT = 80;
        this.PLAYER_WIDTH = 4;
        this.BALL_RADIUS = 5;
        this.BALL_SPEED = 2;
        this.PLAYER_SPEED = 5;
        this.winnerScore = 3;

        this.resetGame();
    }

    resetGame() {
        this.isGameOver = false;
        this.gameData = {
            player: { y: this.canvas.height / 2 - this.PLAYER_HEIGHT / 2, score: 0 },
            computer: { y: this.canvas.height / 2 - this.PLAYER_HEIGHT / 2, score: 0 },
            ball: {
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                speedX: this.BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
                speedY: this.BALL_SPEED * (Math.random() > 0.5 ? 1 : -1)
            }
        };
    }

    bindEvents() {
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));
    }

    handleKeyDown(event) {
        if (event.key === 'w') this.isUpPressed = true;
        if (event.key === 's') this.isDownPressed = true;
    }

    handleKeyUp(event) {
        if (event.key === 'w') this.isUpPressed = false;
        if (event.key === 's') this.isDownPressed = false;
    }

    movePlayer() {
        if (this.isUpPressed) this.gameData.player.y = Math.max(0, this.gameData.player.y - this.PLAYER_SPEED);
        if (this.isDownPressed) this.gameData.player.y = Math.min(this.canvas.height - this.PLAYER_HEIGHT, this.gameData.player.y + this.PLAYER_SPEED);
    }

    moveBall() {
        let ball = this.gameData.ball;
        ball.x += ball.speedX;
        ball.y += ball.speedY;

        if (ball.y <= 0 || ball.y >= this.canvas.height) {
            ball.speedY *= -1;
        }
    }

    draw() {
        let ctx = this.context;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.fillStyle = "white";
        ctx.fillRect(10, this.gameData.player.y, this.PLAYER_WIDTH, this.PLAYER_HEIGHT);
        ctx.fillRect(this.canvas.width - this.PLAYER_WIDTH - 10, this.gameData.computer.y, this.PLAYER_WIDTH, this.PLAYER_HEIGHT);
        ctx.beginPath();
        ctx.arc(this.gameData.ball.x, this.gameData.ball.y, this.BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
    }

    play() {
        if (!this.isGameOver) {
            this.movePlayer();
            this.moveBall();
            this.draw();
            requestAnimationFrame(() => this.play());
        }
    }

    
}

//////////////////////////

// game.js - Logique complète du jeu Pong avec menus

export class PongGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error("Canvas not found!");
            return;
        }
        this.context = this.canvas.getContext('2d');
        this.initGame();
        this.initMenuSystem();
        this.bindEvents();
    }

    initGame() {
        // Paramètres du jeu par défaut (difficulté moyenne)
        this.PLAYER_HEIGHT = 80;
        this.PLAYER_WIDTH = 10;
        this.BALL_RADIUS = 5;
        this.BALL_SPEED = 4;
        this.PLAYER_SPEED = 5;
        this.COMPUTER_SPEED = 3;
        this.winnerScore = 5;
        this.isUpPressed = false;
        this.isDownPressed = false;
        this.gameActive = false;
        this.gameMode = 'single'; // 'single' ou 'multi'
        this.difficulty = 'medium'; // 'easy', 'medium', 'hard'
        
        // Statistiques
        this.stats = this.loadStats() || {
            totalGames: 0,
            playerWins: 0,
            computerWins: 0,
            perfectPlayerGames: 0,
            perfectComputerGames: 0,
            recentGames: []
        };

        this.resetGame();
    }

    loadStats() {
        const savedStats = localStorage.getItem('pongStats');
        return savedStats ? JSON.parse(savedStats) : null;
    }

    saveStats() {
        localStorage.setItem('pongStats', JSON.stringify(this.stats));
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        // Mettre à jour les éléments du DOM pour les statistiques
        document.getElementById('totalGames').textContent = this.stats.totalGames;
        document.getElementById('totalPlayerScore').textContent = this.stats.playerWins;
        document.getElementById('totalComputerScore').textContent = this.stats.computerWins;
        
        const winRatio = this.stats.totalGames > 0 
            ? ((this.stats.playerWins / this.stats.totalGames) * 100).toFixed(1) 
            : 0;
        document.getElementById('winRatio').textContent = `${winRatio}%`;
        
        document.getElementById('perfectPlayer').textContent = this.stats.perfectPlayerGames;
        document.getElementById('perfectComputer').textContent = this.stats.perfectComputerGames;
        
        // Afficher les dernières parties
        const lastGamesElement = document.getElementById('lastGames');
        lastGamesElement.innerHTML = '';
        
        this.stats.recentGames.slice(0, 5).forEach(game => {
            const li = document.createElement('li');
            li.textContent = `${game.date}: Joueur ${game.playerScore} - ${game.computerScore} Ordinateur`;
            lastGamesElement.appendChild(li);
        });
    }

    initMenuSystem() {
        // États des menus
        this.currentMenu = null;
        this.selectedMenuIndex = 0;
        
        // Éléments du menu
        this.menuElements = {
            mainMenu: document.getElementById('menu'),
            modeMenu: document.getElementById('menuMode'),
            difficultyMenu: document.getElementById('menuDifficulty'),
            infoMenu: document.getElementById('menuInfo'),
            gameStats: document.getElementById('gameStats'),
            insertCoin: document.getElementById('menuLink'),
            firstInstruct: document.getElementById('firstInstruct'),
            secondInstruct: document.getElementById('secondInstruct')
        };
        
        // Configurer le texte d'info
        document.getElementById('info1').textContent = 
            "Pong est l'un des premiers jeux vidéo arcade, créé par Atari en 1972. " +
            "Utilisez les touches ↑ et ↓ pour déplacer votre raquette.";
    }

    resetGame() {
        this.isGameOver = false;
        this.winner = null;
        this.isPaused = false;
        
        // Ajuster les paramètres en fonction de la difficulté
        switch (this.difficulty) {
            case 'easy':
                this.BALL_SPEED = 3;
                this.COMPUTER_SPEED = 2;
                break;
            case 'medium':
                this.BALL_SPEED = 4;
                this.COMPUTER_SPEED = 3;
                break;
            case 'hard':
                this.BALL_SPEED = 5;
                this.COMPUTER_SPEED = 4;
                break;
        }
        
        this.gameData = {
            player: { y: this.canvas.height / 2 - this.PLAYER_HEIGHT / 2, score: 0 },
            computer: { y: this.canvas.height / 2 - this.PLAYER_HEIGHT / 2, score: 0 },
            player2: { y: this.canvas.height / 2 - this.PLAYER_HEIGHT / 2 }, // Pour le mode multi
            ball: {
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                speedX: this.BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
                speedY: this.BALL_SPEED * (Math.random() * 2 - 1)
            }
        };
    }

    bindEvents() {
        // Contrôles du jeu
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));
        
        // Bouton Insert Coin
        this.menuElements.insertCoin.addEventListener('click', () => this.showMenu('mainMenu'));
        
        // Boutons du menu principal
        document.getElementById('pButton').addEventListener('click', () => this.showMenu('modeMenu'));
        document.getElementById('sButton').addEventListener('click', () => this.showMenu('difficultyMenu'));
        document.getElementById('iButton').addEventListener('click', () => this.showMenu('infoMenu'));
        document.getElementById('qButton').addEventListener('click', () => this.hideAllMenus());
        
        // Boutons du menu mode
        document.getElementById('siButton').addEventListener('click', () => {
            this.gameMode = 'single';
            this.startGame();
        });
        document.getElementById('muButton').addEventListener('click', () => {
            this.gameMode = 'multi';
            this.startGame();
        });
        document.getElementById('qmButton').addEventListener('click', () => this.showMenu('mainMenu'));
        
        // Boutons du menu difficulté
        document.getElementById('esButton').addEventListener('click', () => {
            this.difficulty = 'easy';
            this.showMenu('mainMenu');
        });
        document.getElementById('mdButton').addEventListener('click', () => {
            this.difficulty = 'medium';
            this.showMenu('mainMenu');
        });
        document.getElementById('hdButton').addEventListener('click', () => {
            this.difficulty = 'hard';
            this.showMenu('mainMenu');
        });
        document.getElementById('qdButton').addEventListener('click', () => this.showMenu('mainMenu'));
        
        // Boutons du menu info
        document.getElementById('moreBubble').addEventListener('click', () => this.showMenu('gameStats'));
        document.getElementById('closeBubble').addEventListener('click', () => this.showMenu('mainMenu'));
    }

    showMenu(menuName) {
        // Cacher tous les menus d'abord
        this.hideAllMenus();
        
        // Afficher le menu demandé
        if (this.menuElements[menuName]) {
            this.menuElements[menuName].classList.remove('hidden');
            this.currentMenu = menuName;
            
            // Afficher les instructions de navigation
            if (menuName !== 'gameStats') {
                this.menuElements.secondInstruct.classList.remove('hidden');
            }
            
            // Si on affiche les stats, les mettre à jour
            if (menuName === 'gameStats') {
                this.updateStatsDisplay();
            }
            
            // Réinitialiser la sélection
            this.selectedMenuIndex = 0;
            this.updateMenuSelection();
        }
    }

    hideAllMenus() {
        // Cacher tous les menus
        for (const key in this.menuElements) {
            if (key !== 'insertCoin' && key !== 'firstInstruct') {
                this.menuElements[key].classList.add('hidden');
            }
        }
        this.currentMenu = null;
    }

    updateMenuSelection() {
        if (!this.currentMenu) return;
        
        const currentMenuElement = this.menuElements[this.currentMenu];
        const buttons = currentMenuElement.querySelectorAll('button');
        
        // Retirer la classe active de tous les boutons
        buttons.forEach(btn => btn.classList.remove('active'));
        
        // Ajouter la classe active au bouton sélectionné
        if (buttons[this.selectedMenuIndex]) {
            buttons[this.selectedMenuIndex].classList.add('active');
        }
    }

    navigateMenu(direction) {
        if (!this.currentMenu) return;
        
        const currentMenuElement = this.menuElements[this.currentMenu];
        const buttons = currentMenuElement.querySelectorAll('button');
        
        if (direction === 'up') {
            this.selectedMenuIndex = (this.selectedMenuIndex - 1 + buttons.length) % buttons.length;
        } else if (direction === 'down') {
            this.selectedMenuIndex = (this.selectedMenuIndex + 1) % buttons.length;
        }
        
        this.updateMenuSelection();
    }

    selectCurrentMenuItem() {
        if (!this.currentMenu) return;
        
        const currentMenuElement = this.menuElements[this.currentMenu];
        const buttons = currentMenuElement.querySelectorAll('button');
        
        if (buttons[this.selectedMenuIndex]) {
            buttons[this.selectedMenuIndex].click();
        }
    }

    handleKeyDown(event) {
        // Navigation dans les menus
        if (this.currentMenu) {
            switch (event.key) {
                case 'ArrowUp':
                    this.navigateMenu('up');
                    event.preventDefault();
                    break;
                case 'ArrowDown':
                    this.navigateMenu('down');
                    event.preventDefault();
                    break;
                case ' ':
                case 'Enter':
                    this.selectCurrentMenuItem();
                    event.preventDefault();
                    break;
                case 'Escape':
                    if (this.currentMenu !== 'mainMenu') {
                        this.showMenu('mainMenu');
                    } else {
                        this.hideAllMenus();
                    }
                    event.preventDefault();
                    break;
            }
        }
        
        // Contrôles du jeu
        if (this.gameActive) {
            if (event.key === 'w' || event.key === 'ArrowUp') this.isUpPressed = true;
            if (event.key === 's' || event.key === 'ArrowDown') this.isDownPressed = true;
            
            // Contrôles pour le joueur 2 en mode multi
            if (this.gameMode === 'multi') {
                if (event.key === 'o') this.isPlayer2UpPressed = true;
                if (event.key === 'l') this.isPlayer2DownPressed = true;
            }
            
            // Pause
            if (event.key === 'p') {
                this.isPaused = !this.isPaused;
                if (!this.isPaused) {
                    this.play();
                }
            }
            
            // Recommencer une partie
            if (event.key === 'r' && this.isGameOver) {
                this.resetGame();
                this.play();
            }
        }
    }

    handleKeyUp(event) {
        if (event.key === 'w' || event.key === 'ArrowUp') this.isUpPressed = false;
        if (event.key === 's' || event.key === 'ArrowDown') this.isDownPressed = false;
        
        if (this.gameMode === 'multi') {
            if (event.key === 'o') this.isPlayer2UpPressed = false;
            if (event.key === 'l') this.isPlayer2DownPressed = false;
        }
    }

    startGame() {
        this.hideAllMenus();
        this.resetGame();
        this.gameActive = true;
        this.play();
    }

    endGame() {
        this.gameActive = false;
        this.isGameOver = true;
        
        // Mettre à jour les statistiques
        this.stats.totalGames++;
        
        if (this.winner === 'player') {
            this.stats.playerWins++;
            if (this.gameData.computer.score === 0) {
                this.stats.perfectPlayerGames++;
            }
        } else {
            this.stats.computerWins++;
            if (this.gameData.player.score === 0) {
                this.stats.perfectComputerGames++;
            }
        }
        
        // Ajouter cette partie à l'historique
        const now = new Date();
        const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
        
        this.stats.recentGames.unshift({
            date: dateStr,
            playerScore: this.gameData.player.score,
            computerScore: this.gameData.computer.score,
            difficulty: this.difficulty
        });
        
        // Garder seulement les 10 dernières parties
        if (this.stats.recentGames.length > 10) {
            this.stats.recentGames.pop();
        }
        
        // Sauvegarder les stats
        this.saveStats();
    }

    movePlayer() {
        if (this.isUpPressed) this.gameData.player.y = Math.max(0, this.gameData.player.y - this.PLAYER_SPEED);
        if (this.isDownPressed) this.gameData.player.y = Math.min(this.canvas.height - this.PLAYER_HEIGHT, this.gameData.player.y + this.PLAYER_SPEED);
    }

    movePlayer2OrComputer() {
        if (this.gameMode === 'multi') {
            // Déplacer le joueur 2
            if (this.isPlayer2UpPressed) this.gameData.computer.y = Math.max(0, this.gameData.computer.y - this.PLAYER_SPEED);
            if (this.isPlayer2DownPressed) this.gameData.computer.y = Math.min(this.canvas.height - this.PLAYER_HEIGHT, this.gameData.computer.y + this.PLAYER_SPEED);
        } else {
            // L'IA de l'ordinateur
            const computer = this.gameData.computer;
            const ball = this.gameData.ball;
            const computerCenter = computer.y + this.PLAYER_HEIGHT / 2;
            
            // Ajout d'une "erreur" pour rendre l'IA battable
            const errorFactor = this.difficulty === 'easy' ? 30 : (this.difficulty === 'medium' ? 20 : 10);
            
            if (ball.speedX > 0) { // La balle va vers l'ordinateur
                if (ball.y < computerCenter - errorFactor) {
                    computer.y = Math.max(0, computer.y - this.COMPUTER_SPEED);
                } else if (ball.y > computerCenter + errorFactor) {
                    computer.y = Math.min(this.canvas.height - this.PLAYER_HEIGHT, computer.y + this.COMPUTER_SPEED);
                }
            } else {
                // Quand la balle s'éloigne, l'ordinateur retourne doucement au centre
                if (Math.abs(computerCenter - this.canvas.height / 2) > 30) {
                    if (computerCenter > this.canvas.height / 2) {
                        computer.y -= this.COMPUTER_SPEED / 2;
                    } else {
                        computer.y += this.COMPUTER_SPEED / 2;
                    }
                }
            }
        }
    }

    checkCollision() {
        const ball = this.gameData.ball;
        const player = this.gameData.player;
        const computer = this.gameData.computer;

        // Collision avec le mur du haut ou du bas
        if (ball.y - this.BALL_RADIUS <= 0 || ball.y + this.BALL_RADIUS >= this.canvas.height) {
            ball.speedY *= -1;
        }

        // Collision avec la raquette du joueur
        if (ball.x - this.BALL_RADIUS <= 10 + this.PLAYER_WIDTH && 
            ball.y >= player.y && 
            ball.y <= player.y + this.PLAYER_HEIGHT) {
            ball.speedX = Math.abs(ball.speedX); // Rebondit vers la droite
            
            // Angle de rebond basé sur où la balle touche la raquette
            const hitPosition = (ball.y - player.y) / this.PLAYER_HEIGHT;
            ball.speedY = (hitPosition - 0.5) * 2 * this.BALL_SPEED;
        }

        // Collision avec la raquette de l'ordinateur/joueur 2
        if (ball.x + this.BALL_RADIUS >= this.canvas.width - this.PLAYER_WIDTH - 10 && 
            ball.y >= computer.y && 
            ball.y <= computer.y + this.PLAYER_HEIGHT) {
            ball.speedX = -Math.abs(ball.speedX); // Rebondit vers la gauche
            
            // Angle de rebond basé sur où la balle touche la raquette
            const hitPosition = (ball.y - computer.y) / this.PLAYER_HEIGHT;
            ball.speedY = (hitPosition - 0.5) * 2 * this.BALL_SPEED;
        }

        // La balle sort à gauche (point pour l'ordinateur/joueur 2)
        if (ball.x < 0) {
            this.gameData.computer.score++;
            this.resetBall();
        }

        // La balle sort à droite (point pour le joueur)
        if (ball.x > this.canvas.width) {
            this.gameData.player.score++;
            this.resetBall();
        }

        // Vérifier si un joueur a gagné
        if (this.gameData.player.score >= this.winnerScore) {
            this.isGameOver = true;
            this.winner = 'player';
            this.endGame();
        } else if (this.gameData.computer.score >= this.winnerScore) {
            this.isGameOver = true;
            this.winner = this.gameMode === 'multi' ? 'player2' : 'computer';
            this.endGame();
        }
    }

    resetBall() {
        this.gameData.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            speedX: this.BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
            speedY: this.BALL_SPEED * (Math.random() * 2 - 1) // Angle aléatoire
        };
    }

    moveBall() {
        let ball = this.gameData.ball;
        ball.x += ball.speedX;
        ball.y += ball.speedY;
    }

    draw() {
        let ctx = this.context;
        // Effacer le canvas
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessiner la ligne centrale
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.setLineDash([5, 15]);
        ctx.moveTo(this.canvas.width / 2, 0);
        ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Dessiner les raquettes
        ctx.fillStyle = "white";
        ctx.fillRect(10, this.gameData.player.y, this.PLAYER_WIDTH, this.PLAYER_HEIGHT);
        ctx.fillRect(this.canvas.width - this.PLAYER_WIDTH - 10, this.gameData.computer.y, this.PLAYER_WIDTH, this.PLAYER_HEIGHT);
        
        // Dessiner la balle
        ctx.beginPath();
        ctx.arc(this.gameData.ball.x, this.gameData.ball.y, this.BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Afficher le score
        ctx.font = "30px Arial";
        ctx.fillText(this.gameData.player.score, this.canvas.width / 4, 50);
        ctx.fillText(this.gameData.computer.score, 3 * this.canvas.width / 4, 50);

        // Afficher la difficulté en cours
        ctx.font = "14px Arial";
        ctx.fillText(`Difficulté: ${this.difficulty}`, 10, this.canvas.height - 10);
        ctx.fillText(`Mode: ${this.gameMode === 'single' ? 'Solo' : 'Multi'}`, this.canvas.width - 120, this.canvas.height - 10);

        // Afficher un message si le jeu est en pause
        if (this.isPaused) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.fillStyle = "white";
            ctx.font = "36px Arial";
            ctx.textAlign = "center";
            ctx.fillText("PAUSE", this.canvas.width / 2, this.canvas.height / 2);
            ctx.font = "18px Arial";
            ctx.fillText("Appuyez sur 'P' pour continuer", this.canvas.width / 2, this.canvas.height / 2 + 40);
            ctx.textAlign = "start";
        }

        // Afficher un message si le jeu est terminé
        if (this.isGameOver) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.fillStyle = "white";
            ctx.font = "36px Arial";
            ctx.textAlign = "center";
            
            let winnerText = "";
            if (this.winner === 'player') {
                winnerText = "Joueur 1 a gagné!";
            } else if (this.winner === 'player2') {
                winnerText = "Joueur 2 a gagné!";
            } else {
                winnerText = "L'ordinateur a gagné!";
            }
            
            ctx.fillText(winnerText, this.canvas.width / 2, this.canvas.height / 2 - 40);
            
            ctx.font = "24px Arial";
            ctx.fillText(`Score final: ${this.gameData.player.score} - ${this.gameData.computer.score}`, 
                this.canvas.width / 2, this.canvas.height / 2);
                
            ctx.fillText("Appuyez sur 'R' pour rejouer", this.canvas.width / 2, this.canvas.height / 2 + 40);
            ctx.fillText("Appuyez sur 'ESC' pour retourner au menu", this.canvas.width / 2, this.canvas.height / 2 + 80);
            ctx.textAlign = "start";
        }
    }

    play() {
        if (!this.gameActive) return;
        
        if (!this.isGameOver && !this.isPaused) {
            this.movePlayer();
            this.movePlayer2OrComputer();
            this.moveBall();
            this.checkCollision();
            this.draw();
            requestAnimationFrame(() => this.play());
        } else {
            this.draw(); // Afficher l'écran de pause ou de fin
            
            if (!this.isGameOver && this.isPaused) {
                requestAnimationFrame(() => this.play());
            }
        }
    }
}

// Initialisation du jeu
document.addEventListener('DOMContentLoaded', () => {
    const pongGame = new PongGame('gameCanvas');
});