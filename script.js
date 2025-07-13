document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gomoku-board');
    const ctx = canvas.getContext('2d');
    const messageEl = document.getElementById('message');
    const resetButton = document.getElementById('reset-button');

    // --- ゲーム設定 ---
    const BOARD_SIZE = 15; // 15x15の盤
    const CELL_SIZE = 40;  // 1マスのサイズ (px)
    const PADDING = 20;    // 盤の余白 (px)

    canvas.width = CELL_SIZE * (BOARD_SIZE - 1) + PADDING * 2;
    canvas.height = canvas.width;

    // --- プレイヤー定数 ---
    const PLAYER = {
        NONE: 0,
        BLACK: 1,
        WHITE: 2,
    };

    // --- ゲーム状態変数 ---
    let board = [];
    let currentPlayer;
    let gameOver;

    // --- 関数 ---


    /**
     * ゲームを初期化またはリセットします。
     */
    function init() {
        board = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(PLAYER.NONE));
        currentPlayer = PLAYER.BLACK;
        gameOver = false;
        
        messageEl.textContent = '黒の番です';
        drawBoard();
    }

    /**
     * 盤面の格子線を描画します。
     */
    function drawBoard() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#dcb35c'; // 盤の色
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        for (let i = 0; i < BOARD_SIZE; i++) {
            const pos = PADDING + i * CELL_SIZE;
            // 縦線
            ctx.beginPath();
            ctx.moveTo(pos, PADDING);
            ctx.lineTo(pos, PADDING + (BOARD_SIZE - 1) * CELL_SIZE);
            ctx.stroke();

            // 横線
            ctx.beginPath();
            ctx.moveTo(PADDING, pos);
            ctx.lineTo(PADDING + (BOARD_SIZE - 1) * CELL_SIZE, pos);
            ctx.stroke();
        }
        
        // 星点を描画
        const starPoints = [
            {x: 3, y: 3}, {x: 11, y: 3},
            {x: 3, y: 11}, {x: 11, y: 11},
            {x: 7, y: 7} // 天元
        ];
        ctx.fillStyle = '#000';
        starPoints.forEach(p => {
            ctx.beginPath();
            ctx.arc(PADDING + p.x * CELL_SIZE, PADDING + p.y * CELL_SIZE, 5, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    /**
     * 指定された位置に石を描画します。
     * @param {number} x - 盤面のX座標 (0-14)
     * @param {number} y - 盤面のY座標 (0-14)
     * @param {number} player - プレイヤー (PLAYER.BLACK or PLAYER.WHITE)
     */
    function drawStone(x, y, player) {
        ctx.beginPath();
        const stoneX = PADDING + x * CELL_SIZE;
        const stoneY = PADDING + y * CELL_SIZE;
        const radius = CELL_SIZE / 2 - 2;

        ctx.arc(stoneX, stoneY, radius, 0, 2 * Math.PI);
        
        ctx.fillStyle = (player === PLAYER.BLACK) ? 'black' : 'white';
        ctx.fill();
        ctx.strokeStyle = '#555';
        ctx.stroke();
    }

    /**
     * 勝利条件を満たしているかチェックします。
     * @param {number} x - 最後に石を置いたX座標
     * @param {number} y - 最後に石を置いたY座標
     * @returns {boolean} - 勝利した場合はtrue
     */
    function checkWin(x, y) {
        const player = board[y][x];
        const directions = [
            { dx: 1, dy: 0 },  // 横
            { dx: 0, dy: 1 },  // 縦
            { dx: 1, dy: 1 },  // 右下がり斜め
            { dx: 1, dy: -1 }  // 右上がり斜め
        ];

        for (const dir of directions) {
            let count = 1;
            // 正の方向
            for (let i = 1; i < 5; i++) {
                const nx = x + i * dir.dx;
                const ny = y + i * dir.dy;
                if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny][nx] === player) {
                    count++;
                } else {
                    break;
                }
            }
            // 負の方向
            for (let i = 1; i < 5; i++) {
                const nx = x - i * dir.dx;
                const ny = y - i * dir.dy;
                if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny][nx] === player) {
                    count++;
                } else {
                    break;
                }
            }

            if (count >= 5) return true;
        }
        return false;
    }

    /**
     * 盤面がすべて埋まっているか（引き分け）をチェックします。
     */
    function isBoardFull() {
        return board.every(row => row.every(cell => cell !== PLAYER.NONE));
    }

    // --- イベントリスナー ---

    canvas.addEventListener('click', (e) => {
        if (gameOver) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const x = Math.round((mouseX - PADDING) / CELL_SIZE);
        const y = Math.round((mouseY - PADDING) / CELL_SIZE);

        if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE || board[y][x] !== PLAYER.NONE) {
            return;
        }

        board[y][x] = currentPlayer;
        drawStone(x, y, currentPlayer);

        if (checkWin(x, y)) {
            gameOver = true;
            messageEl.textContent = `${currentPlayer === PLAYER.BLACK ? '黒' : '白'}の勝ちです！`;
        } else if (isBoardFull()) {
            gameOver = true;
            messageEl.textContent = '引き分けです。';
        } else {
            currentPlayer = (currentPlayer === PLAYER.BLACK) ? PLAYER.WHITE : PLAYER.BLACK;
            messageEl.textContent = `${currentPlayer === PLAYER.BLACK ? '黒' : '白'}の番です`;
        }
    });

    resetButton.addEventListener('click', init);

    // --- ゲーム開始 ---
    init();
});

    const ctx = canvas.getContext('2d');
    const messageEl = document.getElementById('message');
    const resetButton = document.getElementById('reset-button');
    const gameModeSelector = document.getElementById('game-mode-selector');


    // --- ゲーム設定 ---
    const BOARD_SIZE = 15; // 15x15の盤
        WHITE: 2,
    };

    const AI_PLAYER = PLAYER.WHITE;

    // --- ゲーム状態変数 ---
    let board = [];
    let currentPlayer;
    let gameOver;
    let gameMode = 'pvp'; // 'pvp' or 'pva'

    // --- 関数 ---

     */
    function init() {
        board = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(PLAYER.NONE));
        gameMode = document.querySelector('input[name="mode"]:checked').value;
        currentPlayer = PLAYER.BLACK;
        gameOver = false;
        
        drawBoard();
        updateMessage();
    }

    /**
     * 現在の状況に応じたメッセージを表示します。
     */
    function updateMessage() {
        if (gameOver) return;
        const playerColor = currentPlayer === PLAYER.BLACK ? '黒' : '白';
        
        if (gameMode === 'pva' && currentPlayer === AI_PLAYER) {
            messageEl.textContent = 'AI (白) の番です...';
        } else {
            messageEl.textContent = `${playerColor}の番です`;
        }
    }

    /**
        return board.every(row => row.every(cell => cell !== PLAYER.NONE));
    }

    /**
     * AIが次の一手を決定します。
     */
    function findBestMove() {
        // 1. AIが勝てる手を探す
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                if (board[y][x] === PLAYER.NONE) {
                    board[y][x] = AI_PLAYER;
                    if (checkWin(x, y)) {
                        board[y][x] = PLAYER.NONE; // 盤面を元に戻す
                        return { x, y };
                    }
                    board[y][x] = PLAYER.NONE; // 盤面を元に戻す
                }
            }
        }

        // 2. プレイヤーが勝つ手をブロックする
        const humanPlayer = PLAYER.BLACK;
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                if (board[y][x] === PLAYER.NONE) {
                    board[y][x] = humanPlayer;
                    if (checkWin(x, y)) {
                        board[y][x] = PLAYER.NONE; // 盤面を元に戻す
                        return { x, y };
                    }
                    board[y][x] = PLAYER.NONE; // 盤面を元に戻す
                }
            }
        }

        // 3. ヒューリスティック: 既存の石の周りで最もスコアの高い場所を探す
        let candidates = [];
        let maxScore = -1;

        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                if (board[y][x] !== PLAYER.NONE) continue;

                // このマスが、既存の石に隣接しているかチェック
                let isAdjacent = false;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny][nx] !== PLAYER.NONE) {
                            isAdjacent = true;
                            break;
                        }
                    }
                    if(isAdjacent) break;
                }
                if (!isAdjacent) continue; // どの石にも隣接していないマスは評価しない

                // 自分の石を4つに伸ばせるか、相手の3を止められるかなどを評価
                // ここでは簡単なスコアリングを行う
                let score = 0;
                // 8方向の隣接マスをチェック
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nx = x + dx;
                        const ny = y + dy;

                        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny][nx] !== PLAYER.NONE) {
                            // 自分の石の隣は高く評価、相手の石の隣も評価
                            score += (board[ny][nx] === AI_PLAYER) ? 2 : 1;
                        }
                    }
                }
                
                if (score > maxScore) {
                    maxScore = score;
                    candidates = [{ x, y }];
                } else if (score === maxScore) {
                    candidates.push({ x, y });
                }
            }
        }

        // 候補の中からランダムに選ぶことで、AIの挙動を多様化
        if (candidates.length > 0) {
            return candidates[Math.floor(Math.random() * candidates.length)];
        }

        // 4. フォールバック: 盤面が空なら中央、そうでなければランダムな空きマス
        if (board[7][7] === PLAYER.NONE) return { x: 7, y: 7 };
        
        const emptySpots = [];
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                if (board[y][x] === PLAYER.NONE) emptySpots.push({ x, y });
            }
        }
        if (emptySpots.length > 0) {
            return emptySpots[Math.floor(Math.random() * emptySpots.length)];
        }
        return null; // 打てる場所がない
    }

    /**
     * AIの手番を実行します。
     */
    function aiMove() {
        if (gameOver) return;
        const move = findBestMove();
        if (move) {
            board[move.y][move.x] = AI_PLAYER;
            drawStone(move.x, move.y, AI_PLAYER);

            handleMoveResult(move.x, move.y);
        }
    }

    // --- イベントリスナー ---

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // AIのターン中はプレイヤーのクリックを無視
        if (gameMode === 'pva' && currentPlayer === AI_PLAYER) return;

        const x = Math.round((mouseX - PADDING) / CELL_SIZE);
        const y = Math.round((mouseY - PADDING) / CELL_SIZE);

        board[y][x] = currentPlayer;
        drawStone(x, y, currentPlayer);
        handleMoveResult(x, y);
    });

    function handleMoveResult(x, y) {
        const winner = currentPlayer;
        if (checkWin(x, y)) {
            gameOver = true;
            const winnerColor = winner === PLAYER.BLACK ? '黒' : '白';
            const winnerName = (gameMode === 'pva' && winner === AI_PLAYER) ? 'AI (白)' : winnerColor;
            messageEl.textContent = `${winnerName}の勝ちです！`;
        } else if (isBoardFull()) {
            gameOver = true;
            messageEl.textContent = '引き分けです。';
        } else {
            // プレイヤーを交代
            currentPlayer = (currentPlayer === PLAYER.BLACK) ? PLAYER.WHITE : PLAYER.BLACK;
            updateMessage();

            // AIのターンならAIを動かす
            if (gameMode === 'pva' && currentPlayer === AI_PLAYER && !gameOver) {
                // AIが「考えている」ように見せるため、少し遅延させる
                setTimeout(aiMove, 500);
            }
        }
    }

    resetButton.addEventListener('click', init);
    gameModeSelector.addEventListener('change', init);

    // --- ゲーム開始 ---
    init();


