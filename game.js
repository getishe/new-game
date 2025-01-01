const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playButton = document.getElementById('playButton');
const resetButton = document.getElementById('resetButton');
let grid = [];
let isPlaying = false;
let lastUpdate = 0;
const cellSize = 10;
const cellRadius = 2;
const COLORS = {
    1: '#9be9a8',
    2: '#40c463',
    3: '#30a14e',
    4: '#216e39'
};

function getCellColor(neighbors) {
    if (neighbors <= 1) return COLORS[1];
    if (neighbors === 2) return COLORS[2];
    if (neighbors === 3) return COLORS[3];
    return COLORS[4];
}

// ...existing code for togglePlay, reset, resizeCanvas, initGrid...

function initGrid() {
    const cols = Math.floor(canvas.width / cellSize);
    const rows = Math.floor(canvas.height / cellSize);
    grid = Array(rows).fill().map(() => 
        Array(cols).fill().map(() => ({
            alive: Math.random() > 0.7,
            neighbors: 0
        }))
    );
    updateNeighborCounts();
}

// ...existing code for updateNeighborCounts, drawGrid, countNeighbors...

function updateGrid() {
    const newGrid = grid.map((row, y) =>
        row.map((cell, x) => {
            const neighbors = countNeighbors(x, y);
            return {
                alive: neighbors === 3 || (cell.alive && neighbors === 2),
                neighbors: 0
            };
        })
    );
    grid = newGrid;
}

function gameLoop(timestamp) {
    if (!isPlaying) return;
    if (timestamp - lastUpdate > 500) {
        updateGrid();
        updateNeighborCounts();
        drawGrid();
        lastUpdate = timestamp;
    }
    requestAnimationFrame(gameLoop);
}

// Event Listeners
canvas.addEventListener('click', (event) => {
    const x = Math.floor(event.offsetX / cellSize);
    const y = Math.floor(event.offsetY / cellSize);
    if (grid[y] && grid[y][x]) {
        grid[y][x].alive = !grid[y][x].alive;
        updateNeighborCounts();
        drawGrid();
    }
});

playButton.addEventListener('click', togglePlay);
resetButton.addEventListener('click', reset);
window.addEventListener('resize', resizeCanvas);

// Initialize
resizeCanvas();
drawGrid();
