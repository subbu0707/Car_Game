import { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);

  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem("carHighScore")) || 0,
  );

  const gameRef = useRef({
    player: {
      x: 175,
      y: 500,
      width: 50,
      height: 90,
      speed: 6,
    },

    enemies: [],

    roadOffset: 0,

    score: 0,

    speed: 5,

    enemyTimer: 0,

    animationId: null,

    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
    },
  });

  const startGame = () => {
    const game = gameRef.current;

    game.player = {
      x: 175,
      y: 500,
      width: 50,
      height: 90,
      speed: 6,
    };

    game.enemies = [];

    game.roadOffset = 0;

    game.score = 0;

    game.speed = 5;

    game.enemyTimer = 0;

    setScore(0);
    setGameOver(false);
    setGameStarted(true);

    if (game.animationId) {
      cancelAnimationFrame(game.animationId);
    }

    gameLoop();
  };

  const createEnemy = () => {
    const game = gameRef.current;

    const roadLeft = 100;
    const roadRight = 400;

    const laneWidth = 75;

    const lanes = [
      roadLeft + 12,
      roadLeft + laneWidth + 12,
      roadLeft + laneWidth * 2 + 12,
      roadLeft + laneWidth * 3 + 12,
    ];

    const lane = lanes[Math.floor(Math.random() * lanes.length)];

    const colors = [
      "#ff3333",
      "#ffcc00",
      "#9933ff",
      "#00cc66",
      "#ff6600",
      "#ffffff",
    ];

    game.enemies.push({
      x: lane,
      y: -120,
      width: 50,
      height: 90,
      speed: game.speed + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  };

  const drawRoad = (ctx, canvas) => {
    const game = gameRef.current;

    // Background
    ctx.fillStyle = "#1d7a32";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Road
    ctx.fillStyle = "#333";
    ctx.fillRect(75, 0, 350, canvas.height);

    // Road borders
    ctx.fillStyle = "#fff";
    ctx.fillRect(75, 0, 8, canvas.height);
    ctx.fillRect(417, 0, 8, canvas.height);

    // Lane lines
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 5;
    ctx.setLineDash([35, 35]);

    game.roadOffset += game.speed;

    if (game.roadOffset > 70) {
      game.roadOffset = 0;
    }

    ctx.lineDashOffset = game.roadOffset;

    ctx.beginPath();

    ctx.moveTo(162, 0);
    ctx.lineTo(162, canvas.height);

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(250, 0);
    ctx.lineTo(250, canvas.height);

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(337, 0);
    ctx.lineTo(337, canvas.height);

    ctx.stroke();

    ctx.setLineDash([]);

    // Roadside trees
    for (let i = 0; i < 8; i++) {
      const y = ((i * 100 + game.roadOffset * 2) % (canvas.height + 100)) - 100;

      drawTree(ctx, 35, y);
      drawTree(ctx, 465, y + 40);
    }
  };

  const drawTree = (ctx, x, y) => {
    // Trunk
    ctx.fillStyle = "#7b451f";
    ctx.fillRect(x - 5, y + 25, 10, 25);

    // Leaves
    ctx.fillStyle = "#0a5c20";

    ctx.beginPath();
    ctx.arc(x, y + 20, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x - 14, y + 30, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + 14, y + 30, 16, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawPlayer = (ctx, player) => {
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(player.x + 5, player.y + 8, player.width, player.height);

    // Car body
    ctx.fillStyle = "#0066ff";

    roundRect(ctx, player.x, player.y, player.width, player.height, 10);

    // Windshield
    ctx.fillStyle = "#bde9ff";

    roundRect(ctx, player.x + 9, player.y + 12, player.width - 18, 27, 6);

    // Back window
    ctx.fillStyle = "#8ed8ff";

    roundRect(ctx, player.x + 9, player.y + 50, player.width - 18, 22, 6);

    // Wheels
    drawWheel(ctx, player.x - 6, player.y + 15);
    drawWheel(ctx, player.x - 6, player.y + 65);

    drawWheel(ctx, player.x + player.width + 6, player.y + 15);
    drawWheel(ctx, player.x + player.width + 6, player.y + 65);

    // Headlights
    ctx.fillStyle = "#ffff99";

    ctx.fillRect(player.x + 7, player.y + 2, 12, 5);
    ctx.fillRect(player.x + player.width - 19, player.y + 2, 12, 5);

    // Stripe
    ctx.fillStyle = "#fff";

    ctx.fillRect(player.x + player.width / 2 - 3, player.y + 42, 6, 38);
  };

  const drawEnemy = (ctx, enemy) => {
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(enemy.x + 5, enemy.y + 8, enemy.width, enemy.height);

    // Body
    ctx.fillStyle = enemy.color;

    roundRect(ctx, enemy.x, enemy.y, enemy.width, enemy.height, 10);

    // Windows
    ctx.fillStyle = "#222";

    roundRect(ctx, enemy.x + 9, enemy.y + 12, enemy.width - 18, 25, 5);

    ctx.fillStyle = "#555";

    roundRect(ctx, enemy.x + 9, enemy.y + 52, enemy.width - 18, 20, 5);

    // Wheels
    drawWheel(ctx, enemy.x - 6, enemy.y + 15);
    drawWheel(ctx, enemy.x - 6, enemy.y + 65);

    drawWheel(ctx, enemy.x + enemy.width + 6, enemy.y + 15);

    drawWheel(ctx, enemy.x + enemy.width + 6, enemy.y + 65);

    // Tail lights
    ctx.fillStyle = "#ff0000";

    ctx.fillRect(enemy.x + 7, enemy.y + 82, 12, 5);
    ctx.fillRect(enemy.x + enemy.width - 19, enemy.y + 82, 12, 5);
  };

  const drawWheel = (ctx, x, y) => {
    ctx.fillStyle = "#111";

    ctx.beginPath();
    ctx.roundRect(x - 5, y, 10, 20, 3);
    ctx.fill();
  };

  const roundRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();

    ctx.roundRect(x, y, width, height, radius);

    ctx.fill();
  };

  const checkCollision = (a, b) => {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const game = gameRef.current;

    // Player movement
    if (game.keys.left) {
      game.player.x -= game.player.speed;
    }

    if (game.keys.right) {
      game.player.x += game.player.speed;
    }

    if (game.keys.up) {
      game.player.y -= game.player.speed;
    }

    if (game.keys.down) {
      game.player.y += game.player.speed;
    }

    // Keep player inside road
    if (game.player.x < 88) {
      game.player.x = 88;
    }

    if (game.player.x > 362) {
      game.player.x = 362;
    }

    if (game.player.y < 20) {
      game.player.y = 20;
    }

    if (game.player.y > canvas.height - 110) {
      game.player.y = canvas.height - 110;
    }

    // Create enemies
    game.enemyTimer++;

    const enemyInterval = Math.max(35, 90 - Math.floor(game.score / 100));

    if (game.enemyTimer > enemyInterval) {
      createEnemy();
      game.enemyTimer = 0;
    }

    // Move enemies
    game.enemies.forEach((enemy) => {
      enemy.y += enemy.speed;
    });

    // Collision
    for (const enemy of game.enemies) {
      if (checkCollision(game.player, enemy)) {
        endGame();
        return;
      }
    }

    // Remove enemies
    game.enemies = game.enemies.filter((enemy) => {
      if (enemy.y > canvas.height + 100) {
        game.score += 10;

        setScore(game.score);

        // Increase difficulty
        game.speed = Math.min(12, 5 + game.score / 300);

        return false;
      }

      return true;
    });

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRoad(ctx, canvas);

    game.enemies.forEach((enemy) => {
      drawEnemy(ctx, enemy);
    });

    drawPlayer(ctx, game.player);

    game.animationId = requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    const game = gameRef.current;

    if (game.animationId) {
      cancelAnimationFrame(game.animationId);
    }

    setGameOver(true);
    setGameStarted(false);

    if (game.score > highScore) {
      setHighScore(game.score);

      localStorage.setItem("carHighScore", game.score);
    }
  };

  const handleKeyDown = (e) => {
    const game = gameRef.current;

    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
      game.keys.left = true;
    }

    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
      game.keys.right = true;
    }

    if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
      game.keys.up = true;
    }

    if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
      game.keys.down = true;
    }
  };

  const handleKeyUp = (e) => {
    const game = gameRef.current;

    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
      game.keys.left = false;
    }

    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
      game.keys.right = false;
    }

    if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
      game.keys.up = false;
    }

    if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
      game.keys.down = false;
    }
  };

  const pressButton = (direction) => {
    gameRef.current.keys[direction] = true;
  };

  const releaseButton = (direction) => {
    gameRef.current.keys[direction] = false;
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);

      window.removeEventListener("keyup", handleKeyUp);

      if (gameRef.current.animationId) {
        cancelAnimationFrame(gameRef.current.animationId);
      }
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#111827,#020617)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <h1
        style={{
          margin: "5px 0 10px",
          fontSize: "32px",
        }}
      >
        🚗 Highway Racer
      </h1>

      <div
        style={{
          width: "500px",
          maxWidth: "95vw",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        <span>🏆 Score: {score}</span>

        <span>⭐ Best: {highScore}</span>
      </div>

      <div
        style={{
          position: "relative",
          width: "500px",
          maxWidth: "95vw",
        }}
      >
        <canvas
          ref={canvasRef}
          width={500}
          height={650}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            borderRadius: "15px",
            border: "4px solid #555",
            background: "#333",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          }}
        />

        {!gameStarted && !gameOver && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              borderRadius: "15px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              padding: "20px",
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: "60px" }}>🚗</div>

            <h2
              style={{
                fontSize: "32px",
                margin: "10px",
              }}
            >
              Highway Racer
            </h2>

            <p>Avoid the enemy cars and get the highest score!</p>

            <button onClick={startGame} style={buttonStyle}>
              ▶ Start Game
            </button>

            <p
              style={{
                marginTop: "20px",
                fontSize: "14px",
                opacity: 0.8,
              }}
            >
              Use Arrow Keys or WASD to drive
            </p>
          </div>
        )}

        {gameOver && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
              borderRadius: "15px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "60px" }}>💥</div>

            <h2
              style={{
                fontSize: "35px",
                margin: "10px",
              }}
            >
              Game Over
            </h2>

            <p
              style={{
                fontSize: "22px",
              }}
            >
              Score: {score}
            </p>

            <p
              style={{
                fontSize: "18px",
              }}
            >
              Best Score: {highScore}
            </p>

            <button onClick={startGame} style={buttonStyle}>
              🔄 Play Again
            </button>
          </div>
        )}
      </div>

      {/* Mobile Controls */}

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <ControlButton
          text="⬆"
          onDown={() => pressButton("up")}
          onUp={() => releaseButton("up")}
        />

        <div
          style={{
            display: "flex",
            gap: "15px",
          }}
        >
          <ControlButton
            text="⬅"
            onDown={() => pressButton("left")}
            onUp={() => releaseButton("left")}
          />

          <ControlButton
            text="⬇"
            onDown={() => pressButton("down")}
            onUp={() => releaseButton("down")}
          />

          <ControlButton
            text="➡"
            onDown={() => pressButton("right")}
            onUp={() => releaseButton("right")}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "15px 20px",
          background: "#1e293b",
          borderRadius: "10px",
          textAlign: "center",
          maxWidth: "500px",
        }}
      >
        <strong>Controls</strong>

        <p
          style={{
            margin: "8px 0 0",
            fontSize: "14px",
            opacity: 0.8,
          }}
        >
          ⬅️ ➡️ Move left/right &nbsp; | &nbsp; ⬆️ ⬇️ Move up/down
        </p>
      </div>
    </div>
  );
}

function ControlButton({ text, onDown, onUp }) {
  return (
    <button
      onMouseDown={onDown}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchStart={(e) => {
        e.preventDefault();
        onDown();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onUp();
      }}
      style={{
        width: "65px",
        height: "55px",
        border: "none",
        borderRadius: "12px",
        background: "#334155",
        color: "white",
        fontSize: "25px",
        fontWeight: "bold",
        cursor: "pointer",
        boxShadow: "0 5px 10px rgba(0,0,0,0.3)",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {text}
    </button>
  );
}

const buttonStyle = {
  padding: "14px 30px",
  border: "none",
  borderRadius: "10px",
  background: "#2563eb",
  color: "white",
  fontSize: "18px",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 5px 15px rgba(37,99,235,0.4)",
};
