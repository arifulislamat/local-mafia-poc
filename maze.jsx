import { useState, useCallback, useEffect } from "react";

// Maze Legend:
// 0 = path, 1 = wall, 2 = P1 spawn, 3 = P2 spawn, 4 = zombie spawn, 5 = bomb spawn zone

const CELL_TYPES = {
  0: { label: "Path", color: "#0a0a1a" },
  1: { label: "Wall", color: "#3a3a5c" },
  2: { label: "P1 Spawn", color: "#00d4ff" },
  3: { label: "P2 Spawn", color: "#ff4444" },
  4: { label: "Zombie", color: "#44ff44" },
  5: { label: "Bomb Zone", color: "#ffaa00" },
};

const MAZES = {
  arena_classic: {
    name: "ARENA CLASSIC",
    desc: "Symmetrical combat arena with central crossroads and corner bunkers",
    cols: 21,
    rows: 15,
    data: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 1],
      [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 4, 0, 1, 0, 1, 5, 1, 0, 1, 0, 4, 1, 0, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 5, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 4, 0, 1, 0, 1, 5, 1, 0, 1, 0, 4, 1, 0, 1, 1, 1],
      [1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
      [1, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },
  the_labyrinth: {
    name: "THE LABYRINTH",
    desc: "Winding corridors with dead ends — perfect for ambushes",
    cols: 21,
    rows: 15,
    data: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 3, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 3, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },
  bomb_alley: {
    name: "BOMB ALLEY",
    desc: "Open corridors with many bomb zones — nowhere is safe for long",
    cols: 21,
    rows: 15,
    data: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 3, 1],
      [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
      [1, 3, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },
  fortress: {
    name: "FORTRESS",
    desc: "Four fortified rooms with a dangerous open center",
    cols: 21,
    rows: 15,
    data: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 3, 1],
      [1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 4, 0, 0, 0, 0, 0, 4, 1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 5, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 4, 0, 0, 0, 0, 0, 4, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1],
      [1, 3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },
  snake_pit: {
    name: "SNAKE PIT",
    desc: "Long winding corridors force close-range encounters",
    cols: 21,
    rows: 15,
    data: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },
  crossfire: {
    name: "CROSSFIRE",
    desc: "Long sight lines and open crosses — a sniper's paradise",
    cols: 21,
    rows: 15,
    data: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 3, 1],
      [1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1],
      [1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 4, 0, 0, 0, 0, 5, 0, 0, 0, 0, 4, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 5, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 4, 0, 0, 0, 0, 5, 0, 0, 0, 0, 4, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1],
      [1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1],
      [1, 3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },
};

const MAZE_KEYS = Object.keys(MAZES);

export default function MazeDesigner() {
  const [selectedMaze, setSelectedMaze] = useState(MAZE_KEYS[0]);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [showJSON, setShowJSON] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [paintType, setPaintType] = useState(1);
  const [mazeData, setMazeData] = useState(() => {
    const copy = {};
    for (const key of MAZE_KEYS) {
      copy[key] = MAZES[key].data.map((r) => [...r]);
    }
    return copy;
  });

  const maze = MAZES[selectedMaze];
  const grid = mazeData[selectedMaze];

  const handleCellClick = useCallback(
    (r, c) => {
      if (!editMode) return;
      setMazeData((prev) => {
        const next = { ...prev };
        next[selectedMaze] = next[selectedMaze].map((row, ri) =>
          ri === r
            ? row.map((cell, ci) => (ci === c ? paintType : cell))
            : [...row],
        );
        return next;
      });
    },
    [editMode, paintType, selectedMaze],
  );

  const handleMouseMove = useCallback(
    (r, c, e) => {
      setHoveredCell({ r, c });
      if (editMode && e.buttons === 1) handleCellClick(r, c);
    },
    [editMode, handleCellClick],
  );

  const exportJSON = () => {
    const obj = {
      name: maze.name,
      cols: maze.cols,
      rows: maze.rows,
      data: mazeData[selectedMaze],
    };
    return JSON.stringify(obj, null, 2);
  };

  const exportAllJSON = () => {
    const all = {};
    for (const key of MAZE_KEYS) {
      all[key] = {
        name: MAZES[key].name,
        cols: MAZES[key].cols,
        rows: MAZES[key].rows,
        data: mazeData[key],
      };
    }
    return JSON.stringify(all, null, 2);
  };

  const cellSize = Math.min(36, Math.floor(760 / maze.cols));

  const getCellStyle = (val, isHovered) => {
    const base = CELL_TYPES[val] || CELL_TYPES[0];
    let bg = base.color;
    let border = "1px solid #1a1a2e";
    let boxShadow = "none";

    if (val === 1) {
      bg = "#2d2d4a";
      border = "1px solid #4a4a6a";
      boxShadow = "inset 0 0 4px rgba(100,100,160,0.4)";
    } else if (val === 2) {
      bg = "#003344";
      border = "1px solid #00d4ff";
      boxShadow = "inset 0 0 8px rgba(0,212,255,0.5)";
    } else if (val === 3) {
      bg = "#330011";
      border = "1px solid #ff4444";
      boxShadow = "inset 0 0 8px rgba(255,68,68,0.5)";
    } else if (val === 4) {
      bg = "#0a1a0a";
      border = "1px solid #44ff44";
      boxShadow = "inset 0 0 6px rgba(68,255,68,0.4)";
    } else if (val === 5) {
      bg = "#1a1500";
      border = "1px solid #ffaa00";
      boxShadow = "inset 0 0 6px rgba(255,170,0,0.4)";
    }

    return {
      width: cellSize,
      height: cellSize,
      background: bg,
      border,
      boxShadow,
      cursor: editMode ? "crosshair" : "default",
      opacity: isHovered ? 0.75 : 1,
      transition: "opacity 0.1s",
      position: "relative",
    };
  };

  const renderSprite = (val) => {
    if (val === 2)
      return (
        <span
          style={{
            fontSize: cellSize * 0.55,
            color: "#00d4ff",
            fontFamily: "monospace",
            fontWeight: 900,
            textShadow: "0 0 6px #00d4ff",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            lineHeight: 1,
          }}
        >
          P1
        </span>
      );
    if (val === 3)
      return (
        <span
          style={{
            fontSize: cellSize * 0.55,
            color: "#ff4444",
            fontFamily: "monospace",
            fontWeight: 900,
            textShadow: "0 0 6px #ff4444",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            lineHeight: 1,
          }}
        >
          P2
        </span>
      );
    if (val === 4)
      return (
        <span
          style={{
            fontSize: cellSize * 0.7,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            lineHeight: 1,
            filter: "drop-shadow(0 0 3px #44ff44)",
          }}
        >
          🧟
        </span>
      );
    if (val === 5)
      return (
        <span
          style={{
            fontSize: cellSize * 0.65,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            lineHeight: 1,
            filter: "drop-shadow(0 0 3px #ffaa00)",
          }}
        >
          💣
        </span>
      );
    return null;
  };

  // Wall pattern for visual interest
  const renderWallPattern = (val) => {
    if (val !== 1) return null;
    return (
      <div
        style={{
          position: "absolute",
          inset: 2,
          border: "1px solid rgba(100,100,180,0.2)",
          borderRadius: 1,
          pointerEvents: "none",
        }}
      />
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#07070f",
        color: "#c8c8e0",
        fontFamily: "'Press Start 2P', 'Courier New', monospace",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* CRT overlay effect */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 999,
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Title */}
      <h1
        style={{
          fontSize: 22,
          textAlign: "center",
          color: "#ff6b00",
          textShadow:
            "0 0 20px rgba(255,107,0,0.6), 0 0 40px rgba(255,107,0,0.2)",
          letterSpacing: 4,
          marginBottom: 6,
        }}
      >
        ◈ MAZE ARSENAL ◈
      </h1>
      <p
        style={{
          fontSize: 9,
          color: "#666",
          letterSpacing: 3,
          marginBottom: 24,
          textTransform: "uppercase",
        }}
      >
        Retro Maze Combat — Level Designs
      </p>

      {/* Maze Selector Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 20,
          maxWidth: 800,
        }}
      >
        {MAZE_KEYS.map((key) => {
          const active = key === selectedMaze;
          return (
            <button
              key={key}
              onClick={() => setSelectedMaze(key)}
              style={{
                padding: "8px 14px",
                fontSize: 8,
                fontFamily: "'Press Start 2P', 'Courier New', monospace",
                background: active ? "#ff6b00" : "#1a1a2e",
                color: active ? "#000" : "#888",
                border: active ? "2px solid #ff9944" : "2px solid #2a2a4a",
                cursor: "pointer",
                letterSpacing: 1,
                textTransform: "uppercase",
                transition: "all 0.15s",
              }}
            >
              {MAZES[key].name}
            </button>
          );
        })}
      </div>

      {/* Maze Info */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 16,
          padding: "12px 24px",
          background: "#0d0d1a",
          border: "1px solid #2a2a4a",
          maxWidth: 600,
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: "#ff6b00",
            marginBottom: 6,
            textShadow: "0 0 10px rgba(255,107,0,0.4)",
          }}
        >
          {maze.name}
        </div>
        <div style={{ fontSize: 8, color: "#777", lineHeight: 1.6 }}>
          {maze.desc}
        </div>
        <div style={{ fontSize: 7, color: "#555", marginTop: 4 }}>
          {maze.cols}×{maze.rows} tiles
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            padding: "6px 14px",
            fontSize: 8,
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            background: editMode ? "#44ff44" : "#1a1a2e",
            color: editMode ? "#000" : "#888",
            border: editMode ? "2px solid #66ff66" : "2px solid #2a2a4a",
            cursor: "pointer",
          }}
        >
          {editMode ? "✏️ EDITING" : "EDIT MODE"}
        </button>
        <button
          onClick={() => setShowJSON(!showJSON)}
          style={{
            padding: "6px 14px",
            fontSize: 8,
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            background: showJSON ? "#00d4ff" : "#1a1a2e",
            color: showJSON ? "#000" : "#888",
            border: showJSON ? "2px solid #44eeff" : "2px solid #2a2a4a",
            cursor: "pointer",
          }}
        >
          {showJSON ? "HIDE JSON" : "EXPORT JSON"}
        </button>
        <button
          onClick={() => {
            setMazeData((prev) => ({
              ...prev,
              [selectedMaze]: MAZES[selectedMaze].data.map((r) => [...r]),
            }));
          }}
          style={{
            padding: "6px 14px",
            fontSize: 8,
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            background: "#1a1a2e",
            color: "#ff4444",
            border: "2px solid #2a2a4a",
            cursor: "pointer",
          }}
        >
          RESET
        </button>
      </div>

      {/* Paint palette (edit mode) */}
      {editMode && (
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 16,
            alignItems: "center",
            padding: "8px 16px",
            background: "#0d0d1a",
            border: "1px solid #2a2a4a",
          }}
        >
          <span style={{ fontSize: 7, color: "#555", marginRight: 8 }}>
            PAINT:
          </span>
          {Object.entries(CELL_TYPES).map(([val, info]) => (
            <button
              key={val}
              onClick={() => setPaintType(Number(val))}
              style={{
                width: 28,
                height: 28,
                background: info.color,
                border:
                  paintType === Number(val)
                    ? "2px solid #fff"
                    : "2px solid #333",
                cursor: "pointer",
                position: "relative",
              }}
              title={info.label}
            >
              {paintType === Number(val) && (
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 8,
                    color: "#fff",
                  }}
                >
                  ▼
                </span>
              )}
            </button>
          ))}
          <span style={{ fontSize: 6, color: "#555", marginLeft: 8 }}>
            {CELL_TYPES[paintType].label}
          </span>
        </div>
      )}

      {/* Maze Grid */}
      <div
        style={{
          background: "#0a0a18",
          padding: 8,
          border: "2px solid #2a2a4a",
          boxShadow:
            "0 0 30px rgba(255,107,0,0.08), inset 0 0 60px rgba(0,0,0,0.5)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow corners */}
        <div
          style={{
            position: "absolute",
            top: -2,
            left: -2,
            width: 12,
            height: 12,
            borderTop: "2px solid #ff6b00",
            borderLeft: "2px solid #ff6b00",
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            width: 12,
            height: 12,
            borderTop: "2px solid #ff6b00",
            borderRight: "2px solid #ff6b00",
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -2,
            left: -2,
            width: 12,
            height: 12,
            borderBottom: "2px solid #ff6b00",
            borderLeft: "2px solid #ff6b00",
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            width: 12,
            height: 12,
            borderBottom: "2px solid #ff6b00",
            borderRight: "2px solid #ff6b00",
            opacity: 0.6,
          }}
        />

        {grid.map((row, r) => (
          <div key={r} style={{ display: "flex" }}>
            {row.map((cell, c) => {
              const isHovered =
                hoveredCell && hoveredCell.r === r && hoveredCell.c === c;
              return (
                <div
                  key={c}
                  style={getCellStyle(cell, isHovered)}
                  onClick={() => handleCellClick(r, c)}
                  onMouseMove={(e) => handleMouseMove(r, c, e)}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {renderWallPattern(cell)}
                  {renderSprite(cell)}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 16,
          flexWrap: "wrap",
          justifyContent: "center",
          padding: "10px 20px",
          background: "#0a0a18",
          border: "1px solid #1a1a2e",
        }}
      >
        {Object.entries(CELL_TYPES).map(([val, info]) => (
          <div
            key={val}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                background: info.color,
                border: "1px solid #444",
              }}
            />
            <span style={{ fontSize: 7, color: "#777" }}>{info.label}</span>
          </div>
        ))}
      </div>

      {/* Cell Info */}
      {hoveredCell && (
        <div style={{ fontSize: 7, color: "#555", marginTop: 8 }}>
          [{hoveredCell.c},{hoveredCell.r}] —{" "}
          {CELL_TYPES[grid[hoveredCell.r][hoveredCell.c]]?.label || "Unknown"}
        </div>
      )}

      {/* JSON Export */}
      {showJSON && (
        <div style={{ marginTop: 20, maxWidth: 800, width: "100%" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button
              onClick={() => navigator.clipboard?.writeText(exportJSON())}
              style={{
                padding: "6px 12px",
                fontSize: 7,
                fontFamily: "'Press Start 2P', 'Courier New', monospace",
                background: "#1a1a2e",
                color: "#00d4ff",
                border: "1px solid #2a2a4a",
                cursor: "pointer",
              }}
            >
              COPY CURRENT
            </button>
            <button
              onClick={() => navigator.clipboard?.writeText(exportAllJSON())}
              style={{
                padding: "6px 12px",
                fontSize: 7,
                fontFamily: "'Press Start 2P', 'Courier New', monospace",
                background: "#1a1a2e",
                color: "#ff6b00",
                border: "1px solid #2a2a4a",
                cursor: "pointer",
              }}
            >
              COPY ALL MAZES
            </button>
          </div>
          <pre
            style={{
              background: "#0a0a18",
              border: "1px solid #2a2a4a",
              padding: 16,
              fontSize: 9,
              color: "#44ff44",
              fontFamily: "'Courier New', monospace",
              overflow: "auto",
              maxHeight: 300,
              whiteSpace: "pre-wrap",
              lineHeight: 1.5,
            }}
          >
            {exportJSON()}
          </pre>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: 30,
          fontSize: 7,
          color: "#333",
          letterSpacing: 2,
          textAlign: "center",
        }}
      >
        ◈ 6 BATTLE-READY MAZE LAYOUTS ◈ CLICK EDIT TO CUSTOMIZE ◈ EXPORT JSON
        FOR GAME USE ◈
      </div>
    </div>
  );
}
