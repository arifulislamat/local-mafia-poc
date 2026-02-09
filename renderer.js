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
    // Background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Border
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, CANVAS_WIDTH - 4, CANVAS_HEIGHT - 4);
  }

  // ---- Obstacles ----
  function drawObstacles() {
    OBSTACLES.forEach(obs => {
      ctx.fillStyle = COLORS.obstacle;
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = COLORS.obstacleStroke;
      ctx.lineWidth = 2;
      ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
    });
  }

  // ---- Player ----
  function drawPlayer(player, label) {
    if (!player.alive) return; // don't draw dead players

    const color = player.id === 1 ? COLORS.p1 : COLORS.p2;
    const darkColor = player.id === 1 ? COLORS.p1Dark : COLORS.p2Dark;

    // Player body
    ctx.fillStyle = color;
    ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);

    // Direction indicator (small triangle showing facing direction)
    drawDirectionIndicator(player, darkColor);

    // Player label above
    ctx.fillStyle = COLORS.hudText;
    ctx.font = 'bold 12px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(label, player.x + PLAYER_SIZE / 2, player.y - 18);

    // Health bar above player
    drawHealthBar(player.x, player.y - 12, PLAYER_SIZE, 6, player.health, PLAYER_HEALTH);
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
    bullets.forEach(b => {
      ctx.fillStyle = COLORS.bullet;
      ctx.beginPath();
      ctx.arc(b.x, b.y, BULLET_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = COLORS.bulletStroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  // ---- HUD (Top Bar) ----
  function drawHUD(p1, p2) {
    const hudY = 12;

    // P1 info — left side
    ctx.fillStyle = COLORS.p1;
    ctx.font = 'bold 16px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText(`P1: ${p1.score} kills`, 20, hudY + 16);

    // P1 health mini bar
    drawHealthBar(20, hudY + 24, 100, 8, p1.health, PLAYER_HEALTH);

    // P2 info — right side
    ctx.fillStyle = COLORS.p2;
    ctx.textAlign = 'right';
    ctx.fillText(`P2: ${p2.score} kills`, CANVAS_WIDTH - 20, hudY + 16);

    // P2 health mini bar
    drawHealthBar(CANVAS_WIDTH - 120, hudY + 24, 100, 8, p2.health, PLAYER_HEALTH);

    // Center — game info
    ctx.fillStyle = COLORS.hudText;
    ctx.textAlign = 'center';
    ctx.font = '12px Courier New';
    ctx.fillText(`First to ${WIN_SCORE} wins`, CANVAS_WIDTH / 2, hudY + 16);
  }

  // ---- Countdown Overlay ----
  function drawCountdown(seconds) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 120px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = seconds > 0 ? seconds.toString() : 'GO!';
    ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    ctx.textBaseline = 'alphabetic';
  }

  // ---- Respawn Timer ----
  function drawRespawnTimer(player, timeLeft) {
    const cx = player.x + PLAYER_SIZE / 2;
    const cy = player.y + PLAYER_SIZE / 2;

    // Ghost outline
    ctx.strokeStyle = player.id === 1 ? COLORS.p1 : COLORS.p2;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    ctx.strokeRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    ctx.globalAlpha = 1;

    // Countdown text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.ceil(timeLeft / 1000).toString(), cx, cy);
    ctx.textBaseline = 'alphabetic';
  }

  // ---- Game Over Screen ----
  function drawGameOver(winner) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const winColor = winner === 1 ? COLORS.p1 : COLORS.p2;

    ctx.fillStyle = winColor;
    ctx.font = 'bold 60px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`PLAYER ${winner} WINS!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

    ctx.fillStyle = '#aaaaaa';
    ctx.font = '20px Courier New';
    ctx.fillText('Press R to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);

    ctx.textBaseline = 'alphabetic';
  }

  return {
    init,
    drawArena,
    drawObstacles,
    drawPlayer,
    drawBullets,
    drawHUD,
    drawCountdown,
    drawRespawnTimer,
    drawGameOver,
  };
})();
