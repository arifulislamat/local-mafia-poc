# POC PRD: Peer-to-Peer Browser Battle Game

## Executive Summary

A minimal browser-based 2-player shooter game deployed on GitHub Pages with **zero server infrastructure**. Players connect peer-to-peer via WebRTC for real-time gameplay.

---

## 1. Project Goals

### Primary Objective

Validate peer-to-peer real-time gameplay in browsers without any backend server.

### Success Criteria

- Two players can connect via shared link/code
- Real-time shooting mechanics work smoothly (<100ms latency on LAN)
- Deployed and playable via GitHub Pages
- Complete POC in **1-2 weeks**

---

## 2. Core Features (MVP)

### 2.1 Connection System

- **Host creates game** → Gets shareable room code
- **Guest joins** → Enters room code
- **WebRTC peer-to-peer connection** → No signaling server (use public STUN)
- **Connection status indicator** → "Waiting...", "Connected", "Disconnected"

### 2.2 Game Mechanics

- **2 players** (P1 and P2 from your mockup)
- **Simple arena** with obstacles (rectangles from your design)
- **Player controls:**
  - Arrow keys / WASD for movement
  - Spacebar to shoot
- **Shooting:**
  - Players fire projectiles
  - Hit detection (projectile collides with other player)
  - Health bar (5 HP each)
  - Death → Respawn after 3 seconds
- **Score tracking:** First to 5 kills wins

### 2.3 Visual Design

- **Minimal retro graphics:**
  - Players: Colored rectangles (P1=blue, P2=red)
  - Obstacles: Gray rectangles
  - Projectiles: Small circles
  - Arena: White background with border
- **HUD:**
  - Player names (P1/P2)
  - Health bars
  - Score counter
  - Connection status

---

## 3. Technical Architecture

### 3.1 Tech Stack

```
Frontend:    Vanilla JS + HTML5 Canvas (no frameworks)
Networking:  WebRTC (PeerJS library for simplicity)
Game Loop:   requestAnimationFrame
Physics:     Simple AABB collision detection
Deployment:  GitHub Pages (static hosting)
```

### 3.2 Why This Stack?

- **Vanilla JS:** No build step, instant deployment
- **PeerJS:** Abstracts WebRTC complexity, includes free signaling
- **Canvas:** Fast 2D rendering, perfect for retro graphics
- **GitHub Pages:** Free, automatic deployment via git push

### 3.3 Network Architecture

```
┌─────────────┐                    ┌─────────────┐
│   Player 1  │                    │   Player 2  │
│  (Browser)  │                    │  (Browser)  │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │  1. Host creates room            │
       │     Gets peer ID                 │
       │◄─────────────────────────────────┤
       │                                  │
       │  2. Share peer ID (copy/paste)  │
       ├─────────────────────────────────►│
       │                                  │
       │  3. WebRTC P2P Connection       │
       │◄────────────────────────────────►│
       │     (via PeerJS cloud)           │
       │                                  │
       │  4. Game state sync 60fps       │
       │◄────────────────────────────────►│
       │      {pos, health, bullets}      │
       └──────────────────────────────────┘

Note: PeerJS provides free STUN/signaling
      No custom server needed!
```

### 3.4 State Synchronization Strategy

**Host-Authoritative Model:**

- Player 1 (host) is the authority
- Player 1 simulates all physics
- Player 2 sends inputs only
- Player 1 broadcasts game state

**Why?** Simplest for POC, avoids conflicts

**Data Flow:**

```
Player 2 → Player 1:  { input: "up", shoot: true }
Player 1 → Player 2:  {
  p1: {x, y, health},
  p2: {x, y, health},
  bullets: [...],
  scores: {p1: 2, p2: 3}
}
```

---

## 4. File Structure

```
repository/
├── index.html              # Main game page
├── game.js                 # Core game logic
├── network.js              # WebRTC/PeerJS wrapper
├── renderer.js             # Canvas drawing
├── physics.js              # Collision detection
├── constants.js            # Game config
├── styles.css              # Minimal styling
└── README.md               # Setup instructions
```

**Total: ~7 files, ~800-1000 lines of code**

---

## 5. Detailed Feature Specs

### 5.1 Connection Flow

**Host Flow:**

```
1. Click "Create Game"
2. Display: "Room Code: abc-def-123"
3. Show: "Waiting for player 2..."
4. On connect: Start game countdown (3, 2, 1, GO!)
```

**Guest Flow:**

```
1. Enter room code: [______]
2. Click "Join Game"
3. Show: "Connecting..."
4. On connect: Start game countdown
```

### 5.2 Game Loop (60 FPS)

```javascript
// Pseudocode
function gameLoop() {
  // 1. Process inputs
  handleKeyboard();

  // 2. Update physics (host only)
  if (isHost) {
    updatePlayerPositions();
    updateBullets();
    checkCollisions();
    checkWinCondition();
  }

  // 3. Network sync
  if (isHost) {
    sendGameState();
  } else {
    sendInputs();
  }

  // 4. Render
  clearCanvas();
  drawObstacles();
  drawPlayers();
  drawBullets();
  drawHUD();

  requestAnimationFrame(gameLoop);
}
```

### 5.3 Game Constants

```javascript
CANVAS_WIDTH: 1200px
CANVAS_HEIGHT: 800px
PLAYER_SIZE: 40px
PLAYER_SPEED: 5px/frame
BULLET_SIZE: 8px
BULLET_SPEED: 10px/frame
FIRE_RATE: 500ms cooldown
PLAYER_HEALTH: 5 HP
RESPAWN_TIME: 3 seconds
WIN_SCORE: 5 kills
```

### 5.4 Obstacle Layout

```
┌────────────────────────────────────┐
│  □  □      □           □  □     □  │  ← Small obstacles
│                                    │
│                                    │
│      ▬▬▬    ▬▬▬           ▬▬▬     │  ← Medium obstacles
│                                    │
│             ▬▬▬                    │
│                                    │
│                                    │
│  □  □         □       □  □      □  │
└────────────────────────────────────┘

Legend:
□ = 60x60px obstacle
▬▬▬ = 150x60px obstacle
```

---

## 6. Development Phases

### Week 1: Core Infrastructure

**Day 1-2: Setup & Rendering**

- [ ] Create GitHub repo
- [ ] Basic HTML5 Canvas setup
- [ ] Draw static arena with obstacles
- [ ] Player sprites (colored rectangles)
- [ ] Keyboard input handling

**Day 3-4: Local Gameplay**

- [ ] Player movement
- [ ] Shooting mechanics
- [ ] Collision detection
- [ ] Health system
- [ ] Score tracking
- [ ] Win condition

**Day 5-7: Networking**

- [ ] Integrate PeerJS
- [ ] Connection UI (create/join)
- [ ] Peer-to-peer connection
- [ ] State synchronization
- [ ] Input broadcasting
- [ ] Test with 2 browsers locally

### Week 2: Polish & Deploy

**Day 8-9: Bug Fixes**

- [ ] Handle disconnections gracefully
- [ ] Fix latency issues
- [ ] Smooth interpolation
- [ ] Edge case testing

**Day 10-11: UX Polish**

- [ ] Loading states
- [ ] Error messages
- [ ] Victory screen
- [ ] Restart game option
- [ ] Mobile responsive (optional)

**Day 12-14: Deploy & Test**

- [ ] Deploy to GitHub Pages
- [ ] Test on different networks
- [ ] Write README
- [ ] Create demo video
- [ ] Share for feedback

---

## 7. Risk Mitigation

### 7.1 Technical Risks

| Risk                    | Impact | Mitigation                                     |
| ----------------------- | ------ | ---------------------------------------------- |
| WebRTC connection fails | High   | Use PeerJS fallback, show clear error messages |
| High latency (>200ms)   | Medium | Add client-side prediction, visual feedback    |
| NAT traversal issues    | Medium | PeerJS handles STUN/TURN, document limitations |
| State desync            | Medium | Periodic full state sync every 5 seconds       |
| Browser compatibility   | Low    | Target Chrome/Firefox only for POC             |

### 7.2 Scope Creep Prevention

**NOT in POC:**

- ❌ More than 2 players
- ❌ Different weapons/powerups
- ❌ Advanced graphics/animations
- ❌ Sound effects
- ❌ Matchmaking system
- ❌ Persistent accounts/stats
- ❌ Mobile controls
- ❌ Game modes

---

## 8. Testing Strategy

### 8.1 Local Testing

- Test in 2 browser windows on same machine
- Test on same WiFi network (2 devices)
- Test guest reconnection after disconnect

### 8.2 Network Testing

- Test on different WiFi networks (simulate real scenario)
- Test with artificial latency (Chrome DevTools)
- Test with packet loss simulation

### 8.3 Edge Cases

- Player disconnects mid-game
- Player refreshes page
- Invalid room code
- Simultaneous shots
- Collision corner cases

---

## 9. Success Metrics

### Qualitative

- ✅ Two friends can play together smoothly
- ✅ Connection setup takes <30 seconds
- ✅ Game feels responsive

### Quantitative

- ✅ Latency <100ms on LAN
- ✅ Latency <200ms on different WiFi
- ✅ Frame rate >30fps
- ✅ Connection success rate >80%

---

## 10. Deployment Instructions

```bash
# 1. Create GitHub repo
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/p2p-shooter.git
git push -u origin main

# 2. Enable GitHub Pages
# Go to: Settings → Pages → Source: main branch

# 3. Access game at:
# https://yourusername.github.io/p2p-shooter/
```

---

## 11. Post-POC Evaluation Questions

After completing POC, evaluate:

1. **Does WebRTC work reliably?**
2. **Is latency acceptable for gameplay?**
3. **Is peer-to-peer viable without server?**
4. **What are the main pain points?**
5. **Should we add a lightweight signaling server?**
6. **Is this fun to play?**
7. **What features are most needed?**

Based on answers, decide:

- Continue with P2P approach?
- Add minimal Node.js signaling server?
- Switch to Godot for better tooling?
- Migrate to Rust+Tauri for native performance?

---

## 12. Next Steps After POC

If POC is successful:

**Option A: Enhance Web Version**

- Add more features
- Improve graphics
- Add sound
- Better matchmaking

**Option B: Rebuild in Godot**

- Use learnings to build polished version
- Better tooling and performance
- Cross-platform native + web

**Option C: Rebuild in Rust+Tauri**

- Maximum performance
- Deep learning experience
- Production-quality architecture

---

## Appendix: Quick Start Code Snippet

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>P2P Shooter POC</title>
    <script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>
  </head>
  <body>
    <div id="lobby">
      <button onclick="createGame()">Create Game</button>
      <input id="roomCode" placeholder="Enter room code" />
      <button onclick="joinGame()">Join Game</button>
    </div>
    <canvas id="gameCanvas" width="1200" height="800"></canvas>
    <script src="game.js"></script>
  </body>
</html>
```

---

## Timeline Summary

- **Week 1:** Core game + networking
- **Week 2:** Polish + deploy
- **Total:** 2 weeks to playable POC

---

## Getting Started

**Ready to start building?** Follow these steps:

1. Clone/create your GitHub repository
2. Start with `index.html` and basic canvas rendering
3. Add player movement and shooting (local first)
4. Integrate PeerJS for networking
5. Test and iterate
6. Deploy to GitHub Pages

**Questions or need help with specific implementation?** Refer back to this PRD or reach out for technical guidance.

---

**Document Version:** 1.0  
**Last Updated:** February 9, 2026  
**Status:** Ready for Development
