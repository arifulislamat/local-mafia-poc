// ===========================================
// Physics — Collision Detection
// ===========================================

const Physics = (() => {

  // ---- AABB Collision (two rectangles) ----
  function rectsOverlap(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  // ---- Circle-Rect Collision (bullet vs player/obstacle) ----
  function circleRectOverlap(circle, rect) {
    // Find closest point on rect to circle center
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));

    const dx = circle.x - closestX;
    const dy = circle.y - closestY;

    return (dx * dx + dy * dy) < (circle.r * circle.r);
  }

  // ---- Check if player can move to new position ----
  function canMoveTo(newX, newY) {
    const playerRect = { x: newX, y: newY, w: PLAYER_SIZE, h: PLAYER_SIZE };

    // Arena bounds
    if (newX < 4 || newX + PLAYER_SIZE > CANVAS_WIDTH - 4 ||
        newY < 4 || newY + PLAYER_SIZE > CANVAS_HEIGHT - 4) {
      return false;
    }

    // Obstacle collision
    for (const obs of OBSTACLES) {
      if (rectsOverlap(playerRect, obs)) {
        return false;
      }
    }

    return true;
  }

  // ---- Check bullet vs obstacles → returns true if bullet should be removed ----
  function bulletHitsObstacle(bullet) {
    const circle = { x: bullet.x, y: bullet.y, r: BULLET_SIZE / 2 };

    for (const obs of OBSTACLES) {
      if (circleRectOverlap(circle, obs)) {
        return true;
      }
    }
    return false;
  }

  // ---- Check bullet vs player → returns true if hit ----
  function bulletHitsPlayer(bullet, player) {
    if (!player.alive) return false;

    const circle = { x: bullet.x, y: bullet.y, r: BULLET_SIZE / 2 };
    const rect = { x: player.x, y: player.y, w: PLAYER_SIZE, h: PLAYER_SIZE };

    return circleRectOverlap(circle, rect);
  }

  // ---- Check if bullet is out of bounds ----
  function bulletOutOfBounds(bullet) {
    return (
      bullet.x < -BULLET_SIZE ||
      bullet.x > CANVAS_WIDTH + BULLET_SIZE ||
      bullet.y < -BULLET_SIZE ||
      bullet.y > CANVAS_HEIGHT + BULLET_SIZE
    );
  }

  return {
    rectsOverlap,
    circleRectOverlap,
    canMoveTo,
    bulletHitsObstacle,
    bulletHitsPlayer,
    bulletOutOfBounds,
  };
})();
