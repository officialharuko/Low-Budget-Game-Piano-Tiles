// script.js
const menuOverlay = document.getElementById('menuOverlay');
const playBtn = document.getElementById('playBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const songSelect = document.getElementById('songSelect');
const gameContainer = document.getElementById('gameContainer');
const hamburger = document.getElementById('hamburger');

let gameRunning = false;
let defeat = false;
let tiles = [];
let score = 0;
let highscore = localStorage.getItem('highscore') || 0;
let tileInterval;
let gameLoopId;
let col = 0;

// Display score and highscore
function updateScoreDisplay() {
  let scoreDiv = document.getElementById('scoreDiv');
  if (!scoreDiv) {
    scoreDiv = document.createElement('div');
    scoreDiv.id = 'scoreDiv';
    scoreDiv.style.position = 'fixed';
    scoreDiv.style.top = '10px';
    scoreDiv.style.right = '10px';
    scoreDiv.style.color = '#fff';
    scoreDiv.style.fontSize = '24px';
    scoreDiv.style.zIndex = 30;
    scoreDiv.style.textAlign = 'right';
    document.body.appendChild(scoreDiv);
  }
  scoreDiv.innerHTML = `Score: ${score} <br> Highscore: ${highscore}`;
}

function showJudge(text, color) {
  let judge = document.getElementById('judgeText');
  if (!judge) {
    judge = document.createElement('div');
    judge.id = 'judgeText';
    judge.className = 'judge-text';
    gameContainer.appendChild(judge);
  }
  judge.textContent = text;
  judge.style.color = color;
  judge.style.opacity = 1;
  setTimeout(() => { judge.style.opacity = 0; }, 500);
}

function startGame() {
  menuOverlay.classList.remove('active');
  hamburger.style.display = 'block';
  gameContainer.innerHTML = '';
  // Add judgement line
  let line = document.createElement('div');
  line.className = 'judgement-line';
  gameContainer.appendChild(line);
  tiles = [];
  defeat = false;
  gameRunning = true;
  score = 0;
  col = 0;
  updateScoreDisplay();
  spawnTiles();
  gameLoop();
}

function gameOver() {
  gameRunning = false;
  defeat = true;
  clearInterval(tileInterval);
  cancelAnimationFrame(gameLoopId);
  if (score > highscore) {
    highscore = score;
    localStorage.setItem('highscore', highscore);
  }
  updateScoreDisplay();
  menuOverlay.classList.add('active');
  playBtn.style.display = 'none';
  restartBtn.style.display = 'inline-block';
  menuBtn.style.display = 'inline-block';
  hamburger.style.display = 'block';
}

function spawnTiles() {
  tileInterval = setInterval(() => {
    if (!gameRunning) return;
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.style.left = `${col * 100 + 5}px`;
    tile.style.top = '0px';
    tile.clicked = false;
    tile.isActive = true; // Mark this as the only clickable tile
    tile.addEventListener('click', function (e) {
      if (!tile.clicked && gameRunning) {
        const tileBottom = parseInt(tile.style.top) + 180;
        const judgeLine = 600 - 120; // bottom: 120px
        const diff = Math.abs(tileBottom - judgeLine);
        let points = 0, judge = '', color = '';
        if (diff <= 10) {
          points = 5;
          judge = 'Perfect!';
          color = '#0f0';
        } else if (diff <= 30) {
          points = 3;
          judge = 'Great!';
          color = '#ff0';
        } else if (diff <= 60) {
          points = 1;
          judge = 'Good!';
          color = '#0af';
        } else {
          points = 0;
          judge = 'Miss!';
          color = '#f00';
        }
        if (points > 0) {
          tile.clicked = true;
          tile.isActive = false;
          tile.style.background = '#888';
          score += points;
          updateScoreDisplay();
          showJudge(judge, color);
        } else {
          showJudge(judge, color);
          gameOver();
        }
      }
      e.stopPropagation(); // Prevent gameContainer click
    });
    gameContainer.appendChild(tile);
    tiles.push(tile);
    col = (col + 1) % 4;
  }, 700);
}

// Listen for mis-clicks on the game area (not on a tile)
gameContainer.onclick = function (e) {
  if (!gameRunning) return;
  // If the click target is NOT a tile, it's a miss
  if (!e.target.classList.contains('tile')) {
    showJudge('Miss!', '#f00');
    gameOver();
  }
};

// Remove miss condition from gameLoop
function gameLoop() {
  gameLoopId = requestAnimationFrame(gameLoop);
  tiles.slice().forEach((tile, idx) => {
    let top = parseInt(tile.style.top);
    top += 5;
    tile.style.top = top + 'px';
    // Remove tiles that are out of view (fully below container)
    if (top > 600) {
      tile.remove();
      tiles.splice(idx, 1);
    }
  });
}

// Hamburger menu logic
hamburger.onclick = () => {
  menuOverlay.classList.add('active');
  hamburger.style.display = 'none';
  gameRunning = false;
  clearInterval(tileInterval);
  cancelAnimationFrame(gameLoopId);
};

playBtn.onclick = () => {
  playBtn.style.display = 'none';
  restartBtn.style.display = 'none';
  menuBtn.style.display = 'none';
  startGame();
};

restartBtn.onclick = () => {
  playBtn.style.display = 'none';
  restartBtn.style.display = 'none';
  menuBtn.style.display = 'none';
  startGame();
};

menuBtn.onclick = () => {
  playBtn.style.display = 'inline-block';
  restartBtn.style.display = 'none';
  menuBtn.style.display = 'none';
  menuOverlay.classList.add('active');
  gameRunning = false;
  clearInterval(tileInterval);
  cancelAnimationFrame(gameLoopId);
  hamburger.style.display = 'block';
};

songSelect.onchange = (e) => {
  // Change song logic here
};

updateScoreDisplay();