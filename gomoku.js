const canvas = document.getElementById('gomoku-board');
const context = canvas.getContext('2d');
const message = document.getElementById('message');
const modeRadios = document.querySelectorAll('input[name="mode"]');

const BOARD_SIZE = 15;
const CELL_SIZE = 40;
const PADDING = 20;
canvas.width = BOARD_SIZE * CELL_SIZE + PADDING * 2;
canvas.height = BOARD_SIZE * CELL_SIZE + PADDING * 2;

const resetButton = document.getElementById('reset-button');

let board = [];
let currentPlayer = 'black'; // 'black' is Player 1 (Magenta), 'white' is Player 2 (Cyan)
let gameOver = false;
let gameMode = 'pva'; // Default to Player vs AI

function initBoard() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
}

function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#555';
    context.lineWidth = 1;

    for (let i = 0; i < BOARD_SIZE; i++) {
        context.beginPath();
        context.moveTo(PADDING + i * CELL_SIZE, PADDING);
        context.lineTo(PADDING + i * CELL_SIZE, canvas.height - PADDING);
        context.stroke();
        context.beginPath();
        context.moveTo(PADDING, PADDING + i * CELL_SIZE);
        context.lineTo(canvas.width - PADDING, PADDING + i * CELL_SIZE);
        context.stroke();
    }
}

function drawStone(x, y, player) {
    const stoneColor = player === 'black' ? '#FF00FF' : '#00BCD4';
    const glowColor = player === 'black' ? 'rgba(255, 0, 255, 0.7)' : 'rgba(0, 188, 212, 0.7)';

    context.shadowBlur = 15;
    context.shadowColor = glowColor;

    context.beginPath();
    context.arc(
        PADDING + x * CELL_SIZE,
        PADDING + y * CELL_SIZE,
        CELL_SIZE / 2 - 4,
        0,
        2 * Math.PI
    );

    const gradient = context.createRadialGradient(
        PADDING + x * CELL_SIZE - 3, PADDING + y * CELL_SIZE - 3, 2,
        PADDING + x * CELL_SIZE, PADDING + y * CELL_SIZE, CELL_SIZE / 2
    );

    if (player === 'black') { // Player 1 - Magenta
        gradient.addColorStop(0, '#ff99ff');
        gradient.addColorStop(1, '#e600e6');
    } else { // Player 2 / AI - Cyan
        gradient.addColorStop(0, '#99ffff');
        gradient.addColorStop(1, '#00cccc');
    }
    context.fillStyle = gradient;
    context.fill();

    context.shadowBlur = 0;
    context.shadowColor = 'transparent';
}

function drawStones() {
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x]) {
                drawStone(x, y, board[y][x]);
            }
        }
    }
}

function getPlayerDisplayName(player) {
    if (gameMode === 'pva') {
        return player === 'black' ? 'あなた' : 'AI';
    } else {
        return player === 'black' ? 'プレイヤー1' : 'プレイヤー2';
    }
}

function checkWin(x, y, player) {
    // Check horizontal
    let count = 1;
    for (let i = 1; i < 5; i++) { if (x + i < BOARD_SIZE && board[y][x + i] === player) count++; else break; }
    for (let i = 1; i < 5; i++) { if (x - i >= 0 && board[y][x - i] === player) count++; else break; }
    if (count >= 5) return true;

    // Check vertical
    count = 1;
    for (let i = 1; i < 5; i++) { if (y + i < BOARD_SIZE && board[y + i][x] === player) count++; else break; }
    for (let i = 1; i < 5; i++) { if (y - i >= 0 && board[y - i][x] === player) count++; else break; }
    if (count >= 5) return true;

    // Check diagonal (top-left to bottom-right)
    count = 1;
    for (let i = 1; i < 5; i++) { if (x + i < BOARD_SIZE && y + i < BOARD_SIZE && board[y + i][x + i] === player) count++; else break; }
    for (let i = 1; i < 5; i++) { if (x - i >= 0 && y - i >= 0 && board[y - i][x - i] === player) count++; else break; }
    if (count >= 5) return true;

    // Check diagonal (top-right to bottom-left)
    count = 1;
    for (let i = 1; i < 5; i++) { if (x + i < BOARD_SIZE && y - i >= 0 && board[y - i][x + i] === player) count++; else break; }
    for (let i = 1; i < 5; i++) { if (x - i >= 0 && y + i < BOARD_SIZE && board[y + i][x - i] === player) count++; else break; }
    if (count >= 5) return true;

    return false;
}

function checkDraw() {
    return board.every(row => row.every(cell => cell !== null));
}

function aiMove() {
    if (gameOver) return;

    message.textContent = 'AIが考えています...';

    setTimeout(() => {
        const bestMove = findBestMove();
        if (bestMove) {
            board[bestMove.y][bestMove.x] = 'white';
            drawStones();
            if (checkWin(bestMove.x, bestMove.y, 'white')) {
                message.textContent = `${getPlayerDisplayName('white')}の勝ちです！`;
                gameOver = true;
            } else if (checkDraw()) {
                message.textContent = '引き分けです。';
                gameOver = true;
            } else {
                currentPlayer = 'black';
                message.textContent = `${getPlayerDisplayName(currentPlayer)}の番です`;
            }
        }
    }, 100);
}

function findBestMove() {
    if (board.every(row => row.every(cell => cell === null))) {
        return { x: Math.floor(BOARD_SIZE / 2), y: Math.floor(BOARD_SIZE / 2) };
    }

    let bestScore = -Infinity;
    let move = null;
    const depth = 2;

    const candidates = getCandidateMoves();

    for (const candidate of candidates) {
        const { x, y } = candidate;
        board[y][x] = 'white';
        let score = minimax(board, depth, false, -Infinity, Infinity);
        board[y][x] = null;

        if (score > bestScore) {
            bestScore = score;
            move = { x, y };
        }
    }
    return move;
}

function getCandidateMoves() {
    const candidates = new Set();
    const radius = 2;

    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x] !== null) {
                for (let i = -radius; i <= radius; i++) {
                    for (let j = -radius; j <= radius; j++) {
                        if (i === 0 && j === 0) continue;
                        const newY = y + i;
                        const newX = x + j;

                        if (newY >= 0 && newY < BOARD_SIZE && newX >= 0 && newX < BOARD_SIZE && board[newY][newX] === null) {
                            candidates.add(`${newX},${newY}`);
                        }
                    }
                }
            }
        }
    }
    if (candidates.size === 0) {
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                if (board[y][x] === null) {
                    candidates.add(`${x},${y}`);
                }
            }
        }
    }

    return Array.from(candidates).map(item => {
        const [x, y] = item.split(',').map(Number);
        return { x, y };
    });
}

function minimax(currentBoard, depth, isMaximizing, alpha, beta) {
    let score = evaluateBoard(currentBoard);

    if (Math.abs(score) > 100000 || depth === 0 || checkDraw()) {
        return score;
    }

    if (isMaximizing) {
        let best = -Infinity;
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                if (currentBoard[y][x] === null) {
                    currentBoard[y][x] = 'white';
                    best = Math.max(best, minimax(currentBoard, depth - 1, false, alpha, beta));
                    currentBoard[y][x] = null;
                    alpha = Math.max(alpha, best);
                    if (beta <= alpha) break;
                }
            }
            if (beta <= alpha) break;
        }
        return best;
    } else {
        let best = Infinity;
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                if (currentBoard[y][x] === null) {
                    currentBoard[y][x] = 'black';
                    best = Math.min(best, minimax(currentBoard, depth - 1, true, alpha, beta));
                    currentBoard[y][x] = null;
                    beta = Math.min(beta, best);
                    if (beta <= alpha) break;
                }
            }
            if (beta <= alpha) break;
        }
        return best;
    }
}

function evaluateBoard(currentBoard) {
    let score = 0;
    const lines = [];

    for (let y = 0; y < BOARD_SIZE; y++) {
        lines.push(currentBoard[y]);
    }

    for (let x = 0; x < BOARD_SIZE; x++) {
        const col = [];
        for (let y = 0; y < BOARD_SIZE; y++) {
            col.push(currentBoard[y][x]);
        }
        lines.push(col);
    }

    for (let k = 0; k <= 2 * (BOARD_SIZE - 1); k++) {
        const diag = [];
        for (let y = 0; y < BOARD_SIZE; y++) {
            let x = k - y;
            if (x >= 0 && x < BOARD_SIZE) {
                diag.push(currentBoard[y][x]);
            }
        }
        if (diag.length >= 5) lines.push(diag);
    }

    for (let k = 1 - BOARD_SIZE; k < BOARD_SIZE; k++) {
        const diag = [];
        for (let y = 0; y < BOARD_SIZE; y++) {
            let x = k + y;
            if (x >= 0 && x < BOARD_SIZE) {
                diag.push(currentBoard[y][x]);
            }
        }
        if (diag.length >= 5) lines.push(diag);
    }

    for(const line of lines) {
        score += evaluateLine(line);
    }

    return score;
}

function evaluateLine(line) {
    let score = 0;
    for (let i = 0; i <= line.length - 5; i++) {
        const subLine = line.slice(i, i + 5);
        score += scorePattern(subLine, 'white') - scorePattern(subLine, 'black') * 1.1;
    }
    return score;
}

function scorePattern(pattern, player) {
    const opponent = player === 'white' ? 'black' : 'white';
    let playerCount = pattern.filter(s => s === player).length;
    let emptyCount = pattern.filter(s => s === null).length;
    let opponentCount = pattern.filter(s => s === opponent).length;

    if (opponentCount > 0 && playerCount > 0) return 0;
    if (playerCount === 0) return 0;
    if (opponentCount > 0) return 0;

    if (playerCount === 5) return 1000000;
    if (playerCount === 4 && emptyCount === 1) return 10000;
    if (playerCount === 3 && emptyCount === 2) return 1000;
    if (playerCount === 2 && emptyCount === 3) return 100;
    if (playerCount === 1 && emptyCount === 4) return 10;

    return 0;
}

canvas.addEventListener('click', (event) => {
    if (gameOver) return;
    if (gameMode === 'pva' && currentPlayer === 'white') return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left - PADDING) / CELL_SIZE);
    const y = Math.round((event.clientY - rect.top - PADDING) / CELL_SIZE);

    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return;
    if (board[y][x] !== null) return;

    board[y][x] = currentPlayer;
    drawStones();

    if (checkWin(x, y, currentPlayer)) {
        message.textContent = `${getPlayerDisplayName(currentPlayer)}の勝ちです！`;
        gameOver = true;
        return;
    }

    if (checkDraw()) {
        message.textContent = '引き分けです。';
        gameOver = true;
        return;
    }

    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    message.textContent = `${getPlayerDisplayName(currentPlayer)}の番です`;

    if (gameMode === 'pva' && currentPlayer === 'white') {
        setTimeout(aiMove, 500);
    }
});

function resetGame() {
    initBoard();
    drawBoard();
    drawStones();
    currentPlayer = 'black';
    message.textContent = `${getPlayerDisplayName(currentPlayer)}の番です`;
    gameOver = false;
}

modeRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
        gameMode = event.target.value;
        resetGame();
    });
});

resetButton.addEventListener('click', resetGame);

resetGame();