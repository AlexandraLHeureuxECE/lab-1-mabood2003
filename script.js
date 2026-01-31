"use strict";

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

let board = Array(9).fill(null);
let currentPlayer = "X";
let gameOver = false;
let winningIndices = [];

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function createBoard() {
  boardEl.innerHTML = "";

  // Create cells directly inside the existing #board
  for (let i = 0; i < 9; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cell";
    btn.setAttribute("role", "gridcell");
    btn.setAttribute("aria-label", `Cell ${i + 1}`);
    btn.dataset.index = String(i);
    btn.addEventListener("click", handleCellClick);
    boardEl.appendChild(btn);
  }

  // Add win line overlay as a child of #board
  const line = document.createElement("div");
  line.className = "win-line";
  line.id = "winLine";
  boardEl.appendChild(line);
}

function handleCellClick(e) {
  if (gameOver) return;

  const idx = Number(e.currentTarget.dataset.index);
  if (!Number.isInteger(idx) || idx < 0 || idx > 8) return;

  // prevent overwriting
  if (board[idx] !== null) return;

  board[idx] = currentPlayer;

  const result = getGameResult();
  if (result.status === "win") {
    gameOver = true;
    winningIndices = result.winningIndices;
    statusEl.textContent = `Player ${result.winner} wins!`;
    render();
    positionWinLine(); // after render so DOM reflects final state
    return;
  }

  if (result.status === "draw") {
    gameOver = true;
    winningIndices = [];
    statusEl.textContent = "It’s a draw!";
    render();
    hideWinLine();
    return;
  }

  // switch turns
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusEl.textContent = `Player ${currentPlayer}’s turn`;
  render();
}

function getGameResult() {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    const v = board[a];
    if (v && v === board[b] && v === board[c]) {
      return { status: "win", winner: v, winningIndices: line };
    }
  }

  const isDraw = board.every((cell) => cell !== null);
  return isDraw ? { status: "draw" } : { status: "ongoing" };
}

function render() {
  const cells = boardEl.querySelectorAll(".cell");

  cells.forEach((cell, i) => {
    const value = board[i];

    cell.textContent = value ?? "";

    cell.classList.remove("is-empty", "is-disabled", "is-winning");

    if (value === null && !gameOver) cell.classList.add("is-empty");
    if (value !== null || gameOver) cell.classList.add("is-disabled");
    if (gameOver && winningIndices.includes(i)) cell.classList.add("is-winning");
  });

  if (!gameOver) hideWinLine();
}

function hideWinLine() {
  const line = document.getElementById("winLine");
  if (!line) return;
  line.classList.remove("show");
}

function positionWinLine() {
  const line = document.getElementById("winLine");
  if (!line || winningIndices.length !== 3) return;

  // Find first and last cells in the winning line (center-to-center)
  const firstIdx = winningIndices[0];
  const lastIdx = winningIndices[2];

  const cells = boardEl.querySelectorAll(".cell");
  const firstCell = cells[firstIdx];
  const lastCell = cells[lastIdx];
  if (!firstCell || !lastCell) return;

  const boardRect = boardEl.getBoundingClientRect();
  const r1 = firstCell.getBoundingClientRect();
  const r2 = lastCell.getBoundingClientRect();

  const x1 = (r1.left + r1.right) / 2 - boardRect.left;
  const y1 = (r1.top + r1.bottom) / 2 - boardRect.top;
  const x2 = (r2.left + r2.right) / 2 - boardRect.left;
  const y2 = (r2.top + r2.bottom) / 2 - boardRect.top;

  const dx = x2 - x1;
  const dy = y2 - y1;

  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  line.style.left = `${x1}px`;
  line.style.top = `${y1}px`;
  line.style.width = `${length}px`;
  line.style.transform = `translateY(-50%) rotate(${angle}deg)`;

  line.classList.add("show");
}

function resetGame() {
  board = Array(9).fill(null);
  currentPlayer = "X";
  gameOver = false;
  winningIndices = [];
  statusEl.textContent = "Player X’s turn";
  render();
}

restartBtn.addEventListener("click", resetGame);

// Recompute line if viewport changes (keeps it aligned)
window.addEventListener("resize", () => {
  if (gameOver && winningIndices.length === 3) positionWinLine();
});

// init
createBoard();
render();
