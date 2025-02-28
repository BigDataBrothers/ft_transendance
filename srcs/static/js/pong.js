// ----------------------------------------------------
// Déclaration des éléments DOM utilisés dans le script
// ----------------------------------------------------

const firstInstruct = document.getElementById("firstInstruct");
const secondInstruct = document.getElementById("secondInstruct");
const menuLink = document.getElementById("menuLink");

const menu = document.getElementById("menu");
const menuItems = document.querySelectorAll("#menu .button");
const playButton = document.getElementById("pButton");
const infoButton = document.getElementById("iButton");
const quitButton = document.getElementById("qButton")

const infoBubble = document.getElementById("menuInfo");
const infoItems = document.querySelectorAll("#menuInfo .button");
const closeBubble = document.getElementById("closeBubble");
const moreBubble = document.getElementById("moreBubble");

const modeItems = document.querySelectorAll("#menuMode .button");
const menuMode = document.getElementById("menuMode");
const singleButton = document.getElementById("siButton");
const multiButton = document.getElementById("muButton");
const quitMButton = document.getElementById("qmButton");

const difficultyItems = document.querySelectorAll("#menuDifficulty .button");
const menuDifficulty = document.getElementById("menuDifficulty");
const easyButton = document.getElementById("esButton");
const mediumButton = document.getElementById("mdButton");
const hardMButton = document.getElementById("hdButton");
const quitDMButton = document.getElementById("qdButton");

const startMenu = document.getElementById("menuStart");
const startButton = document.getElementById("staButton");
const quitStButton = document.getElementById("qsButton");

const title = document.getElementById("title");
const pong = document.getElementById("gameCanvas");
const MAX_BALL_SPEED = 8; // Vitesse maximale autorisée


let currentFocus = 0;
let bubbleFocus = 0;
let modeFocus = 0;
let difficultyFocus = 0;

let difficultySelect = "md";
let gameMode = 'single'; // 'single' ou 'multi'
let isWPressed = false;
let isSPressed = false;

let textInterval;

let focusIndexes = {
    menu: { value: 0 },
    bubble: { value: 0 },
    mode: { value: 0 },
    difficulty: { value: 0 }
};

let gameData = {
    totalGames: 0, // Nombre total de parties jouées
    totalScore: { player: 0, computer: 0 }, // Score total cumulé
    winLossRatio: { wins: 0, losses: 0 }, // Taux de victoires/défaites
    perfectGames: { player: 0, computer: 0 }, // Nombre de parties parfaites
    lastGames: [], // Historique des dernières parties
    gameStartTime: null, // Heure de début de la partie
    gameDuration: null, // Durée de la partie
};

// pour charger les sons
const hitSound = new Audio('hit.wav');
const scoreSound = new Audio('score.wav');
const winSound = new Audio('win.wav');

// Texte d'info pour l'info-bulle
const infoText = "PONG is one of the most iconic video games ever created and is often considered the first commercially successful arcade game. It was developed by Ralph H Baer and Nolan Bushnell at Atari in 1972. The gameplay is a simple simulation of table tennis, where two paddles are used to hit a ball back and forth.";


// ----------------------------------------------------
// Fonctions pour la gestion du menu
// ----------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM chargé, vérification des éléments...");

    const requiredElements = ["menuDifficulty", /**"title",**/ "pong", "gameCanvas", "menu"];
    
    requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
            console.error(`❌ Élément manquant : ${id}`);
        } else {
            console.log(`✅ Élément trouvé : ${id}`);
        }
    });

    initializeBackgroundGame();  // Assure-toi que ton jeu s'initialise après le chargement du DOM.
    if (infoBubble) {
        infoBubble.style.display = 'none';
    }
});


/**
 * Ouvre ou ferme le menu principal
 */
function toggleMenu() {
    menuItems[focusIndexes.menu.value].id = '';
    menuLink.style.display = 'none';
    firstInstruct.style.display = 'none';
    if (menu.style.display === "none" || menu.style.display === "") {
        currentFocus = 0;
        menu.style.display = 'block';
        menuItems[currentFocus].focus();
        if(secondInstruct.style.display === 'none')
            secondInstruct.style.display = 'block';
    }
}

/** 
 * Quit Any Menu
*/

function selectMenu(targetMenu, actuMenu, focus, itemsMenu) {

    actuMenu.style.display = 'none';
    if((targetMenu.style.display === 'none' || targetMenu.style.display === "") && targetMenu !== menuLink)
        {
            focus = 0;
            targetMenu.style.display = "block";
            itemsMenu[focus].focus();

        } else {
            targetMenu.style.display = "block";
            if(secondInstruct.style.display === 'block')
                secondInstruct.style.display = 'none';
            if(firstInstruct.style.display === 'none')
                firstInstruct.style.display = 'block';
        }
        focusIndexes.menu.value = 0;
        focusIndexes.bubble.value = 0;
        focusIndexes.difficulty.value = 0;
        focusIndexes.mode.value = 0;
}


function toggleInfoBubble() {
    if (infoBubble.style.display === 'none' || infoBubble.style.display === "") {
        infoBubble.style.display = 'block';
        bubbleFocus = 0;
        disableMenu();
        // Ajouter une vérification pour s'assurer que le texte est typé seulement lors du clic sur le bouton
        typeText("info1", infoText, 50);
    } else {
        infoBubble.style.display = 'none';
        enableMenu();
    }
}

/**
 * Désactive tous les boutons du menu
 */
function disableMenu() {
    menuItems.forEach(button => {
        button.disabled = true;
    });
    moreBubble.focus();
}

/**
 * Réactive tous les boutons du menu
 */
function enableMenu() {
    menuItems.forEach(button => {
        button.disabled = false;
    });
    infoButton.focus();
}

/**
 * Affiche le texte progressivement
 */
function typeText(elementId, text, speed) {
    let i = 0;
    const element = document.getElementById(elementId);
    element.innerHTML = "";  // Effacer l'élément avant de commencer à écrire

    if (textInterval) {
        clearInterval(textInterval);
    }

    textInterval = setInterval(function() {
        element.innerHTML += text.charAt(i);
        if (text.charAt(i) === '.') {
            element.innerHTML += "<br><br>"; // Ajouter un retour à la ligne après un point
        }
        i++;
        if (i >= text.length) {
            clearInterval(textInterval);
        }
    }, speed);
}

function playGame() {
    if (!menuDifficulty) {
        console.error("menuDifficulty introuvable !");
        return;
    }
    menuDifficulty.style.display = 'none';
    title.style.display = 'none';
    pong.style.display = 'block';
    if(secondInstruct && secondInstruct.style.display === 'block') {
        secondInstruct.style.display = 'none';
    }
    initializeGame();
}


// ----------------------------------------------------
// Gestion des événements
// ----------------------------------------------------

/**
 * Ouvre/ferme le menu lorsque l'on clique sur "INSERT COIN"
 */
menuLink.addEventListener("click", function(event) {
    event.preventDefault();
    toggleMenu();
});

/**
 * Fermeture de l'info-bulle en cliquant sur "Close"
 */
closeBubble.addEventListener("click", function() {
    enableMenu();
    infoBubble.style.display = 'none';
    infoButton.focus();
    
    document.getElementById("info1").innerHTML = "";

    if (textInterval) {
        clearInterval(textInterval);
    }
});

quitButton.addEventListener("click", function() {
    selectMenu(menuLink, menu, null, null);
})

/**
 * Ouverture de l'info-bulle en cliquant sur "INFO"
 */
infoButton.addEventListener("click", function() {
    toggleInfoBubble();
});

/**
 * Action pour "More Info"
 */
moreBubble.addEventListener("click", function () {
    window.open("https://en.wikipedia.org/wiki/Pong", "_blank");
});

moreBubble.addEventListener("focus", function () {
    moreBubble.setAttribute('title', 'Opens Pong Wikipedia page in a new window.');
});

playButton.addEventListener("click", function() {
    selectMenu(menuMode, menu, modeFocus, modeItems)
})

singleButton.addEventListener("click", function() {
    selectMenu(menuDifficulty, menuMode, difficultyFocus, difficultyItems)
})

quitMButton.addEventListener("click", function() {
    selectMenu(menu, menuMode, currentFocus, menuItems)
})

multiButton.addEventListener("click", function() {
    gameMode = 'multi';
    selectMenu(menuDifficulty, menuMode, difficultyFocus, difficultyItems);
});

easyButton.addEventListener("click", function() {
    difficultySelect = "es";
    playGame();
})

mediumButton.addEventListener("click", function() {
    difficultySelect = "md";
    playGame();
})

hardMButton.addEventListener("click", function() {
    difficultySelect = "hd";
    playGame();
})

quitDMButton.addEventListener("click", function() {
    selectMenu(menuMode, menuDifficulty, modeFocus, modeItems)
})

/**
 * Gestion des touches directionnelles pour naviguer dans le menu et l'info-bulle
  */
function handleArrowNavigation(event, focusIndex, items) {
    if (event.key === "ArrowDown") {
        event.preventDefault();
        focusIndex.value = (focusIndex.value + 1) % items.length;
        items[focusIndex.value].focus();
    } else if (event.key === "ArrowUp") {
        event.preventDefault();
        focusIndex.value = (focusIndex.value - 1 + items.length) % items.length;
        items[focusIndex.value].focus();
    }
}

// Gestionnaire d'événements
document.addEventListener("keydown", function(event) {
    if (menu.style.display === "block" && infoBubble.style.display !== "block") { 
        // Navigation dans le menu
        handleArrowNavigation(event, focusIndexes.menu, menuItems);
        
        if (event.key === " " && menuItems[focusIndexes.menu.value].id === "pButton") {
            selectMenu(menuMode, menu, modeFocus, modeItems);
        } else if (event.key === " " && menuItems[focusIndexes.menu.value].id === "iButton") {
            toggleInfoBubble();
        } else if (event.key === " " && menuItems[focusIndexes.menu.value].id === "qButton") {
            selectMenu(menuLink, menu, null, null);
        }
            
    } else if (infoBubble.style.display === "block") {
        // Navigation dans l'info-bulle
        handleArrowNavigation(event, focusIndexes.bubble, infoItems);

    } else if (menuMode.style.display === "block") {
        // Navigation dans le menu des modes
        handleArrowNavigation(event, focusIndexes.mode, modeItems);

        if (event.key === " " && modeItems[focusIndexes.mode.value].id === "siButton") {
            selectMenu(menuDifficulty, menuMode, difficultyFocus, difficultyItems);
        } else if (event.key === " " && modeItems[focusIndexes.mode.value].id === "qmButton") {
            selectMenu(menu, menuMode, currentFocus, menuItems);
        }

    } else if (menuDifficulty.style.display === "block") {
        // Navigation dans le menu de difficulté
        handleArrowNavigation(event, focusIndexes.difficulty, difficultyItems);

        if (event.key === " " && ["esButton", "mdButton", "hdButton"].includes(difficultyItems[focusIndexes.difficulty.value].id)) {
            if (difficultyItems[focusIndexes.difficulty.value].id === "esButton") {
                difficultySelect = "es";
            } else if (difficultyItems[focusIndexes.difficulty.value].id === "mdButton") {
                difficultySelect = "md";
            } else if (difficultyItems[focusIndexes.difficulty.value].id === "hdButton") {
                difficultySelect = "hd";
            }
            playGame();
        } else if (event.key === " " && difficultyItems[focusIndexes.difficulty.value].id === "qdButton") {
            selectMenu(menuMode, menuDifficulty, modeFocus, modeItems);
        }

    } else if (pong.style.display === 'block') {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            // Placeholder for pong-specific logic
        }
    } else {
        if (title) {
            title.style.display = 'block';
        } else {
            console.error("title introuvable !");
        }
        
        pong.style.display = 'none';
        stop();
        toggleMenu();
    }
});

/**
 * PONG
*/

'use strict';

// Configuration des constantes
let DIFFICULTY = 1;
let isGameOver = false;


const PLAYER_HEIGHT = 80;
const PLAYER_WIDTH = 4;
const BALL_RADIUS = 5;
const BALL_INITIAL_SPEED = 2;
const COMPUTER_SPEED_FACTOR = 0.85;
const PLAYER_SPEED = 5; // Vitesse de déplacement du joueur
const COLORS = {
    background: '#262324',
    paddle: '#fcfcec',
    ball: '#fcfcec',
    line: '#fcfcec'
};
const winnerScore = 3;

let canvas, context, game, anim;
let isGamming = false;
let isUpPressed = false;
let isDownPressed = false;

// Initialisation du jeu
function initializeGame() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Canvas not found!");
        return;
    }
    gameData.gameStartTime = Date.now();
    context = canvas.getContext('2d');

    game = {
        player: { y: canvas.height / 2 - PLAYER_HEIGHT / 2, score: 0 },
        computer: { y: canvas.height / 2 - PLAYER_HEIGHT / 2, score: 0 },
        ball: {
            x: canvas.width / 2,
            y: canvas.height / 2,
            prevX: canvas.width / 2, // precedent emplacement
            prevY: canvas.height / 2, // precedent emplacement
            r: BALL_RADIUS,
            speed: { x: BALL_INITIAL_SPEED, y: BALL_INITIAL_SPEED },
            lastHit: null
        }
    };

    // Configuration de la difficulté
    if (difficultySelect === "es") {
        DIFFICULTY = 0.5; // Facile
    } else {
        DIFFICULTY = 1; // Moyen et Difficile
    }

    isGameOver = false;
    isGamming = true;

    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);

    play();
}

// Gestion des événements clavier
function keyDownHandler(event) {
    switch(event.key) {
        case 'w': isUpPressed = true; break; // Joueur 1
        case 's': isDownPressed = true; break; // Joueur 1
        case 'ArrowUp': isWPressed = true; break; // Joueur 2
        case 'ArrowDown': isSPressed = true; break; // Joueur 2
    }
}

function keyUpHandler(event) {
    switch(event.key) {
        case 'w': isUpPressed = false; break;
        case 's': isDownPressed = false; break;
        case 'ArrowUp': isWPressed = false; break;
        case 'ArrowDown': isSPressed = false; break;
    }
}
// Déplacement de l'ordinateur
function computerMoveEsMd() {
    const SPEED = 5 * DIFFICULTY;

    const targetY = game.ball.y - PLAYER_HEIGHT / 2;
    const diff = targetY - game.computer.y;

    game.computer.y += Math.sign(diff) * Math.min(Math.abs(diff), SPEED);

    game.computer.y = Math.min(
        Math.max(0, game.computer.y),
        canvas.height - PLAYER_HEIGHT
    );
}

function computerMoveHard() {
    const SPEED = 4 * DIFFICULTY; // La vitesse augmente avec la difficulté

    let predictedY = game.ball.y + (game.ball.speed.y * (canvas.width - game.ball.x)) / game.ball.speed.x;

    while (predictedY < 0 || predictedY > canvas.height) {
        if (predictedY < 0) {
            predictedY = -predictedY;
        } else if (predictedY > canvas.height) {
            predictedY = canvas.height - (predictedY - canvas.height);
        }
    }

    const diff = predictedY - game.computer.y - PLAYER_HEIGHT / 2;

    game.computer.y += Math.sign(diff) * Math.min(Math.abs(diff), SPEED);
    game.computer.y = Math.min(Math.max(0, game.computer.y), canvas.height - PLAYER_HEIGHT);
}

// Fonction principale de la boucle de jeu
function play() {
    if (isGameOver) return;

    movePlayer();
    draw();

    // Désactiver l'IA en multijoueur
    if (gameMode === 'single') {
        if (difficultySelect === "hd") {
            computerMoveHard();
        } else {
            computerMoveEsMd();
        }
    }

    ballMove();
    anim = requestAnimationFrame(play);
}


// Déplacement du joueur
function movePlayer() {
    // Joueur 1 (W/S)
    if (isUpPressed) {
        game.player.y = Math.max(0, game.player.y - PLAYER_SPEED);
    }
    if (isDownPressed) {
        game.player.y = Math.min(canvas.height - PLAYER_HEIGHT, game.player.y + PLAYER_SPEED);
    }

    // Joueur 2 (Flèches Haut/Bas) uniquement en multijoueur
    if (gameMode === 'multi') {
        if (isWPressed) {
            game.computer.y = Math.max(0, game.computer.y - PLAYER_SPEED);
        }
        if (isSPressed) {
            game.computer.y = Math.min(canvas.height - PLAYER_HEIGHT, game.computer.y + PLAYER_SPEED);
        }
    }
}

// Dessiner le score
function drawScore() {
    context.font = '40px "Press Start 2P"';
    context.fillStyle = COLORS.line;
    context.textAlign = 'center';

    context.fillText(game.player.score, canvas.width / 2 - 50, 50);
    context.fillText(game.computer.score, canvas.width / 2 + 50, 50);
}

function drawWinningMessage(winner) {
    context.fillStyle = COLORS.background;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = '40px "Press Start 2P"';
    context.fillStyle = COLORS.line;
    context.textAlign = 'center';
    context.fillText(`${winner} gagne !`, canvas.width / 2, canvas.height / 2);

    context.font = '20px "Press Start 2P"';
    context.fillText("Appuyez sur 'b' pour rejouer", canvas.width / 2, canvas.height / 2 + 50);
    context.fillText("Appuyez sur 'q' pour quit", canvas.width / 2, canvas.height / 2 + 70);
}

// Dessiner la scène
function draw() {
    context.fillStyle = COLORS.background;
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMiddleLine();
    drawPaddle(10, game.player.y);
    drawPaddle(canvas.width - PLAYER_WIDTH - 10, game.computer.y);
    drawBall();
    drawScore();
}

function drawMiddleLine() {
    context.strokeStyle = COLORS.line;
    context.beginPath();
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.setLineDash([10, 5]);
    context.lineWidth = 5;
    context.stroke();
}

function drawPaddle(x, y) {
    context.fillStyle = COLORS.paddle;
    context.fillRect(x, y, PLAYER_WIDTH, PLAYER_HEIGHT);
}

function drawBall() {
    const { x, y, r } = game.ball;
    context.beginPath();
    context.fillStyle = COLORS.ball;
    context.arc(x, y, r, 0, Math.PI * 2);
    context.fill();
}

// Déplacement de la balle
function ballMove() {
    const ball = game.ball;

    // Sauvegarder la position précédente
    ball.prevX = ball.x;
    ball.prevY = ball.y;

    // Déplacer la balle
    ball.x += ball.speed.x;
    ball.y += ball.speed.y;

    // Collisions avec les murs
    if (ball.y <= 0 || ball.y >= canvas.height) {
        ball.speed.y *= -1;
    }

    // Vérifier les collisions avec les paddles
    if (ball.x >= canvas.width - PLAYER_WIDTH - 10) {
        collide(game.computer);
    } else if (ball.x <= PLAYER_WIDTH + 10) {
        collide(game.player);
    }
}

function resetBall() {
    game.ball.x = canvas.width / 2;
    game.ball.y = canvas.height / 2;
    game.ball.speed.x = BALL_INITIAL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    game.ball.speed.y = BALL_INITIAL_SPEED * (Math.random() > 0.5 ? 1 : -1);
}

function collide(player) {
    const ball = game.ball;
    const isPlayerPaddle = player === game.player;
    const paddleX = isPlayerPaddle ? 10 : canvas.width - PLAYER_WIDTH - 10;
    const paddleEdgeX = isPlayerPaddle ? paddleX + PLAYER_WIDTH : paddleX;

    // Vérifier si la balle a traversé le paddle pendant ce déplacement
    const prevX = ball.prevX;
    const currentX = ball.x;

    if ((prevX < paddleEdgeX && currentX >= paddleEdgeX) || 
        (prevX > paddleEdgeX && currentX <= paddleEdgeX)) {
        
        // Calculer le moment de la collision
        const dx = currentX - prevX;
        const dt = (paddleEdgeX - prevX) / dx;
        
        // Position Y au moment de la collision
        const yAtCollision = ball.prevY + ball.speed.y * dt;

        if (yAtCollision >= player.y && yAtCollision <= player.y + PLAYER_HEIGHT) {
            // Collision réussie
            hitSound.play();
            ball.speed.x *= -1.2;
            
            if (Math.abs(ball.speed.x) > MAX_BALL_SPEED) {
                ball.speed.x = Math.sign(ball.speed.x) * MAX_BALL_SPEED;
            }
            // Ajuster la direction en fonction du point d'impact
            const hitPosition = (yAtCollision - player.y) / PLAYER_HEIGHT;
            const angle = hitPosition * Math.PI / 2;
            ball.speed.y = Math.sin(angle) * 5; // Ajustez 5 pour modifier la courbe
            
            // Corriger la position pour éviter le chevauchement
            ball.x = paddleEdgeX;
            ball.y = yAtCollision;
        } else {
            // Manqué le paddle
            scoreSound.play();
            if (isPlayerPaddle) {
                game.computer.score++;
                gameData.totalScore.computer++;
            } else {
                game.player.score++;
                gameData.totalScore.player++;
            }
            resetBall();
            if (game.computer.score === winnerScore || game.player.score === winnerScore) {
                let winner;
                if (game.player.score === winnerScore) {
                    winner = gameMode === 'multi' ? "Player 1" : "Le joueur";
                } else {
                    winner = gameMode === 'multi' ? "Player 2" : "L'ordinateur";
                }
                cancelAnimationFrame(anim);
                drawWinningMessage(winner);
                winSound.play();
                isGameOver = true;
                recordGameData(winner);
                saveGameStats({
                    playerScore: game.player.score, 
                    computerScore: game.computer.score, 
                    difficulty: difficultySelect
                });
                
            }
        }
    }
}

function displayGameData() {
    document.getElementById("totalGames").textContent = gameData.totalGames;
    document.getElementById("totalPlayerScore").textContent = gameData.totalScore.player;
    document.getElementById("totalComputerScore").textContent = gameData.totalScore.computer;

    const winRatio = (gameData.winLossRatio.wins / gameData.totalGames * 100).toFixed(2);
    document.getElementById("winRatio").textContent = `${winRatio}%`;

    document.getElementById("perfectPlayer").textContent = gameData.perfectGames.player;
    document.getElementById("perfectComputer").textContent = gameData.perfectGames.computer;

    const lastGamesList = document.getElementById("lastGames");
    lastGamesList.innerHTML = ""; // Effacer la liste précédente

    gameData.lastGames.forEach(game => {
        const li = document.createElement("li");
        li.textContent = `${game.winner} a gagné (${game.score.player}-${game.score.computer}) - ${game.duration.toFixed(2)}s`;
        if (game.isPerfect) {
            li.textContent += " - Parfait !";
        }
        lastGamesList.appendChild(li);
    });
}

function cleanupEventListeners() {
    window.removeEventListener('keydown', keyDownHandler);
    window.removeEventListener('keyup', keyUpHandler);
}

function recordGameData(winner) {
    // Calculer la durée de la partie
    const endTime = Date.now();
    gameData.gameDuration = (endTime - gameData.gameStartTime) / 1000; // Durée en secondes

    // Mettre à jour le nombre total de parties
    gameData.totalGames++;

    // Mettre à jour le taux de victoires/défaites
    if (winner === "Le joueur") {
        gameData.winLossRatio.wins++;
    } else {
        gameData.winLossRatio.losses++;
    }

    // Vérifier si c'est une partie parfaite
    if (winner === "Le joueur" && game.computer.score === 0) {
        gameData.perfectGames.player++;
    } else if (winner === "L'ordinateur" && game.player.score === 0) {
        gameData.perfectGames.computer++;
    }

    // Ajouter cette partie à l'historique des dernières parties
    const gameResult = {
        winner: winner,
        score: { player: game.player.score, computer: game.computer.score },
        duration: gameData.gameDuration,
        isPerfect: (winner === "Le joueur" && game.computer.score === 0) || (winner === "L'ordinateur" && game.player.score === 0),
    };
    gameData.lastGames.unshift(gameResult); // Ajouter au début de la liste

    // Limiter l'historique à 5 parties
    if (gameData.lastGames.length > 5) {
        gameData.lastGames.pop();
    }

    // Afficher les données mises à jour
    displayGameData();
    
    // Supprimer cette ligne incorrecte:
    // saveGameStats(playerScore, computerScore, currentDifficulty);
    // La sauvegarde est déjà faite dans la fonction collide
}

// Réinitialisation du jeu avec la touche 'b'
// ----------------------------------------------------
// Gestion des événements globaux
// ----------------------------------------------------
window.addEventListener('keydown', (event) => {
    if (isGameOver) {
        if (event.key === 'b') {
            // Redémarrer le jeu
            initializeGame();
        } else if (event.key === 'q') {
            // Retourner au menu principal
            cleanupEventListeners();
            gameMode = 'single'; // Réinitialiser le mode
            selectMenu(menu, pong, currentFocus, menuItems);
            title.style.display = 'block'; // Affiche le titre
            isGameOver = false; // Réinitialiser l'état du jeu
        }
    }
});

function initializeBackgroundGame() {
    const bgCanvas = document.getElementById('backgroundCanvas');
    if (!bgCanvas) {
        console.error("backgroundCanvas introuvable !");
        return;
    }
    
    const bgContext = bgCanvas.getContext('2d');
    if (!bgContext) {
        console.error("Impossible d'obtenir le contexte 2D du canvas.");
        return;
    }

    // Définir les dimensions du canvas si nécessaire
    bgCanvas.width = bgCanvas.clientWidth;
    bgCanvas.height = bgCanvas.clientHeight;

    const bgGame = {
        player: { y: bgCanvas.height / 2 - PLAYER_HEIGHT / 2 },
        computer: { y: bgCanvas.height / 2 - PLAYER_HEIGHT / 2 },
        ball: {
            x: bgCanvas.width / 2,
            y: bgCanvas.height / 2,
            r: BALL_RADIUS,
            speed: { x: BALL_INITIAL_SPEED, y: BALL_INITIAL_SPEED }
        }
    };

    // Fonction pour dessiner un paddle dans le background
    function drawPaddle(ctx, x, y) {
        ctx.fillStyle = COLORS.paddle;
        ctx.fillRect(x, y, PLAYER_WIDTH, PLAYER_HEIGHT);
    }
    
    // Fonction pour dessiner la balle dans le background
    function drawBall(ctx, ball) {
        ctx.beginPath();
        ctx.fillStyle = COLORS.ball;
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Fonction pour dessiner la ligne du milieu dans le background
    function drawMiddleLine(ctx) {
        ctx.strokeStyle = COLORS.line;
        ctx.beginPath();
        ctx.moveTo(bgCanvas.width / 2, 0);
        ctx.lineTo(bgCanvas.width / 2, bgCanvas.height);
        ctx.setLineDash([10, 5]);
        ctx.lineWidth = 5;
        ctx.stroke();
    }

    // Fonction pour dessiner tous les éléments du background
    function drawBackground() {
        bgContext.fillStyle = COLORS.background;
        bgContext.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        // Dessiner la ligne du milieu
        drawMiddleLine(bgContext);
        
        // Dessiner les paddles
        drawPaddle(bgContext, 10, bgGame.player.y);
        drawPaddle(bgContext, bgCanvas.width - PLAYER_WIDTH - 10, bgGame.computer.y);
        
        // Dessiner la balle
        drawBall(bgContext, bgGame.ball);
    }
    
    // Fonction pour déplacer la balle dans le background
    function ballMove(game) {
        const ball = game.ball;
        
        // Déplacer la balle
        ball.x += ball.speed.x;
        ball.y += ball.speed.y;
        
        // Collision avec les murs horizontaux (haut/bas)
        if (ball.y <= 0 || ball.y >= bgCanvas.height) {
            ball.speed.y *= -1;
        }
        
        // Collision avec le paddle droit (ordinateur)
        if (ball.x >= bgCanvas.width - PLAYER_WIDTH - 10) {
            if (ball.y >= game.computer.y && ball.y <= game.computer.y + PLAYER_HEIGHT) {
                // La balle frappe le paddle
                ball.speed.x *= -1;
                
                // Ajuster la direction Y selon le point d'impact
                const hitPosition = (ball.y - game.computer.y) / PLAYER_HEIGHT;
                const angle = hitPosition * Math.PI / 2;
                ball.speed.y = Math.sin(angle) * 3; // Ajustement plus doux pour le background
            } else if (ball.x > bgCanvas.width) {
                // La balle sort de l'écran à droite
                resetBackgroundBall(game);
            }
        } 
        // Collision avec le paddle gauche (joueur)
        else if (ball.x <= PLAYER_WIDTH + 10) {
            if (ball.y >= game.player.y && ball.y <= game.player.y + PLAYER_HEIGHT) {
                // La balle frappe le paddle
                ball.speed.x *= -1;
                
                // Ajuster la direction Y selon le point d'impact
                const hitPosition = (ball.y - game.player.y) / PLAYER_HEIGHT;
                const angle = hitPosition * Math.PI / 2;
                ball.speed.y = Math.sin(angle) * 3; // Ajustement plus doux pour le background
            } else if (ball.x < 0) {
                // La balle sort de l'écran à gauche
                resetBackgroundBall(game);
            }
        }
    }
    
    // Fonction pour réinitialiser la balle dans le background
    function resetBackgroundBall(game) {
        game.ball.x = bgCanvas.width / 2;
        game.ball.y = bgCanvas.height / 2;
        game.ball.speed.x = BALL_INITIAL_SPEED * (Math.random() > 0.5 ? 1 : -1);
        game.ball.speed.y = BALL_INITIAL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    }
    
    // Fonction pour déplacer les paddles IA dans le background
    function moveBot(player, ball, canvasHeight) {
        // Calculer la position cible (moins précise pour un effet de background)
        const targetY = ball.y - PLAYER_HEIGHT / 2 + (Math.random() * 20 - 10);
        const diff = targetY - player.y;
        const speed = 3; // Vitesse adaptée pour l'animation de background
        
        // Déplacer le paddle vers la cible
        player.y += Math.sign(diff) * Math.min(Math.abs(diff), speed);
        
        // S'assurer que le paddle reste dans les limites du canvas
        player.y = Math.max(0, Math.min(player.y, canvasHeight - PLAYER_HEIGHT));
    }
    
    // Fonction principale de mise à jour de l'animation de background
    function updateBackgroundGame() {
        // Déplacer les paddles IA
        moveBot(bgGame.player, bgGame.ball, bgCanvas.height);
        moveBot(bgGame.computer, bgGame.ball, bgCanvas.height);
        
        // Déplacer la balle et gérer les collisions
        ballMove(bgGame);
        
        // Dessiner tous les éléments
        drawBackground();
        
        // Continuer l'animation
        requestAnimationFrame(updateBackgroundGame);
    }
    
    // Démarrer l'animation de background
    updateBackgroundGame();
}


function moveBot(player, ball, canvasHeight) {
    const targetY = ball.y - PLAYER_HEIGHT / 2;
    const diff = targetY - player.y;
    const speed = 3; // Ajustez la vitesse pour les bots

    player.y += Math.sign(diff) * Math.min(Math.abs(diff), speed);
    player.y = Math.max(0, Math.min(player.y, canvasHeight - PLAYER_HEIGHT));
}

document.addEventListener("DOMContentLoaded", function () {
    initializeBackgroundGame();
});

async function saveGameStats(gameData) {
    try {
        console.log('Saving game stats:', gameData);
        
        // Récupérer le token CSRF
        const csrftoken = getCookie('csrftoken');
        
        // Mapper les différentes valeurs de difficulté
        let difficultyValue = 'medium';
        if (gameData.difficulty === 'es') difficultyValue = 'easy';
        else if (gameData.difficulty === 'md') difficultyValue = 'medium';
        else if (gameData.difficulty === 'hd') difficultyValue = 'hard';
        
        // Préparer les données à envoyer
        const data = {
            player_score: gameData.playerScore,
            computer_score: gameData.computerScore,
            difficulty: difficultyValue
        };
        
        console.log('Sending data to server:', data);
        
        // Envoyer les données à l'API
        const response = await fetch('/api/pong/save-stats/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error:', response.status, errorText);
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        console.log('Game stats saved successfully:', result);
        return result;
    } catch (error) {
        console.error('Error saving game stats:', error);
    }
}

// Fonction pour récupérer un cookie (pour le CSRF token)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
