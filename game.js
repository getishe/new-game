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

function togglePlay() {
    isPlaying = !isPlaying;
    playButton.textContent = isPlaying ? 'Pause' : 'Play';
    if (isPlaying) gameLoop();
}

function reset() {
    isPlaying = false;
    playButton.textContent = 'Play';
    initGrid();
    drawGrid();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initGrid();
    drawGrid();
}

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

function updateNeighborCounts() {
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x].alive) {
                grid[y][x].neighbors = countNeighbors(x, y);
            }
        }
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x].alive) {
                ctx.fillStyle = getCellColor(grid[y][x].neighbors);
                ctx.beginPath();
                ctx.roundRect(x * cellSize, y * cellSize, 
                    cellSize - 1, cellSize - 1, cellRadius);
                ctx.fill();
            }
        }
    }
}

function countNeighbors(x, y) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const row = (y + i + grid.length) % grid.length;
            const col = (x + j + grid[0].length) % grid[0].length;
            if (grid[row][col].alive) count++;
        }
    }
    return count;
}

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

// Initialize after DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    drawGrid();
});
