const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let food = { x: 5, y: 5 };
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameSpeed = 100; // Default speed (normal mode)
let backgroundColor = "black"; // Default background color
let snakeColor = "lime"; // Default snake color

const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const startMenu = document.getElementById("startMenu");
const gameUI = document.getElementById("gameUI");

// Set initial high score display
highScoreDisplay.textContent = highScore;

// Start menu event listeners
document.getElementById("slowMode").addEventListener("click", () => {
  gameSpeed = 150; // Slow mode
});

document.getElementById("normalMode").addEventListener("click", () => {
  gameSpeed = 100; // Normal mode
});

document.getElementById("fastMode").addEventListener("click", () => {
  gameSpeed = 50; // Fast mode
});

document.getElementById("startGame").addEventListener("click", () => {
  backgroundColor = document.getElementById("backgroundColor").value;
  snakeColor = document.getElementById("snakeColor").value;
  startGame();
});

// Start the game
function startGame() {
  startMenu.style.display = "none"; // Hide start menu
  gameUI.style.display = "block"; // Show game UI
  placeFood();
  drawGame();
}

// Draw everything on the canvas
function drawGame() {
  moveSnake();

  if (checkGameOver()) {
    alert("Game Over! Score: " + score);
    resetGame();
    return;
  }

  clearScreen();
  drawSnake();
  drawFood();
  setTimeout(drawGame, gameSpeed); // Use gameSpeed for dynamic speed
}

// Clear the screen
function clearScreen() {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Draw the snake with pixel art shading
function drawSnake() {
  snake.forEach((segment, index) => {
    const x = segment.x * gridSize;
    const y = segment.y * gridSize;

    // Base color
    ctx.fillStyle = snakeColor;
    ctx.fillRect(x, y, gridSize, gridSize);

    // Add shading for a 3D effect
    if (index === 0) {
      // Head: Add a gradient for a rounded look
      const gradient = ctx.createRadialGradient(
        x + gridSize / 2, y + gridSize / 2, 0,
        x + gridSize / 2, y + gridSize / 2, gridSize / 2
      );
      gradient.addColorStop(0, snakeColor);
      gradient.addColorStop(1, darkenColor(snakeColor, 20));
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, gridSize, gridSize);
    } else {
      // Body: Add a darker border for shading
      ctx.fillStyle = darkenColor(snakeColor, 10);
      ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
    }

    // Add pixel art highlights
    ctx.fillStyle = lightenColor(snakeColor, 20);
    ctx.fillRect(x + 2, y + 2, 2, 2); // Top-left highlight
    ctx.fillRect(x + gridSize - 4, y + 2, 2, 2); // Top-right highlight
  });
}

// Draw the food
function drawFood() {
  const x = food.x * gridSize;
  const y = food.y * gridSize;

  // Base color
  ctx.fillStyle = "red";
  ctx.fillRect(x, y, gridSize, gridSize);

  // Add shading for a 3D effect
  const gradient = ctx.createRadialGradient(
    x + gridSize / 2, y + gridSize / 2, 0,
    x + gridSize / 2, y + gridSize / 2, gridSize / 2
  );
  gradient.addColorStop(0, "red");
  gradient.addColorStop(1, darkenColor("red", 20));
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, gridSize, gridSize);

  // Add pixel art highlights
  ctx.fillStyle = lightenColor("red", 20);
  ctx.fillRect(x + 2, y + 2, 2, 2); // Top-left highlight
  ctx.fillRect(x + gridSize - 4, y + 2, 2, 2); // Top-right highlight
}

// Helper function to darken a color
function darkenColor(color, percent) {
  const num = parseInt(color.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return `#${(0x1000000 + (R < 0 ? 0 : R > 255 ? 255 : R) * 0x10000 +
    (G < 0 ? 0 : G > 255 ? 255 : G) * 0x100 +
    (B < 0 ? 0 : B > 255 ? 255 : B)).toString(16).slice(1)}`;
}

// Helper function to lighten a color
function lightenColor(color, percent) {
  const num = parseInt(color.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return `#${(0x1000000 + (R < 0 ? 0 : R > 255 ? 255 : R) * 0x10000 +
    (G < 0 ? 0 : G > 255 ? 255 : G) * 0x100 +
    (B < 0 ? 0 : B > 255 ? 255 : B)).toString(16).slice(1)}`;
}

// Move the snake
function moveSnake() {
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Check if snake eats food
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreDisplay.textContent = score;
    snake.unshift(head); // Grow the snake
    placeFood();

    // Update high score
    if (score > highScore) {
      highScore = score;
      highScoreDisplay.textContent = highScore;
      localStorage.setItem("highScore", highScore);
    }
  } else {
    snake.unshift(head); // Move the snake
    snake.pop(); // Remove the tail
  }
}

// Place food randomly
function placeFood() {
  food.x = Math.floor(Math.random() * tileCount);
  food.y = Math.floor(Math.random() * tileCount);

  // Ensure food doesn't spawn on the snake
  snake.forEach(segment => {
    if (segment.x === food.x && segment.y === food.y) {
      placeFood();
    }
  });
}

// Check for game over conditions
function checkGameOver() {
  const head = snake[0];

  // Hit the wall
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    return true;
  }

  // Hit itself
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }

  return false;
}

// Reset the game
function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  score = 0;
  scoreDisplay.textContent = score;
  placeFood();
  startMenu.style.display = "block"; // Show start menu
  gameUI.style.display = "none"; // Hide game UI
}

// Handle keyboard input for direction
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      if (direction.y === 0) direction = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y === 0) direction = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x === 0) direction = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x === 0) direction = { x: 1, y: 0 };
      break;
  }
});