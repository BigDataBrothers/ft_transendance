import { bombover } from "./spa.js";
// ----------------------------------------------------
// Déclaration des éléments DOM utilisés dans le script
// ----------------------------------------------------
export function init(){
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
const quitMButton = document.getElementById("qmButton");

const difficultyItems = document.querySelectorAll("#menuDifficulty .button");
const menuDifficulty = document.getElementById("menuDifficulty");
const easyButton = document.getElementById("esButton");
const mediumButton = document.getElementById("mdButton");
const hardMButton = document.getElementById("hdButton");
const quitDMButton = document.getElementById("qdButton");

const title = document.getElementById("title");
const pong = document.getElementById("game");

let anim;

let currentFocus = 0;
let bubbleFocus = 0;
let modeFocus = 0;
let difficultyFocus = 0;

let difficultySelect = "md";
let gameMode = 'single'; // 'single' ou 'multi'
let isWPressed = false;
let isSPressed = false;
let isGameOver = false;

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


// Texte d'info pour l'info-bulle
const infoText = "BOMBERMAN: Placez des bombes pour détruire les blocs et éliminez tous les ennemis ! Utilisez les flèches pour vous déplacer et ESPACE pour poser des bombes.";


// ----------------------------------------------------
// Fonctions pour la gestion du menu
// ----------------------------------------------------

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
    menuDifficulty.style.display = 'none';
    title.style.display = 'none';
    pong.style.display = 'block';
    document.getElementById('endGameMenu').style.display = 'none';
    if(secondInstruct.style.display === 'block')
        secondInstruct.style.display = 'none';
    
    // Réinitialiser l'état du jeu
    isGameOver = false;
    initializeGame();
}

// ----------------------------------------------------
// Gestion des événements
// ----------------------------------------------------

function handleMenuLinkClick(event) {
    event.preventDefault();
    toggleMenu();
}
menuLink.addEventListener("click", handleMenuLinkClick);

/**
 * Fermeture de l'info-bulle en cliquant sur "Close"
 */
function handleCloseBubble() {
    enableMenu();
    infoBubble.style.display = 'none';
    infoButton.focus();
    
    document.getElementById("info1").innerHTML = "";

    if (textInterval) {
        clearInterval(textInterval);
    }
};
closeBubble.addEventListener("click", handleCloseBubble);

function handleQuitButton() {
    selectMenu(menuLink, menu, null, null);
}
quitButton.addEventListener("click", handleQuitButton);

/**
 * Ouverture de l'info-bulle en cliquant sur "INFO"
 */
function handleInfoButton() {
    toggleInfoBubble();
};
infoButton.addEventListener("click", handleInfoButton);

/**
 * Action pour "More Info"
 */
function handleMoreBubble() {
    window.open("https://fr.wikipedia.org/wiki/Bomberman", "_blank");
};
moreBubble.addEventListener("click", handleMoreBubble);

function handleMoreBubbleFocus() {
    moreBubble.setAttribute('title', 'Opens Pong Wikipedia page in a new window.');
};
moreBubble.addEventListener("focus", handleMoreBubbleFocus);

function handlePlayButton() {
    selectMenu(menuMode, menu, modeFocus, modeItems)
}
playButton.addEventListener("click", handlePlayButton);

function handleSingleButton() {
    selectMenu(menuDifficulty, menuMode, difficultyFocus, difficultyItems)
}
singleButton.addEventListener("click", handleSingleButton);

function handleQuitMButton() {
    selectMenu(menu, menuMode, currentFocus, menuItems)
}
quitMButton.addEventListener("click", handleQuitMButton);

// function handleMultiButton() {
//     gameMode = 'multi';
//     difficultySelect = "md"; // difficulté par défaut
//     updateStatsLabels();
//     playGame();
// };
// multiButton.addEventListener("click", handleMultiButton);

function handleEasyButton() {
    difficultySelect = "es";
    playGame();
}
easyButton.addEventListener("click", handleEasyButton);

function handleMediumButton() {
    difficultySelect = "md";
    playGame();
}
mediumButton.addEventListener("click", handleMediumButton);

function handleHardMButton() {
    difficultySelect = "hd";
    playGame();
}
hardMButton.addEventListener("click", handleHardMButton);

function handleQuitDMButton() {
    selectMenu(menuMode, menuDifficulty, modeFocus, modeItems)
}
quitDMButton.addEventListener("click", handleQuitDMButton);

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
function handleDocumentKeydown(event) {
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
        title.style.display = 'block';
        pong.style.display = 'none';
        stop();
        toggleMenu();
    }
};
document.addEventListener("keydown", handleDocumentKeydown);

/**
 * BOMBERMAN
*/

'use strict';

// Configuration des constantes
const GRID_SIZE = 15;
const CELL_SIZE = 40;
const BOMB_TIMER = 3000;
const EXPLOSION_DURATION = 500;
const PLAYER_SPEED = 200;
let canvas;
let context;


const assets = {
    player: new Image(),
    enemy: new Image(),
    bomb: new Image(),
    explosion: new Image(),
    wall: new Image(),
    block: new Image()
};

let assetsLoaded = 0;
const totalAssets = Object.keys(assets).length;

Object.values(assets).forEach(img => {
    img.onload = () => {
        assetsLoaded++;
        if(assetsLoaded === totalAssets) {
            console.log('Toutes les images sont chargées');
        }
    };
    img.onerror = () => console.error('Erreur de chargement:', img.src);
});

assets.player.src = 'static/assets/player.png';
assets.enemy.src = 'static/assets/enemy.png';
assets.bomb.src = 'static/assets/bomb.png';
assets.explosion.src = 'static/assets/explosion.png';
assets.wall.src = 'static/assets/wall.png';
assets.block.src = 'static/assets/block.png';

let gameState = {
  grid: [],
  player: { x: 1, y: 1, bombs: 1, blastRadius: 2 },
  enemies: [],
  bombs: [],
  explosions: [],
  stats: {
    bombsPlaced: 0,
    blocksDestroyed: 0,
    enemiesKilled: 0
  }
};

let isUpPressed = false;
let isDownPressed = false;


function initializeGame() {
    isGameOver = false;
    if (bombover === true) return;
    document.getElementById('game').style.display = 'block';
    document.getElementById('title').style.display = 'none';
    gameData.gameStartTime = Date.now();

    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    gameData.stats = {
        bombsPlaced: 0,
        blocksDestroyed: 0,
        enemiesKilled: 0
    };
    displayGameData();

    isUpPressed = false;
    isDownPressed = false;
    
    // Ajouter les écouteurs d'événements
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    
    // Initialisation de la grille
    gameState.grid = Array(GRID_SIZE).fill().map((_, y) => 
        Array(GRID_SIZE).fill().map((_, x) => {
            if (x === 0 || y === 0 || x === GRID_SIZE-1 || y === GRID_SIZE-1) return 'wall';
            if (x % 2 === 0 && y % 2 === 0) return 'wall';
            return Math.random() < 0.3 ? 'block' : 'empty';
        }));

    // Garantir un chemin dégagé autour des positions de départ
    const safeZone = [
        {x: 1, y: 1}, {x: 1, y: 2}, {x: 2, y: 1},
        {x: GRID_SIZE-2, y: GRID_SIZE-2}, 
        {x: GRID_SIZE-3, y: GRID_SIZE-2},
        {x: GRID_SIZE-2, y: GRID_SIZE-3}
    ];

    safeZone.forEach(pos => {
        gameState.grid[pos.y][pos.x] = 'empty';
    });

    // Garantir les positions de départ libres
    gameState.grid[1][1] = 'empty';
    gameState.grid[GRID_SIZE-2][GRID_SIZE-2] = 'empty';

    // Placement des entités
    gameState.player = { 
        x: 1, 
        y: 1,
        bombs: 1,
        blastRadius: difficultySelect === 'hd' ? 4 : 3 
    };
    
    gameState.enemies = Array(3).fill().map((_, index) => {
        // Définir les 4 coins (sauf celui du joueur)
        const corners = [
            {x: 1, y: GRID_SIZE-2}, // bas-gauche
            {x: GRID_SIZE-2, y: 1}, // haut-droit
            {x: GRID_SIZE-2, y: GRID_SIZE-2} // bas-droit
        ];
        
        // positions coin
        let position = corners[index % corners.length];
        
        // possible de définir une position 
        const directions = [[0,1], [1,0], [0,-1], [-1,0]];
        
        // Choisir la meilleure position
        let bestPosition = position;
        let maxFreeDirections = countFreeDirections(position.x, position.y, directions);
        
        // Si la position de départ n'a pas assez de directions libres
        if (maxFreeDirections < 2) {
            // Chercher une meilleure position
            for (let offsetY = -3; offsetY <= 3; offsetY++) {
                for (let offsetX = -3; offsetX <= 3; offsetX++) {
                    const newX = position.x + offsetX;
                    const newY = position.y + offsetY;
                    
                    
                    if (newX <= 0 || newX >= GRID_SIZE-1 || newY <= 0 || newY >= GRID_SIZE-1) 
                        continue;
                    
                
                    if (gameState.grid[newY][newX] === 'wall')
                        continue;
                    
                    const freeDirs = countFreeDirections(newX, newY, directions);
                    
                    
                    if (freeDirs > maxFreeDirections) {
                        bestPosition = {x: newX, y: newY};
                        maxFreeDirections = freeDirs;
                        
                        if (freeDirs >= 2) break;
                    }
                }
                if (maxFreeDirections >= 2) break;
            }
        }
        
        // Force the chosen position to be empty
        gameState.grid[bestPosition.y][bestPosition.x] = 'empty';
        
        return {
            x: bestPosition.x,
            y: bestPosition.y,
            speed: difficultySelect === 'es' ? 1500 : 1000,
            timer: 0,
            bombChance: 0.15
        };
    });

    // Helper function to count how many free directions are available from a position
    function countFreeDirections(x, y, directions) {
        return directions.filter(([dx, dy]) => {
            const newX = x + dx;
            const newY = y + dy;
            
            // Check bounds
            if (newX <= 0 || newX >= GRID_SIZE-1 || newY <= 0 || newY >= GRID_SIZE-1)
                return false;
            
            // Consider position free if it's empty or can be made empty (not a wall)
            return gameState.grid[newY][newX] !== 'wall';
        }).length;
    }

  gameState.bombs = [];
  gameState.explosions = [];
  startGameLoop();
}

function placeEnemyBomb(x, y) {
    gameState.bombs.push({
        x: x,
        y: y,
        timer: BOMB_TIMER,
        radius: 2, // Portée fixe pour les ennemis
        owner: 'enemy'
    });
}

function startGameLoop() {
    let lastUpdate = Date.now();
    
    function gameLoop() {
        if (isGameOver) return; // Arrêt immédiat si game over
        
        const now = Date.now();
        const delta = now - lastUpdate;
        
        updateGame(delta);
        draw();
        
        lastUpdate = now;
        anim = requestAnimationFrame(gameLoop);
    }
    
    
    anim = requestAnimationFrame(gameLoop);
}

function updateGame(delta) {
  // Mise à jour des bombes
  gameState.explosions.forEach(e => {
    e.timer -= delta; 
});
gameState.explosions = gameState.explosions.filter(e => e.timer > 0);
  gameState.bombs.forEach(bomb => {
    bomb.timer -= delta;
    if (bomb.timer <= 0) {
      explodeBomb(bomb);
      gameState.bombs = gameState.bombs.filter(b => b !== bomb);
    }
  });

  // Mise à jour des explosions
  gameState.explosions = gameState.explosions.filter(e => e.timer > 0);

  // Mise à jour des ennemis
  gameState.enemies.forEach(enemy => {
    enemy.timer = (enemy.timer || 0) - delta;
    if (enemy.timer <= 0) {
      moveEnemy(enemy);
      enemy.timer = enemy.speed;
    }
  });

  checkCollisions();
}

function moveEnemy(enemy) {
    const directions = [[1,0], [-1,0], [0,1], [0,-1]];
    const validDirections = directions.filter(([dx, dy]) => {
        const newX = enemy.x + dx;
        const newY = enemy.y + dy;
        return isCellEmpty(newX, newY);
    });

    if (validDirections.length > 0) {
        const [dx, dy] = validDirections[Math.floor(Math.random() * validDirections.length)];
        enemy.x += dx;
        enemy.y += dy;

        // Pose de bombe après déplacement
        if (Math.random() < enemy.bombChance) {
            placeEnemyBomb(enemy.x, enemy.y);
        }
    }
}

function placeBomb() {
  if (gameState.player.bombs > 0) {
    gameState.player.bombs--;
    gameState.bombs.push({
      x: gameState.player.x,
      y: gameState.player.y,
      timer: BOMB_TIMER,
      radius: gameState.player.blastRadius,
      owner: 'player'
    });
    gameState.stats.bombsPlaced++;
    if (bombover === true) return;
    displayGameData();
    // gameState.player.bombs--;
  }
}

function explodeBomb(bomb) {
  // Créer l'explosion centrale
  gameState.explosions.push({ x: bomb.x, y: bomb.y, timer: EXPLOSION_DURATION });

  // Ajouter le propriétaire aux explosions
  gameState.explosions.push({ x: bomb.x, y: bomb.y, timer: EXPLOSION_DURATION, owner: bomb.owner });
  // Explosion dans les 4 directions
  [[1,0], [-1,0], [0,1], [0,-1]].forEach(([dx, dy]) => {
    for (let i = 1; i <= bomb.radius; i++) {
      const x = bomb.x + dx * i;
      const y = bomb.y + dy * i;
      gameState.explosions.push({ x, y, timer: EXPLOSION_DURATION, owner: bomb.owner });
      
      if (gameState.grid[y][x] === 'wall') break;
      if (gameState.grid[y][x] === 'block') {
        gameState.grid[y][x] = 'empty';
        gameState.stats.blocksDestroyed++;
        if (bombover === true) return;
        displayGameData();
        break;
      }
      gameState.explosions.push({ x, y, timer: EXPLOSION_DURATION });
    }
  });

  if (bomb.owner === 'player') {
    gameState.player.bombs++;
}
}

function checkCollisions() {
  // Vérifier collisions joueur
  if (isInExplosion(gameState.player)) {
    endGame(false);
  }

  // Vérifier collisions ennemis
  gameState.enemies = gameState.enemies.filter(enemy => {
    if (isInExplosion(enemy)) {
      gameState.stats.enemiesKilled++;
      if (bombover === true) return;
      displayGameData();
      return false;
    }
    return true;
  });

  if (gameState.enemies.length === 0) {
    endGame(true);
  }
}

function isInExplosion(entity) {
    return gameState.explosions.some(e => {
      // Vérifier la position ET le type d'entité
      if (e.x !== entity.x || e.y !== entity.y) return false;
      
      // Le joueur est touché par toutes les explosions
      if (entity === gameState.player) return true;
      
      // Les ennemis ne sont touchés que par les explosions du joueur
      return e.owner === 'player';
    });
  }

function draw() {
    context.fillStyle = '#262324';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Dessiner la grille
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = gameState.grid[y][x];
            const img = cell === 'wall' ? assets.wall : 
                      cell === 'block' ? assets.block : null;
            
            if (img) {
                context.drawImage(
                    img,
                    x * CELL_SIZE,
                    y * CELL_SIZE,
                    CELL_SIZE,
                    CELL_SIZE
                );
            }
        }
    }

   // Dessiner les explosions avec transparence
    gameState.explosions.forEach(e => {
        context.globalAlpha = e.timer / EXPLOSION_DURATION;
        context.drawImage(
            assets.explosion,
            e.x * CELL_SIZE,
            e.y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
        );
        context.globalAlpha = 1.0;
    });


    // Dessiner les bombes
    gameState.bombs.forEach(bomb => {
        context.drawImage(
            assets.bomb,
            bomb.x * CELL_SIZE,
            bomb.y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
        );
    });

    // Dessiner le joueur
    context.drawImage(
        assets.player,
        gameState.player.x * CELL_SIZE,
        gameState.player.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
    );

    // Dessiner les ennemis
    gameState.enemies.forEach(enemy => {
        context.drawImage(
            assets.enemy,
            enemy.x * CELL_SIZE,
            enemy.y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
        );
    });
}

// Gestion des contrôles
function handleControlKeydown(e) {
  if (isGameOver) return;
  if (bombover === true) return;

  const moves = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0]
  };

  if (moves[e.key]) {
    const [dx, dy] = moves[e.key];
    const newX = gameState.player.x + dx;
    const newY = gameState.player.y + dy;
    
    if (isCellEmpty(newX, newY)) {
      gameState.player.x = newX;
      gameState.player.y = newY;
    }
  } else if (e.key === ' ') {
    placeBomb();
  }
};
document.addEventListener('keydown', handleControlKeydown);

function isCellEmpty(x, y) {
    return (
        gameState.grid[y][x] === 'empty' &&
        !gameState.bombs.some(b => b.x === x && b.y === y) // Ne pas vérifier les ennemis ici
    );
}

function displayGameData() {
    // Mettre à jour toutes les statistiques
    if (bombover === true) return;
    document.getElementById("totalGames").textContent = gameData.totalGames;
    document.getElementById("totalBombs").textContent = gameState.stats.bombsPlaced;
    document.getElementById("enemiesKilled").textContent = gameState.stats.enemiesKilled;
    document.getElementById("blocksDestroyed").textContent = gameState.stats.blocksDestroyed;
}

function recordGameData(winner) {
    // Calculer la durée
    const endTime = Date.now();
    const duration = (endTime - gameData.gameStartTime) / 1000;

    // Mettre à jour les données
    gameData.totalGames++;
    gameData.winLossRatio.wins += winner === "Joueur" ? 1 : 0;
    gameData.winLossRatio.losses += winner !== "Joueur" ? 1 : 0;
    
    // Ajouter à l'historique
    gameData.lastGames.unshift({
        winner,
        duration,
        score: gameData.stats
    });

    // Garder seulement 5 résultats
    if (gameData.lastGames.length > 5) gameData.lastGames.pop();

    if (bombover === true) return;
    // Actualiser l'affichage
    displayGameData();
}

function keyDownHandler(e) {
    switch(e.key) {
        case 'ArrowUp': isUpPressed = true; break;
        case 'ArrowDown': isDownPressed = true; break;
    }
}

function keyUpHandler(e) {
    switch(e.key) {
        case 'ArrowUp': isUpPressed = false; break;
        case 'ArrowDown': isDownPressed = false; break;
    }
}


function endGame(won) {
    if (isGameOver) return;
    isGameOver = true;
    if (bombover === true) return;
    
    cancelAnimationFrame(anim);
    window.removeEventListener('keydown', keyDownHandler);
    window.removeEventListener('keyup', keyUpHandler);

    recordGameData(won ? "Joueur" : "Ennemis");
    displayGameData();

    // Afficher le menu de fin
    const endGameMenu = document.getElementById('endGameMenu');
    const gameOverText = document.getElementById('gameOverText');
    endGameMenu.style.display = 'block';
    gameOverText.textContent = won ? 'VICTOIRE !' : 'GAME OVER';
    gameOverText.style.color = won ? '#4CAF50' : '#F44336';

    // Gestion des boutons
    document.getElementById('replayButton').onclick = () => {
        endGameMenu.style.display = 'none';
        
        // Réinitialiser complètement l'état du jeu
        gameState = {
            grid: [],
            player: { x: 1, y: 1, bombs: 1, blastRadius: 2 },
            enemies: [],
            bombs: [],
            explosions: [],
            stats: {
                bombsPlaced: 0,
                blocksDestroyed: 0,
                enemiesKilled: 0
            }
        };
        
        initializeGame(); // Relancer une nouvelle partie
    };

    document.getElementById('quitEndButton').onclick = () => {
        endGameMenu.style.display = 'none';
        document.getElementById('game').style.display = 'none';
        document.getElementById('title').style.display = 'block';
        menu.style.display = 'block';
        secondInstruct.style.display = 'block';
        isGameOver = false;
    };
}
}

export function destroy(){
    console.log("Bomberman destroy");
    // if(anim){
    //     cancelAnimationFrame(anim);
    // }
    menuLink.removeEventListener("click", handleMenuLinkClick);
    closeBubble.removeEventListener("click", handleCloseBubble);
    quitButton.removeEventListener("click", handleQuitButton);
    infoButton.removeEventListener("click", handleInfoButton);
    moreBubble.removeEventListener("click", handleMoreBubble);
    moreBubble.removeEventListener("focus", handleMoreBubbleFocus);
    playButton.removeEventListener("click", handlePlayButton);
    singleButton.removeEventListener("click", handleSingleButton);
    quitMButton.removeEventListener("click", handleQuitMButton);
    easyButton.removeEventListener("click", handleEasyButton);
    mediumButton.removeEventListener("click", handleMediumButton);
    hardMButton.removeEventListener("click", handleHardMButton);
    quitDMButton.removeEventListener("click", handleQuitDMButton);
    document.removeEventListener("keydown", handleDocumentKeydown);
    window.removeEventListener('keydown', handleWindowKeydown);
    window.removeEventListener('keydown', keyDownHandler);
    window.removeEventListener('keyup', keyUpHandler);
    document.removeEventListener('keydown', handleControlKeydown);
}