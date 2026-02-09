// ===========================================
// Game — Core Game Logic
// ===========================================

const Game = (() => {
  let canvas, ctx;
  let gameState = STATE.LOBBY;
  let countdownTimer = 0;
  let countdownValue = 0;
  let winner = null;
  let selectedMazeKey = "arena_classic";
  let mazeRotationStart = 0;

  // ---- Online Mode State ----
  let gameMode = "local"; // 'local' | 'online-host' | 'online-guest'
  let remoteInput = {
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false,
  };
  let isDisconnected = false;
  let displayMazeTimeLeft = null;
  let initialized = false;

  // ---- Get spawn position from active maze ----
  function getSpawn(playerId) {
    const spawns = playerId === 1 ? activeMaze.p1Spawns : activeMaze.p2Spawns;
    return spawns.length > 0
      ? { ...spawns[Math.floor(Math.random() * spawns.length)] }
      : { x: 100, y: 100 };
  }

  // ---- Players ----
  function createPlayer(id) {
    const spawn = getSpawn(id);
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
  // P1 (local):  WASD + Space
  // P2 (local):  Arrow keys + Enter
  // Online:      Both use WASD + Space (each on own machine)
  const keys = {};

  function handleKeyDown(e) {
    keys[e.code] = true;

    // Prevent scrolling from arrow keys / space
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
        e.code,
      )
    ) {
      e.preventDefault();
    }

    // Restart on R when game over (host or local only)
    if (
      e.code === "KeyR" &&
      gameState === STATE.GAME_OVER &&
      gameMode !== "online-guest"
    ) {
      restartGame();
    }
  }

  function handleKeyUp(e) {
    keys[e.code] = false;
  }

  // ---- Player Movement (local key-based) ----
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
      if (
        Physics.canMoveTo(newX, player.y) &&
        !collidesWithOtherPlayer(player, newX, player.y)
      ) {
        player.x = newX;
      }
      if (
        Physics.canMoveTo(player.x, newY) &&
        !collidesWithOtherPlayer(player, player.x, newY)
      ) {
        player.y = newY;
      }
    }

    // Shooting
    if (keys[shoot]) {
      tryShoot(player);
    }
  }

  // ---- Remote Player Movement (from network input) ----
  function processRemoteInput(player) {
    if (!player.alive) return;

    let newX = player.x;
    let newY = player.y;
    let moved = false;

    if (remoteInput.up) {
      newY -= PLAYER_SPEED;
      player.dir = { dx: 0, dy: -1 };
      moved = true;
    }
    if (remoteInput.down) {
      newY += PLAYER_SPEED;
      player.dir = { dx: 0, dy: 1 };
      moved = true;
    }
    if (remoteInput.left) {
      newX -= PLAYER_SPEED;
      player.dir = { dx: -1, dy: 0 };
      moved = true;
    }
    if (remoteInput.right) {
      newX += PLAYER_SPEED;
      player.dir = { dx: 1, dy: 0 };
      moved = true;
    }

    if (moved) {
      if (
        Physics.canMoveTo(newX, player.y) &&
        !collidesWithOtherPlayer(player, newX, player.y)
      ) {
        player.x = newX;
      }
      if (
        Physics.canMoveTo(player.x, newY) &&
        !collidesWithOtherPlayer(player, player.x, newY)
      ) {
        player.y = newY;
      }
    }

    if (remoteInput.shoot) {
      tryShoot(player);
    }
  }

  // ---- Check if new position collides with the other player ----
  function collidesWithOtherPlayer(player, newX, newY) {
    const other = player.id === 1 ? p2 : p1;
    if (!other.alive) return false;

    return Physics.rectsOverlap(
      { x: newX, y: newY, w: PLAYER_SIZE, h: PLAYER_SIZE },
      { x: other.x, y: other.y, w: PLAYER_SIZE, h: PLAYER_SIZE },
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
    [p1, p2].forEach((player) => {
      if (!player.alive && player.respawnTimer > 0) {
        player.respawnTimer -= dt;
        if (player.respawnTimer <= 0) {
          respawnPlayer(player);
        }
      }
    });
  }

  function respawnPlayer(player) {
    const spawn = getSpawn(player.id);
    player.x = spawn.x;
    player.y = spawn.y;
    player.dir =
      player.id === 1 ? { ...DEFAULT_DIR_P1 } : { ...DEFAULT_DIR_P2 };
    player.health = PLAYER_HEALTH;
    player.alive = true;
    player.respawnTimer = 0;
  }

  // ---- Maze Rotation (every 5 minutes) ----
  function checkMazeRotation() {
    const elapsed = Date.now() - mazeRotationStart;
    if (elapsed >= MAZE_ROTATION_MS) {
      rotateToRandomMaze();
    }
  }

  function rotateToRandomMaze() {
    // Pick a different maze
    const otherKeys = MAZE_KEYS.filter((k) => k !== activeMaze.key);
    const newKey = otherKeys[Math.floor(Math.random() * otherKeys.length)];
    switchMaze(newKey);
    Renderer.showMazeAnnouncement(activeMaze.name);
  }

  function switchMaze(mazeKey) {
    activeMaze = parseMaze(mazeKey);
    selectedMazeKey = mazeKey;
    mazeRotationStart = Date.now();

    // Respawn both players at new maze spawns, keep scores
    const spawn1 = getSpawn(1);
    const spawn2 = getSpawn(2);
    p1.x = spawn1.x;
    p1.y = spawn1.y;
    p1.health = PLAYER_HEALTH;
    p1.alive = true;
    p1.respawnTimer = 0;
    p1.dir = { ...DEFAULT_DIR_P1 };
    p2.x = spawn2.x;
    p2.y = spawn2.y;
    p2.health = PLAYER_HEALTH;
    p2.alive = true;
    p2.respawnTimer = 0;
    p2.dir = { ...DEFAULT_DIR_P2 };
    bullets = [];

    // Update lobby selector highlight if visible
    highlightSelectedMaze();
  }

  function highlightSelectedMaze() {
    document.querySelectorAll(".maze-option").forEach((el) => {
      el.classList.toggle("selected", el.dataset.maze === selectedMazeKey);
    });
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
    mazeRotationStart = Date.now();
    startCountdown();
  }

  // ======================================================
  // ---- Network Functions (Online Mode) ----
  // ======================================================

  // Guest sends local WASD input to host every frame
  function sendLocalInput() {
    Network.send({
      type: "input",
      keys: {
        up: !!keys["KeyW"],
        down: !!keys["KeyS"],
        left: !!keys["KeyA"],
        right: !!keys["KeyD"],
        shoot: !!keys["Space"],
      },
    });
  }

  // Host broadcasts full game state to guest every frame
  function broadcastState() {
    const mazeElapsed = (Date.now() - mazeRotationStart) / 1000;
    const mazeTimeLeft = Math.max(0, MAZE_ROTATION_MS / 1000 - mazeElapsed);

    Network.send({
      type: "state",
      p1: {
        x: p1.x,
        y: p1.y,
        dir: p1.dir,
        health: p1.health,
        alive: p1.alive,
        score: p1.score,
        respawnTimer: p1.respawnTimer,
      },
      p2: {
        x: p2.x,
        y: p2.y,
        dir: p2.dir,
        health: p2.health,
        alive: p2.alive,
        score: p2.score,
        respawnTimer: p2.respawnTimer,
      },
      bullets: bullets.map((b) => ({
        x: b.x,
        y: b.y,
        dx: b.dx,
        dy: b.dy,
        owner: b.owner,
      })),
      gameState,
      winner,
      countdownValue,
      mazeKey: selectedMazeKey,
      mazeTimeLeft,
    });
  }

  // Guest applies received state from host
  function applyRemoteState(data) {
    // Detect maze change
    if (data.mazeKey && data.mazeKey !== selectedMazeKey) {
      activeMaze = parseMaze(data.mazeKey);
      selectedMazeKey = data.mazeKey;
      mazeRotationStart = Date.now();
      Renderer.showMazeAnnouncement(activeMaze.name);
    }

    // Apply player states
    p1.x = data.p1.x;
    p1.y = data.p1.y;
    p1.dir = data.p1.dir;
    p1.health = data.p1.health;
    p1.alive = data.p1.alive;
    p1.score = data.p1.score;
    p1.respawnTimer = data.p1.respawnTimer;

    p2.x = data.p2.x;
    p2.y = data.p2.y;
    p2.dir = data.p2.dir;
    p2.health = data.p2.health;
    p2.alive = data.p2.alive;
    p2.score = data.p2.score;
    p2.respawnTimer = data.p2.respawnTimer;

    bullets = data.bullets;
    gameState = data.gameState;
    winner = data.winner;
    countdownValue = data.countdownValue;
    displayMazeTimeLeft = data.mazeTimeLeft;
  }

  // Route incoming network data
  function handleNetworkData(data) {
    // Config is a one-time setup message — always handle it
    if (data.type === "config") {
      selectedMazeKey = data.mazeKey;
      activeMaze = parseMaze(data.mazeKey);
      startOnlineGame(false);
      return;
    }

    if (gameMode === "online-host") {
      // Host receives input from guest
      if (data.type === "input") {
        remoteInput = data.keys;
      }
    } else if (gameMode === "online-guest") {
      // Guest receives state from host
      if (data.type === "state") {
        applyRemoteState(data);
      }
    }
  }

  // Handle peer disconnection
  function handleDisconnect() {
    if (isDisconnected) return; // already handling
    isDisconnected = true;

    // Return to lobby after a brief delay
    setTimeout(() => {
      returnToLobby();
    }, 3000);
  }

  // Return to lobby screen
  function returnToLobby() {
    Network.disconnect();
    gameMode = "local";
    gameState = STATE.LOBBY;
    isDisconnected = false;
    remoteInput = {
      up: false,
      down: false,
      left: false,
      right: false,
      shoot: false,
    };
    displayMazeTimeLeft = null;
    winner = null;
    initialized = false;

    document.getElementById("lobby").style.display = "block";
    document.getElementById("connectionUI").style.display = "none";
    document.getElementById("gameContainer").style.display = "none";
    document.getElementById("controls-help").style.display = "none";
    document.getElementById("hostUI").style.display = "none";
    document.getElementById("joinUI").style.display = "none";
  }

  // ======================================================
  // ---- Online UI ----
  // ======================================================

  function showOnlineUI(mode) {
    document.getElementById("lobby").style.display = "none";
    document.getElementById("connectionUI").style.display = "block";

    if (mode === "host") {
      document.getElementById("hostUI").style.display = "block";
      document.getElementById("joinUI").style.display = "none";
      document.getElementById("connectionStatus").textContent =
        "Creating room...";
      document.getElementById("connectionStatus").className = "";

      Network.createHost({
        onReady: (roomCode) => {
          document.getElementById("roomCode").textContent = roomCode;
          document.getElementById("connectionStatus").textContent =
            "Waiting for opponent to join...";
        },
        onConnected: () => {
          document.getElementById("connectionStatus").textContent =
            "Opponent connected! Starting game...";
          document.getElementById("connectionStatus").className =
            "status-connected";

          // Send config to guest
          Network.send({ type: "config", mazeKey: selectedMazeKey });

          // Start game as host after brief delay
          setTimeout(() => startOnlineGame(true), 500);
        },
        onData: handleNetworkData,
        onDisconnected: handleDisconnect,
        onError: (msg) => {
          document.getElementById("connectionStatus").textContent = msg;
          document.getElementById("connectionStatus").className =
            "status-error";
        },
      });
    } else {
      document.getElementById("hostUI").style.display = "none";
      document.getElementById("joinUI").style.display = "block";
      document.getElementById("joinStatus").textContent = "";
      document.getElementById("roomCodeInput").value = "";
      setTimeout(() => document.getElementById("roomCodeInput").focus(), 100);
    }
  }

  function joinOnlineGame() {
    const input = document.getElementById("roomCodeInput");
    const code = input.value.trim().toUpperCase();

    if (code.length < 4) {
      document.getElementById("joinStatus").textContent =
        "Enter a valid room code";
      document.getElementById("joinStatus").className = "status-error";
      return;
    }

    document.getElementById("joinStatus").textContent = "Connecting...";
    document.getElementById("joinStatus").className = "";

    Network.joinGame(code, {
      onConnected: () => {
        document.getElementById("joinStatus").textContent =
          "Connected! Waiting for host to start...";
        document.getElementById("joinStatus").className = "status-connected";
      },
      onData: handleNetworkData,
      onDisconnected: handleDisconnect,
      onError: (msg) => {
        document.getElementById("joinStatus").textContent = msg;
        document.getElementById("joinStatus").className = "status-error";
      },
    });
  }

  function cancelOnline() {
    Network.disconnect();
    document.getElementById("connectionUI").style.display = "none";
    document.getElementById("hostUI").style.display = "none";
    document.getElementById("joinUI").style.display = "none";
    document.getElementById("lobby").style.display = "block";
  }

  // ======================================================
  // ---- Main Game Loop ----
  // ======================================================
  let lastTime = 0;

  function gameLoop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    // --- Update ---
    if (gameMode === "online-guest") {
      // Guest: only send input, state arrives via onData callback
      sendLocalInput();
    } else {
      // Host or Local: run all physics
      if (gameState === STATE.COUNTDOWN) {
        updateCountdown();
      }

      if (gameState === STATE.PLAYING) {
        if (gameMode === "local") {
          // Local: P1 = WASD, P2 = Arrows
          processPlayerInput(p1, "KeyW", "KeyS", "KeyA", "KeyD", "Space");
          processPlayerInput(
            p2,
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "Enter",
          );
        } else if (gameMode === "online-host") {
          // Online host: P1 = local WASD, P2 = remote input
          processPlayerInput(p1, "KeyW", "KeyS", "KeyA", "KeyD", "Space");
          processRemoteInput(p2);
        }

        updateBullets();
        updateRespawns(dt);
        checkMazeRotation();
      }

      // Host broadcasts full state to guest each frame
      if (gameMode === "online-host") {
        broadcastState();
      }
    }

    // --- Render (always, all modes) ---
    Renderer.drawArena();
    Renderer.drawMaze();
    Renderer.drawPlayer(p1, "P1");
    Renderer.drawPlayer(p2, "P2");
    Renderer.drawBullets(bullets);

    // HUD — maze timer
    let mazeTimeLeft;
    if (gameMode === "online-guest" && displayMazeTimeLeft !== null) {
      mazeTimeLeft = displayMazeTimeLeft;
    } else {
      const mazeElapsed = (Date.now() - mazeRotationStart) / 1000;
      mazeTimeLeft = Math.max(0, MAZE_ROTATION_MS / 1000 - mazeElapsed);
    }
    Renderer.drawHUD(p1, p2, mazeTimeLeft);

    // Respawn timers
    if (!p1.alive) Renderer.drawRespawnTimer(p1, p1.respawnTimer);
    if (!p2.alive) Renderer.drawRespawnTimer(p2, p2.respawnTimer);

    // Maze change announcement
    Renderer.drawMazeAnnouncement(dt);

    // Overlays
    if (gameState === STATE.COUNTDOWN) {
      Renderer.drawCountdown(countdownValue);
    }
    if (gameState === STATE.GAME_OVER) {
      Renderer.drawGameOver(winner, gameMode === "online-guest");
    }

    // Online connection indicator
    if (gameMode !== "local") {
      Renderer.drawOnlineIndicator(Network.isConnected());
    }

    // Disconnect overlay (on top of everything)
    if (isDisconnected) {
      Renderer.drawDisconnected();
    }

    requestAnimationFrame(gameLoop);
  }

  // ---- Initialization ----
  function init() {
    if (initialized) return; // prevent double-adding listeners
    initialized = true;

    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    Renderer.init(ctx);

    // Input listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
  }

  // ---- Select maze from lobby ----
  function selectMaze(mazeKey) {
    if (MAZES[mazeKey]) {
      selectedMazeKey = mazeKey;
      activeMaze = parseMaze(mazeKey);
      highlightSelectedMaze();
    }
  }

  // ---- Update controls help text based on mode ----
  function updateControlsHelp() {
    const help = document.getElementById("controls-help");
    if (!help) return;

    if (gameMode === "local") {
      help.innerHTML = `
        <span><strong style="color: #00d4ff">P1:</strong>
          <span class="key">W</span><span class="key">A</span><span class="key">S</span><span class="key">D</span> move ·
          <span class="key">Space</span> shoot</span>
        <span><strong style="color: #ff4444">P2:</strong>
          <span class="key">↑</span><span class="key">←</span><span class="key">↓</span><span class="key">→</span> move ·
          <span class="key">Enter</span> shoot</span>
        <span><span class="key">R</span> restart</span>
      `;
    } else if (gameMode === "online-host") {
      help.innerHTML = `
        <span><strong style="color: #00d4ff">You (P1):</strong>
          <span class="key">W</span><span class="key">A</span><span class="key">S</span><span class="key">D</span> move ·
          <span class="key">Space</span> shoot</span>
        <span><span class="key">R</span> restart</span>
      `;
    } else {
      help.innerHTML = `
        <span><strong style="color: #ff4444">You (P2):</strong>
          <span class="key">W</span><span class="key">A</span><span class="key">S</span><span class="key">D</span> move ·
          <span class="key">Space</span> shoot</span>
      `;
    }
  }

  // ---- Start local game (Phase 2) ----
  function startLocalGame() {
    gameMode = "local";
    activeMaze = parseMaze(selectedMazeKey);
    mazeRotationStart = Date.now();

    // Hide lobby, show game
    document.getElementById("lobby").style.display = "none";
    document.getElementById("connectionUI").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";
    document.getElementById("controls-help").style.display = "block";
    updateControlsHelp();

    // Re-create players with correct spawn for selected maze
    p1 = createPlayer(1);
    p2 = createPlayer(2);
    bullets = [];

    init();
    startCountdown();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
  }

  // ---- Start online game (Phase 3) ----
  function startOnlineGame(isHost) {
    gameMode = isHost ? "online-host" : "online-guest";
    isDisconnected = false;
    activeMaze = parseMaze(selectedMazeKey);
    mazeRotationStart = Date.now();

    // Hide UI, show game
    document.getElementById("lobby").style.display = "none";
    document.getElementById("connectionUI").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";
    document.getElementById("controls-help").style.display = "block";
    updateControlsHelp();

    // Create players
    p1 = createPlayer(1);
    p2 = createPlayer(2);
    bullets = [];

    init();
    startCountdown();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
  }

  return {
    init,
    startLocalGame,
    startOnlineGame,
    restartGame,
    selectMaze,
    showOnlineUI,
    joinOnlineGame,
    cancelOnline,
    returnToLobby,
    getState: () => ({ p1, p2, bullets, gameState, winner, gameMode }),
  };
})();
