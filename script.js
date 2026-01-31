"use strict";

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

let board = Array(9).fill(null);
let currentPlayer = "X";
let gameOver = false;

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
}

function handleCellClick(e) {
  if (gameOver) return;

  const idx = Number(e.currentTarget.dataset.index);
  if (!Number.isInteger(idx) || idx < 0 || idx > 8) return;

  // prevent overwriting
  if (board[idx] !== null) return;

  board[idx] = currentPlayer;
  render();

  const result = getGameResult();
  if (result.status === "win") {
    gameOver = true;
    statusEl.textContent = `Player ${result.winner} wins!`;
    return;
  }

  if (result.status === "draw") {
    gameOver = true;
    statusEl.textContent = "It’s a draw!";
    return;
  }

  // switch turns
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusEl.textContent = `Player ${currentPlayer}’s turn`;
}

function getGameResult() {
  for (const [a, b, c] of WIN_LINES) {
    const v = board[a];
    if (v && v === board[b] && v === board[c]) {
      return { status: "win", winner: v };
    }
  }
  const isDraw = board.every((cell) => cell !== null);
  return isDraw ? { status: "draw" } : { status: "ongoing" };
}

function render() {
  const cells = boardEl.querySelectorAll(".cell");
  cells.forEach((cell, i) => {
    cell.textContent = board[i] ?? "";
  });
}

function resetGame() {
  board = Array(9).fill(null);
  currentPlayer = "X";
  gameOver = false;
  statusEl.textContent = "Player X’s turn";
  render();
}

restartBtn.addEventListener("click", resetGame);

// init
createBoard();
render();
