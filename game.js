// ===========================================
// Game — Core Game Logic
// ===========================================

const Game = (() => {
  let canvas, ctx;
  let gameState = STATE.LOBBY;
  let countdownTimer = 0;
  let countdownValue = 0;
  let winner = null;

  // ---- Players ----
  function createPlayer(id) {
    const spawn = id === 1 ? SPAWN_P1 : SPAWN_P2;
    const dir = id === 1 ? { ...DEFAULT_DIR_P1 } : { ...DEFAULT_DIR_P2 };
    return {
      id,
      x: spawn.x,
      y: spawn.y,
      dir,
      health: PLAYER_HEALTH,
      alive: true,
      score: 0,
      lastShot: 0,
      respawnTimer: 0,
    };
  }

  let p1 = createPlayer(1);
  let p2 = createPlayer(2);
  let bullets = [];

  // ---- Input State ----
  // P1: WASD + Space
  // P2: Arrow keys + Enter
  const keys = {};

  function handleKeyDown(e) {
    keys[e.code] = true;

    // Prevent scrolling from arrow keys / space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    // Restart on R when game over
    if (e.code === 'KeyR' && gameState === STATE.GAME_OVER) {
      restartGame();
    }
  }

  function handleKeyUp(e) {
    keys[e.code] = false;
  }

  // ---- Player Movement ----
  function processPlayerInput(player, up, down, left, right, shoot) {
    if (!player.alive) return;

    let newX = player.x;
    let newY = player.y;
    let moved = false;

    if (keys[up]) {
      newY -= PLAYER_SPEED;
      player.dir = { dx: 0, dy: -1 };
      moved = true;
    }
    if (keys[down]) {
      newY += PLAYER_SPEED;
      player.dir = { dx: 0, dy: 1 };
      moved = true;
    }
    if (keys[left]) {
      newX -= PLAYER_SPEED;
      player.dir = { dx: -1, dy: 0 };
      moved = true;
    }
    if (keys[right]) {
      newX += PLAYER_SPEED;
      player.dir = { dx: 1, dy: 0 };
      moved = true;
    }

    // Try moving on each axis independently for smooth sliding along walls
    if (moved) {
      if (Physics.canMoveTo(newX, player.y) && !collidesWithOtherPlayer(player, newX, player.y)) {
        player.x = newX;
      }
      if (Physics.canMoveTo(player.x, newY) && !collidesWithOtherPlayer(player, player.x, newY)) {
        player.y = newY;
      }
    }

    // Shooting
    if (keys[shoot]) {
      tryShoot(player);
    }
  }

  // ---- Check if new position collides with the other player ----
  function collidesWithOtherPlayer(player, newX, newY) {
    const other = player.id === 1 ? p2 : p1;
    if (!other.alive) return false;

    return Physics.rectsOverlap(
      { x: newX, y: newY, w: PLAYER_SIZE, h: PLAYER_SIZE },
      { x: other.x, y: other.y, w: PLAYER_SIZE, h: PLAYER_SIZE }
    );
  }

  // ---- Shooting ----
  function tryShoot(player) {
    const now = Date.now();
    if (now - player.lastShot < FIRE_RATE) return;

    player.lastShot = now;

    // Bullet spawns from center of player in their facing direction
    const cx = player.x + PLAYER_SIZE / 2;
    const cy = player.y + PLAYER_SIZE / 2;

    bullets.push({
      x: cx + player.dir.dx * (PLAYER_SIZE / 2 + BULLET_SIZE),
      y: cy + player.dir.dy * (PLAYER_SIZE / 2 + BULLET_SIZE),
      dx: player.dir.dx * BULLET_SPEED,
      dy: player.dir.dy * BULLET_SPEED,
      owner: player.id,
    });
  }

  // ---- Update Bullets ----
  function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.dx;
      b.y += b.dy;

      // Remove if out of bounds
      if (Physics.bulletOutOfBounds(b)) {
        bullets.splice(i, 1);
        continue;
      }

      // Remove if hits obstacle
      if (Physics.bulletHitsObstacle(b)) {
        bullets.splice(i, 1);
        continue;
      }

      // Check hit against players (can't hit own player)
      const target = b.owner === 1 ? p2 : p1;
      if (Physics.bulletHitsPlayer(b, target)) {
        target.health -= 1;
        bullets.splice(i, 1);

        // Check if killed
        if (target.health <= 0) {
          handlePlayerDeath(target, b.owner === 1 ? p1 : p2);
        }
        continue;
      }
    }
  }

  // ---- Player Death & Respawn ----
  function handlePlayerDeath(deadPlayer, killer) {
    deadPlayer.alive = false;
    deadPlayer.respawnTimer = RESPAWN_TIME;
    killer.score += 1;

    // Check win
    if (killer.score >= WIN_SCORE) {
      gameState = STATE.GAME_OVER;
      winner = killer.id;
    }
  }

  function updateRespawns(dt) {
    [p1, p2].forEach(player => {
      if (!player.alive && player.respawnTimer > 0) {
        player.respawnTimer -= dt;
        if (player.respawnTimer <= 0) {
          respawnPlayer(player);
        }
      }
    });
  }

  function respawnPlayer(player) {
    const spawn = player.id === 1 ? SPAWN_P1 : SPAWN_P2;
    player.x = spawn.x;
    player.y = spawn.y;
    player.dir = player.id === 1 ? { ...DEFAULT_DIR_P1 } : { ...DEFAULT_DIR_P2 };
    player.health = PLAYER_HEALTH;
    player.alive = true;
    player.respawnTimer = 0;
  }

  // ---- Countdown ----
  function startCountdown() {
    gameState = STATE.COUNTDOWN;
    countdownValue = COUNTDOWN_DURATION;
    countdownTimer = Date.now();
  }

  function updateCountdown() {
    const elapsed = Date.now() - countdownTimer;
    countdownValue = COUNTDOWN_DURATION - Math.floor(elapsed / 1000);

    if (countdownValue < 0) {
      gameState = STATE.PLAYING;
    }
  }

  // ---- Game Restart ----
  function restartGame() {
    p1 = createPlayer(1);
    p2 = createPlayer(2);
    bullets = [];
    winner = null;
    startCountdown();
  }

  // ---- Main Game Loop ----
  let lastTime = 0;

  function gameLoop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    // --- Update ---
    if (gameState === STATE.COUNTDOWN) {
      updateCountdown();
    }

    if (gameState === STATE.PLAYING) {
      // P1: WASD + Space
      processPlayerInput(p1, 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space');
      // P2: Arrows + Enter
      processPlayerInput(p2, 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter');

      updateBullets();
      updateRespawns(dt);
    }

    // --- Render ---
    Renderer.drawArena();
    Renderer.drawObstacles();
    Renderer.drawPlayer(p1, 'P1');
    Renderer.drawPlayer(p2, 'P2');
    Renderer.drawBullets(bullets);
    Renderer.drawHUD(p1, p2);

    // Respawn timers
    if (!p1.alive) Renderer.drawRespawnTimer(p1, p1.respawnTimer);
    if (!p2.alive) Renderer.drawRespawnTimer(p2, p2.respawnTimer);

    // Overlays
    if (gameState === STATE.COUNTDOWN) {
      Renderer.drawCountdown(countdownValue);
    }
    if (gameState === STATE.GAME_OVER) {
      Renderer.drawGameOver(winner);
    }

    requestAnimationFrame(gameLoop);
  }

  // ---- Initialization ----
  function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    Renderer.init(ctx);

    // Input listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }

  // ---- Start local game (Phase 1 & 2) ----
  function startLocalGame() {
    // Hide lobby, show game
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    document.getElementById('controls-help').style.display = 'block';

    init();
    startCountdown();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
  }

  return {
    init,
    startLocalGame,
    restartGame,
    getState: () => ({ p1, p2, bullets, gameState, winner }),
  };
})();
