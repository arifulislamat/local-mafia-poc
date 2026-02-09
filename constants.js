// ===========================================
// Game Constants & Configuration
// ===========================================

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

// Player
const PLAYER_SIZE = 40;
const PLAYER_SPEED = 5; // px per frame
const PLAYER_HEALTH = 5;
const RESPAWN_TIME = 3000; // ms

// Bullets
const BULLET_SIZE = 8;
const BULLET_SPEED = 10; // px per frame
const FIRE_RATE = 500; // ms cooldown between shots

// Scoring
const WIN_SCORE = 5;

// Colors
const COLORS = {
  background: '#f0f0f0',
  border: '#333333',
  obstacle: '#888888',
  obstacleStroke: '#666666',
  p1: '#3498db',       // Blue
  p1Dark: '#2980b9',
  p2: '#e74c3c',       // Red
  p2Dark: '#c0392b',
  bullet: '#f39c12',   // Orange
  bulletStroke: '#e67e22',
  healthGreen: '#2ecc71',
  healthRed: '#e74c3c',
  healthBg: '#333333',
  hudText: '#333333',
  white: '#ffffff',
};

// Player spawn positions (P1 bottom-left, P2 top-right)
const SPAWN_P1 = { x: 100, y: CANVAS_HEIGHT - 100 - PLAYER_SIZE };
const SPAWN_P2 = { x: CANVAS_WIDTH - 100 - PLAYER_SIZE, y: 100 };

// Default facing directions
const DEFAULT_DIR_P1 = { dx: 1, dy: 0 };  // facing right
const DEFAULT_DIR_P2 = { dx: -1, dy: 0 }; // facing left

// Obstacle layout — symmetric design
// { x, y, w, h }
const OBSTACLES = [
  // === Top row small obstacles ===
  { x: 60,   y: 60,  w: 60, h: 60 },
  { x: 160,  y: 60,  w: 60, h: 60 },
  { x: 500,  y: 60,  w: 60, h: 60 },
  { x: 640,  y: 60,  w: 60, h: 60 },
  { x: 980,  y: 60,  w: 60, h: 60 },
  { x: 1080, y: 60,  w: 60, h: 60 },

  // === Upper-middle medium obstacles ===
  { x: 200,  y: 250, w: 150, h: 60 },
  { x: 525,  y: 220, w: 150, h: 60 },
  { x: 850,  y: 250, w: 150, h: 60 },

  // === Center medium obstacle ===
  { x: 525,  y: 370, w: 150, h: 60 },

  // === Lower-middle medium obstacles ===
  { x: 200,  y: 490, w: 150, h: 60 },
  { x: 525,  y: 520, w: 150, h: 60 },
  { x: 850,  y: 490, w: 150, h: 60 },

  // === Bottom row small obstacles ===
  { x: 60,   y: 680, w: 60, h: 60 },
  { x: 160,  y: 680, w: 60, h: 60 },
  { x: 500,  y: 680, w: 60, h: 60 },
  { x: 640,  y: 680, w: 60, h: 60 },
  { x: 980,  y: 680, w: 60, h: 60 },
  { x: 1080, y: 680, w: 60, h: 60 },
];

// Game states
const STATE = {
  LOBBY: 'lobby',
  COUNTDOWN: 'countdown',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
};

// Countdown duration
const COUNTDOWN_DURATION = 3; // seconds
