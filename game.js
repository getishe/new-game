// Game Configuration
const CONFIG = {
    cell: {
        size: 10,
        radius: 2,
        colors: {
            level1: '#9be9a8',
            level2: '#40c463',
            level3: '#30a14e',
            level4: '#216e39'
        }
    },
    updateInterval: 500,
    initialLifeProbability: 0.3
};

class Cell {
    constructor(alive = false) {
        this.alive = alive;
        this.neighbors = 0;
    }
}

class GameOfLife {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.grid = [];
        this.isPlaying = false;
        this.lastUpdate = 0;
    }

    initGrid() {
        const cols = Math.floor(this.canvas.width / CONFIG.cell.size);
        const rows = Math.floor(this.canvas.height / CONFIG.cell.size);
        this.grid = Array(rows).fill().map(() => 
            Array(cols).fill().map(() => 
                new Cell(Math.random() > CONFIG.initialLifeProbability)
            )
        );
        this.updateNeighborCounts();
    }

    getCellColor(neighbors) {
        const colors = CONFIG.cell.colors;
        if (neighbors <= 1) return colors.level1;
        if (neighbors === 2) return colors.level2;
        if (neighbors === 3) return colors.level3;
        return colors.level4;
    }

    updateNeighborCounts() {
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                if (this.grid[y][x].alive) {
                    this.grid[y][x].neighbors = this.countNeighbors(x, y);
                }
            }
        }
    }

    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.grid.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell.alive) {
                    this.drawCell(x, y, cell.neighbors);
                }
            });
        });
    }

    drawCell(x, y, neighbors) {
        this.ctx.fillStyle = this.getCellColor(neighbors);
        this.ctx.beginPath();
        this.ctx.roundRect(
            x * CONFIG.cell.size, 
            y * CONFIG.cell.size,
            CONFIG.cell.size - 1, 
            CONFIG.cell.size - 1, 
            CONFIG.cell.radius
        );
        this.ctx.fill();
    }

    countNeighbors(x, y) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const row = (y + i + this.grid.length) % this.grid.length;
                const col = (x + j + this.grid[0].length) % this.grid[0].length;
                if (this.grid[row][col].alive) count++;
            }
        }
        return count;
    }

    updateGrid() {
        this.grid = this.grid.map((row, y) =>
            row.map((cell, x) => {
                const neighbors = this.countNeighbors(x, y);
                return new Cell(
                    neighbors === 3 || (cell.alive && neighbors === 2)
                );
            })
        );
    }

    toggleCell(x, y) {
        if (this.grid[y]?.[x]) {
            this.grid[y][x].alive = !this.grid[y][x].alive;
            this.updateNeighborCounts();
            this.drawGrid();
        }
    }
}

// Game Controller
class GameController {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.game = new GameOfLife(this.canvas, this.ctx);
        this.setupEventListeners();
    }

    setupEventListeners() {
        const playButton = document.getElementById('playButton');
        const resetButton = document.getElementById('resetButton');

        this.canvas.addEventListener('click', (event) => {
            const x = Math.floor(event.offsetX / CONFIG.cell.size);
            const y = Math.floor(event.offsetY / CONFIG.cell.size);
            this.game.toggleCell(x, y);
        });

        playButton.addEventListener('click', () => this.togglePlay());
        resetButton.addEventListener('click', () => this.reset());
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    togglePlay() {
        this.game.isPlaying = !this.game.isPlaying;
        document.getElementById('playButton').textContent = 
            this.game.isPlaying ? 'Pause' : 'Play';
        if (this.game.isPlaying) this.gameLoop();
    }

    reset() {
        this.game.isPlaying = false;
        document.getElementById('playButton').textContent = 'Play';
        this.game.initGrid();
        this.game.drawGrid();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.game.initGrid();
        this.game.drawGrid();
    }

    gameLoop(timestamp) {
        if (!this.game.isPlaying) return;
        if (timestamp - this.game.lastUpdate > CONFIG.updateInterval) {
            this.game.updateGrid();
            this.game.updateNeighborCounts();
            this.game.drawGrid();
            this.game.lastUpdate = timestamp;
        }
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }
}

// Initialize game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    const controller = new GameController();
    controller.resizeCanvas();
    controller.game.drawGrid();
});
