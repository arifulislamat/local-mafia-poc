// ===========================================
// Renderer — Canvas Drawing
// ===========================================

const Renderer = (() => {
  let ctx = null;

  function init(canvasCtx) {
    ctx = canvasCtx;
  }

  // ---- Background & Arena ----
  function drawArena() {
    // Dark background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // ---- Draw Grid Maze (retro style matching maze.jsx) ----
  function drawMaze() {
    const grid = activeMaze.grid;

    // Pass 1: Draw all cell backgrounds + grid lines on every cell
    for (let r = 0; r < MAZE_ROWS; r++) {
      for (let c = 0; c < MAZE_COLS; c++) {
        const cell = grid[r][c];
        const x = c * CELL_W;
        const y = r * CELL_H;

        if (cell === CELL_WALL) {
          // Wall tile — retro depth effect
          ctx.fillStyle = "#2d2d4a";
          ctx.fillRect(x, y, CELL_W, CELL_H);

          // Outer border (bright edge)
          ctx.strokeStyle = "#4a4a6a";
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, CELL_W - 1, CELL_H - 1);

          // Inner border detail (subtle inner rectangle for depth)
          ctx.strokeStyle = "rgba(100, 100, 180, 0.2)";
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 3, y + 3, CELL_W - 6, CELL_H - 6);

          // Inset shadow simulation — darker edges on bottom-right
          ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
          ctx.fillRect(x + CELL_W - 3, y + 1, 3, CELL_H - 1); // right shadow
          ctx.fillRect(x + 1, y + CELL_H - 3, CELL_W - 1, 3); // bottom shadow

          // Inset highlight — lighter edge on top-left
          ctx.fillStyle = "rgba(100, 100, 160, 0.15)";
          ctx.fillRect(x + 1, y + 1, 3, CELL_H - 2); // left highlight
          ctx.fillRect(x + 1, y + 1, CELL_W - 2, 3); // top highlight
        } else if (cell === CELL_P1) {
          // P1 spawn zone — dark tinted background
          ctx.fillStyle = "#003344";
          ctx.fillRect(x, y, CELL_W, CELL_H);

          // Inner glow effect (radial)
          const grd = ctx.createRadialGradient(
            x + CELL_W / 2,
            y + CELL_H / 2,
            0,
            x + CELL_W / 2,
            y + CELL_H / 2,
            CELL_W * 0.6,
          );
          grd.addColorStop(0, "rgba(0, 212, 255, 0.25)");
          grd.addColorStop(1, "rgba(0, 212, 255, 0)");
          ctx.fillStyle = grd;
          ctx.fillRect(x, y, CELL_W, CELL_H);

          // Neon border
          ctx.strokeStyle = "#00d4ff";
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.6;
          ctx.strokeRect(x + 0.5, y + 0.5, CELL_W - 1, CELL_H - 1);
          ctx.globalAlpha = 1;

          // Neon "P1" text with glow
          ctx.font = `bold ${Math.floor(CELL_W * 0.4)}px Courier New`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.shadowColor = "#00d4ff";
          ctx.shadowBlur = 8;
          ctx.fillStyle = "#00d4ff";
          ctx.fillText("P1", x + CELL_W / 2, y + CELL_H / 2);
          ctx.shadowBlur = 0;
          ctx.textBaseline = "alphabetic";
        } else if (cell === CELL_P2) {
          // P2 spawn zone — dark tinted background
          ctx.fillStyle = "#330011";
          ctx.fillRect(x, y, CELL_W, CELL_H);

          // Inner glow effect (radial)
          const grd = ctx.createRadialGradient(
            x + CELL_W / 2,
            y + CELL_H / 2,
            0,
            x + CELL_W / 2,
            y + CELL_H / 2,
            CELL_W * 0.6,
          );
          grd.addColorStop(0, "rgba(255, 68, 68, 0.25)");
          grd.addColorStop(1, "rgba(255, 68, 68, 0)");
          ctx.fillStyle = grd;
          ctx.fillRect(x, y, CELL_W, CELL_H);

          // Neon border
          ctx.strokeStyle = "#ff4444";
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.6;
          ctx.strokeRect(x + 0.5, y + 0.5, CELL_W - 1, CELL_H - 1);
          ctx.globalAlpha = 1;

          // Neon "P2" text with glow
          ctx.font = `bold ${Math.floor(CELL_W * 0.4)}px Courier New`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.shadowColor = "#ff4444";
          ctx.shadowBlur = 8;
          ctx.fillStyle = "#ff4444";
          ctx.fillText("P2", x + CELL_W / 2, y + CELL_H / 2);
          ctx.shadowBlur = 0;
          ctx.textBaseline = "alphabetic";
        } else if (cell === CELL_ZOMBIE) {
          // Path background first
          ctx.fillStyle = COLORS.background;
          ctx.fillRect(x, y, CELL_W, CELL_H);

          // Zombie zone — green glow background
          ctx.fillStyle = "#0a1a0a";
          ctx.fillRect(x, y, CELL_W, CELL_H);

          // Green inner glow
          const grd = ctx.createRadialGradient(
            x + CELL_W / 2,
            y + CELL_H / 2,
            0,
            x + CELL_W / 2,
            y + CELL_H / 2,
            CELL_W * 0.5,
          );
          grd.addColorStop(0, "rgba(68, 255, 68, 0.15)");
          grd.addColorStop(1, "rgba(68, 255, 68, 0)");
          ctx.fillStyle = grd;
          ctx.fillRect(x, y, CELL_W, CELL_H);

          // Border glow
          ctx.strokeStyle = "#44ff44";
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.3;
          ctx.strokeRect(x + 0.5, y + 0.5, CELL_W - 1, CELL_H - 1);
          ctx.globalAlpha = 1;

          // Zombie emoji with drop shadow glow
          ctx.shadowColor = "#44ff44";
          ctx.shadowBlur = 6;
          ctx.font = `${Math.floor(CELL_H * 0.6)}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🧟", x + CELL_W / 2, y + CELL_H / 2);
          ctx.shadowBlur = 0;
          ctx.textBaseline = "alphabetic";
        } else if (cell === CELL_BOMB) {
          // Path background first
          ctx.fillStyle = COLORS.background;
          ctx.fillRect(x, y, CELL_W, CELL_H);

          // Bomb zone — orange glow background
          ctx.fillStyle = "#1a1500";
          ctx.fillRect(x, y, CELL_W, CELL_H);

          // Orange inner glow
          const grd = ctx.createRadialGradient(
            x + CELL_W / 2,
            y + CELL_H / 2,
            0,
            x + CELL_W / 2,
            y + CELL_H / 2,
            CELL_W * 0.5,
          );
          grd.addColorStop(0, "rgba(255, 170, 0, 0.15)");
          grd.addColorStop(1, "rgba(255, 170, 0, 0)");
          ctx.fillStyle = grd;
          ctx.fillRect(x, y, CELL_W, CELL_H);

          // Border glow
          ctx.strokeStyle = "#ffaa00";
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.3;
          ctx.strokeRect(x + 0.5, y + 0.5, CELL_W - 1, CELL_H - 1);
          ctx.globalAlpha = 1;

          // Bomb emoji with drop shadow glow
          ctx.shadowColor = "#ffaa00";
          ctx.shadowBlur = 6;
          ctx.font = `${Math.floor(CELL_H * 0.55)}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("💣", x + CELL_W / 2, y + CELL_H / 2);
          ctx.shadowBlur = 0;
          ctx.textBaseline = "alphabetic";
        } else {
          // Path cell — dark background (already drawn by drawArena)
          // Still draw cell-specific bg so grid lines show properly
          ctx.fillStyle = COLORS.background;
          ctx.fillRect(x, y, CELL_W, CELL_H);
        }

        // Grid lines on EVERY cell (the subtle grid overlay)
        ctx.strokeStyle = "#1a1a2e";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, CELL_W - 1, CELL_H - 1);
      }
    }

    // Arena border — dark outer border
    ctx.strokeStyle = "#2a2a4a";
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, CANVAS_WIDTH - 3, CANVAS_HEIGHT - 3);

    // Orange glow corner accents (matching maze.jsx)
    drawCornerAccent(0, 0, 1, 1); // top-left
    drawCornerAccent(CANVAS_WIDTH, 0, -1, 1); // top-right
    drawCornerAccent(0, CANVAS_HEIGHT, 1, -1); // bottom-left
    drawCornerAccent(CANVAS_WIDTH, CANVAS_HEIGHT, -1, -1); // bottom-right

    // CRT scanline overlay (subtle horizontal lines)
    drawScanlines();
  }

  // ---- Orange Glow Corner Accents ----
  function drawCornerAccent(cx, cy, dirX, dirY) {
    const len = 16;
    ctx.strokeStyle = "#ff6b00";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy + dirY * len);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + dirX * len, cy);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ---- CRT Scanline Overlay ----
  function drawScanlines() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
    for (let y = 0; y < CANVAS_HEIGHT; y += 3) {
      ctx.fillRect(0, y, CANVAS_WIDTH, 1);
    }
  }

  // ---- Player ----
  function drawPlayer(player, label) {
    if (!player.alive) return; // don't draw dead players

    const color = player.id === 1 ? COLORS.p1 : COLORS.p2;
    const darkColor = player.id === 1 ? COLORS.p1Dark : COLORS.p2Dark;

    // Player glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    // Player body
    ctx.fillStyle = color;
    ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);

    ctx.shadowBlur = 0;

    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);

    // Direction indicator (small triangle showing facing direction)
    drawDirectionIndicator(player, color);

    // Player label above (neon glow)
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = color;
    ctx.font = "bold 12px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(label, player.x + PLAYER_SIZE / 2, player.y - 18);
    ctx.shadowBlur = 0;

    // Health bar above player
    drawHealthBar(
      player.x,
      player.y - 12,
      PLAYER_SIZE,
      6,
      player.health,
      PLAYER_HEALTH,
    );
  }

  function drawDirectionIndicator(player, color) {
    const cx = player.x + PLAYER_SIZE / 2;
    const cy = player.y + PLAYER_SIZE / 2;
    const size = 8;

    ctx.fillStyle = color;
    ctx.beginPath();

    if (player.dir.dx === 1 && player.dir.dy === 0) {
      // Right
      ctx.moveTo(player.x + PLAYER_SIZE + 2, cy);
      ctx.lineTo(player.x + PLAYER_SIZE - size + 2, cy - size / 2);
      ctx.lineTo(player.x + PLAYER_SIZE - size + 2, cy + size / 2);
    } else if (player.dir.dx === -1 && player.dir.dy === 0) {
      // Left
      ctx.moveTo(player.x - 2, cy);
      ctx.lineTo(player.x + size - 2, cy - size / 2);
      ctx.lineTo(player.x + size - 2, cy + size / 2);
    } else if (player.dir.dy === -1 && player.dir.dx === 0) {
      // Up
      ctx.moveTo(cx, player.y - 2);
      ctx.lineTo(cx - size / 2, player.y + size - 2);
      ctx.lineTo(cx + size / 2, player.y + size - 2);
    } else if (player.dir.dy === 1 && player.dir.dx === 0) {
      // Down
      ctx.moveTo(cx, player.y + PLAYER_SIZE + 2);
      ctx.lineTo(cx - size / 2, player.y + PLAYER_SIZE - size + 2);
      ctx.lineTo(cx + size / 2, player.y + PLAYER_SIZE - size + 2);
    }

    ctx.closePath();
    ctx.fill();
  }

  // ---- Health Bar ----
  function drawHealthBar(x, y, width, height, current, max) {
    const ratio = Math.max(0, current / max);

    // Background
    ctx.fillStyle = COLORS.healthBg;
    ctx.fillRect(x, y, width, height);

    // Fill
    ctx.fillStyle = ratio > 0.3 ? COLORS.healthGreen : COLORS.healthRed;
    ctx.fillRect(x, y, width * ratio, height);

    // Border
    ctx.strokeStyle = COLORS.healthBg;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
  }

  // ---- Bullets ----
  function drawBullets(bullets) {
    bullets.forEach((b) => {
      // Bullet glow
      ctx.shadowColor = COLORS.bullet;
      ctx.shadowBlur = 8;
      ctx.fillStyle = COLORS.bullet;
      ctx.beginPath();
      ctx.arc(b.x, b.y, BULLET_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = COLORS.bulletStroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  // ---- HUD (Top Bar) ----
  function drawHUD(p1, p2, mazeTimeLeft) {
    // Semi-transparent HUD background
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, 50);

    const hudY = 8;

    // P1 info — left side (neon glow)
    ctx.shadowColor = COLORS.p1;
    ctx.shadowBlur = 4;
    ctx.fillStyle = COLORS.p1;
    ctx.font = "bold 16px Courier New";
    ctx.textAlign = "left";
    ctx.fillText(`P1: ${p1.score} kills`, 20, hudY + 16);
    ctx.shadowBlur = 0;
    drawHealthBar(20, hudY + 24, 100, 8, p1.health, PLAYER_HEALTH);

    // P2 info — right side (neon glow)
    ctx.shadowColor = COLORS.p2;
    ctx.shadowBlur = 4;
    ctx.fillStyle = COLORS.p2;
    ctx.textAlign = "right";
    ctx.fillText(`P2: ${p2.score} kills`, CANVAS_WIDTH - 20, hudY + 16);
    ctx.shadowBlur = 0;
    drawHealthBar(
      CANVAS_WIDTH - 120,
      hudY + 24,
      100,
      8,
      p2.health,
      PLAYER_HEALTH,
    );

    // Center — maze name + timer (with subtle glow)
    ctx.shadowColor = "#ff6b00";
    ctx.shadowBlur = 4;
    ctx.fillStyle = "#ff6b00";
    ctx.textAlign = "center";
    ctx.font = "bold 12px Courier New";
    ctx.fillText(activeMaze.name, CANVAS_WIDTH / 2, hudY + 14);
    ctx.shadowBlur = 0;

    ctx.font = "10px Courier New";
    ctx.fillStyle = "#888";
    if (mazeTimeLeft != null) {
      const mins = Math.floor(mazeTimeLeft / 60);
      const secs = Math.floor(mazeTimeLeft % 60);
      ctx.fillText(
        `Next map: ${mins}:${secs.toString().padStart(2, "0")}`,
        CANVAS_WIDTH / 2,
        hudY + 28,
      );
    } else {
      ctx.fillText(`First to ${WIN_SCORE} wins`, CANVAS_WIDTH / 2, hudY + 28);
    }
  }

  // ---- Countdown Overlay ----
  function drawCountdown(seconds) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const text = seconds > 0 ? seconds.toString() : "GO!";
    const glowColor = seconds > 0 ? "#ff6b00" : "#44ff44";

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 30;
    ctx.fillStyle = glowColor;
    ctx.font = "bold 120px Courier New";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.shadowBlur = 0;

    ctx.textBaseline = "alphabetic";
  }

  // ---- Respawn Timer ----
  function drawRespawnTimer(player, timeLeft) {
    const cx = player.x + PLAYER_SIZE / 2;
    const cy = player.y + PLAYER_SIZE / 2;
    const color = player.id === 1 ? COLORS.p1 : COLORS.p2;

    // Pulsing ghost outline with glow
    const pulse = 0.2 + 0.15 * Math.sin(Date.now() / 200);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = pulse;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.strokeRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Countdown text with glow
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 6;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Courier New";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(Math.ceil(timeLeft / 1000).toString(), cx, cy);
    ctx.shadowBlur = 0;
    ctx.textBaseline = "alphabetic";
  }

  // ---- Game Over Screen ----
  function drawGameOver(winner) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const winColor = winner === 1 ? COLORS.p1 : COLORS.p2;

    // Winner text with neon glow
    ctx.shadowColor = winColor;
    ctx.shadowBlur = 20;
    ctx.fillStyle = winColor;
    ctx.font = "bold 60px Courier New";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      `PLAYER ${winner} WINS!`,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 - 40,
    );
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#666666";
    ctx.font = "16px Courier New";
    ctx.fillText(
      "Press R to restart",
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 + 30,
    );

    ctx.textBaseline = "alphabetic";
  }

  // ---- Maze Change Announcement ----
  let mazeAnnouncement = null;
  let mazeAnnouncementTimer = 0;

  function showMazeAnnouncement(mazeName) {
    mazeAnnouncement = mazeName;
    mazeAnnouncementTimer = 2500; // show for 2.5s
  }

  function drawMazeAnnouncement(dt) {
    if (!mazeAnnouncement || mazeAnnouncementTimer <= 0) return;
    mazeAnnouncementTimer -= dt;

    const alpha = Math.min(1, mazeAnnouncementTimer / 500); // fade out last 500ms
    ctx.fillStyle = `rgba(0, 0, 0, ${0.75 * alpha})`;
    ctx.fillRect(0, CANVAS_HEIGHT / 2 - 60, CANVAS_WIDTH, 120);

    ctx.globalAlpha = alpha;

    // Map name with neon glow
    ctx.shadowColor = "#ff6b00";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#ff6b00";
    ctx.font = "bold 36px Courier New";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(mazeAnnouncement, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#888";
    ctx.font = "14px Courier New";
    ctx.fillText("MAP CHANGED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25);
    ctx.globalAlpha = 1;
    ctx.textBaseline = "alphabetic";

    if (mazeAnnouncementTimer <= 0) mazeAnnouncement = null;
  }

  return {
    init,
    drawArena,
    drawMaze,
    drawPlayer,
    drawBullets,
    drawHUD,
    drawCountdown,
    drawRespawnTimer,
    drawGameOver,
    showMazeAnnouncement,
    drawMazeAnnouncement,
  };
})();
