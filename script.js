const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const difficultyButtons = document.querySelectorAll('.diff-btn');

let gameState = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X"; 
let isGameActive = true;
let difficulty = "easy"; // Початкова складність

// Виграшні лінії для розумного бота
const winLines = [
    "0,1,2", "3,4,5", "6,7,8",
    "0,3,6", "1,4,7", "2,5,8",
    "0,4,8", "2,4,6"
];

// Обробка кнопок складності
difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (gameState.includes("X") || gameState.includes("O")) {
            alert('Неможливо змінити складність під час гри! Натисни "Почати заново".');
            return;
        }
        difficultyButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        difficulty = btn.getAttribute('data-diff');
    });
});

// Клік гравця
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        const index = parseInt(cell.getAttribute('data-index'), 10);

        if (gameState[index] !== "" || !isGameActive || currentPlayer !== "X") {
            return; 
        }

        makeMove(index, "X");

        if (checkWinning(gameState, "X")) {
            statusText.textContent = `Ти перемогла!`;
            isGameActive = false;
            return;
        }

        if (!gameState.includes("")) {
            statusText.textContent = "Нічия!";
            isGameActive = false;
            return;
        }

        currentPlayer = "O";
        statusText.textContent = `Хід бота...`;
        setTimeout(botTurn, 400);
    });
});

function botTurn() {
    if (!isGameActive) return;

    let bestMove;

    if (difficulty === "easy") {
        bestMove = getRandomMove();
    } else if (difficulty === "medium") {
        // Середня: 70% шансу зробити розумний хід, інакше рандом
        if (Math.random() < 0.7) {
            bestMove = getSmartMove();
        } else {
            bestMove = getRandomMove();
        }
    } else if (difficulty === "hard") {
        // Неможлива: алгоритм мінімакс
        bestMove = getBestMinimaxMove();
    }

    makeMove(bestMove, "O");

    if (checkWinning(gameState, "O")) {
        statusText.textContent = `Бот переміг! `;
        isGameActive = false;
        return;
    }

    if (!gameState.includes("")) {
        statusText.textContent = "Нічия!";
        isGameActive = false;
        return;
    }

    currentPlayer = "X";
    statusText.textContent = `Зараз твій хід (X)`;
}

function makeMove(index, player) {
    gameState[index] = player;
    const cell = document.querySelector(`.cell[data-index='${index}']`);
    cell.textContent = player;
    cell.classList.add(player);
}

// 🟢 ЛЕГКИЙ ХІД: Чистий рандом
function getRandomMove() {
    const emptyCells = [];
    gameState.forEach((val, i) => { if (val === "") emptyCells.push(i); });
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// 🟡 СЕРЕДНІЙ ХІД: Блокує гравця або виграє сам, якщо бачить 2 знаки в ряд
function getSmartMove() {
    // 1. Чи може бот виграти прямо зараз?
    for (let i = 0; i < winLines.length; i++) {
        const line = winLines[i].split(",").map(Number);
        const vals = line.map(idx => gameState[idx]);
        if (vals.filter(v => v === "O").length === 2 && vals.includes("")) {
            return line[vals.indexOf("")];
        }
    }
    // 2. Чи треба заблокувати гравця?
    for (let i = 0; i < winLines.length; i++) {
        const line = winLines[i].split(",").map(Number);
        const vals = line.map(idx => gameState[idx]);
        if (vals.filter(v => v === "X").length === 2 && vals.includes("")) {
            return line[vals.indexOf("")];
        }
    }
    return getRandomMove();
}

// 🔴 НЕМОЖЛИВИЙ ХІД (Minimax)
function getBestMinimaxMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
        if (gameState[i] === "") {
            gameState[i] = "O";
            let score = minimax(gameState, 0, false);
            gameState[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(state, depth, isMaximizing) {
    if (checkWinning(state, "O")) return 10 - depth;
    if (checkWinning(state, "X")) return depth - 10;
    if (!state.includes("")) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (state[i] === "") {
                state[i] = "O";
                let score = minimax(state, depth + 1, false);
                state[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (state[i] === "") {
                state[i] = "X";
                let score = minimax(state, depth + 1, true);
                state[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinning(state, player) {
    for (let i = 0; i < winLines.length; i++) {
        const [a, b, c] = winLines[i].split(",").map(Number);
        if (state[a] === player && state[b] === player && state[c] === player) {
            return true;
        }
    }
    return false;
}

// Почати заново
restartBtn.addEventListener('click', () => {
    gameState = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    isGameActive = true;
    statusText.textContent = `Зараз твій хід (X)`;
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove('X', 'O');
    });
});
