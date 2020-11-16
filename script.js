const difficulty = {
    BEGINNER: {mines: 10, rows: 10, columns: 10},
    INTERMEDIATE: {mines: 40, rows: 15, columns: 15},
    EXPERT: {mines: 99, rows: 30, columns: 16},
    CUSTOM: {mines: 150, rows: 35, columns: 35}
}

class Cell {
    constructor() {
        this.isUncovered = false;
        this.isFlagged = false;
        this.isMine = false;
        this.value = 0;
        this.displayText = " ";
    }
}

let diff = difficulty.BEGINNER;
let remainingCells = diff.rows * diff.columns - diff.mines;
const minefield = [];
let fillStack = [];
let timer = 0;
let isGameOn = false;
let timerID;

initMinefield();
initMines();
createMinefieldHTML();

document.querySelector("select").onchange = restartGame;
document.querySelector("table").addEventListener("click", leftClick);
document.querySelector("table").addEventListener("contextmenu", rightClick);
document.getElementById("emojiRestart").addEventListener("click", restartGame);
document.getElementById("remainingCellsCounter").innerText = String(remainingCells);

function initMinefield() {
    for (let i = 0; i < diff.rows; i++) {
        minefield.push([]);
        for (let j = 0; j < diff.columns; j++) {
            minefield[i][j] = new Cell();
        }
    }
}

function initMines() {
    let remainingMines = diff.mines;
    let X, Y;

    while (remainingMines) {
        X = getRandomValue(diff.rows);
        Y = getRandomValue(diff.columns);
        if (!minefield[X][Y].isMine) {
            minefield[X][Y].value = '-1';
            minefield[X][Y].isMine = true;
            minefield[X][Y].displayText = '💣';
            incrementAdjacentCells(X, Y);
            remainingMines--;
        }
    }
}

function incrementAdjacentCells(X, Y) {
    for (let i = X - 1; i <= X + 1; i++) {
        for (let j = Y - 1; j <= Y + 1 ; j++) {
            if (isWithinBounds(i, j) && !minefield[i][j].isMine) {
                minefield[i][j].value++;
            }
        }
    }
}

function createMinefieldHTML() {
    let newElement;

    for (let i = 0; i < diff.rows; i++) {
        newElement = document.createElement("tr");
        newElement.classList.add(`row-${i}`);
        document.querySelector('table').appendChild(newElement);
        for (let j = 0; j < diff.columns; j++) {
            let cell = minefield[i][j];

            newElement = document.createElement("td");
            newElement.id = `cell-${i}-${j}`;
            document.querySelector(`.row-${i}`).appendChild(newElement);

            if (cell.value === 0) {
                cell.displayText = ' ';
            }

            if (cell.value > 0) {
                cell.displayText = cell.value;
            }
        }
    }
}

function uncoverSingleCell(X, Y) {
    let uncoveredNode = document.createTextNode(minefield[X][Y].displayText);

    document.getElementById(`cell-${X}-${Y}`).appendChild(uncoveredNode);
    document.getElementById(`cell-${X}-${Y}`).classList.add("uncovered");
    document.getElementById(`cell-${X}-${Y}`).classList.add(`cell-${minefield[X][Y].value}`);
    minefield[X][Y].isUncovered = true;
    updateRemainingCellsCounter();
}

function uncoverMultipleCells(X, Y) {
    fillStack.push([X, Y]);

    while (fillStack.length) {
        let [X, Y] = fillStack.pop();

        if (!isWithinBounds(X, Y) ||
            minefield[X][Y].isMine ||
            minefield[X][Y].isUncovered
        ) {
            continue;
        }

        if (isWithinBounds(X, Y) && minefield[X][Y].value > 0) {
            uncoverSingleCell(X, Y);
        }
        uncoverMultipleCells(X + 1, Y);
        uncoverMultipleCells(X - 1, Y);
        uncoverMultipleCells(X, Y + 1);
        uncoverMultipleCells(X, Y - 1);
    }
}

function updateRemainingCellsCounter() {
    remainingCells--;
    document.getElementById("remainingCellsCounter").innerText = String(remainingCells);
}

function leftClick(event) {
    let X, Y;

    if (event.target.tagName === "TD") {
        let coordinates = event.toElement.id.split("-");
        X = coordinates[1];
        Y = coordinates[2];
    } else {
        return;
    }

    let cell = minefield[X][Y];

    if (!cell.isUncovered && !cell.isFlagged) {
        if (cell.isMine) {
            uncoverSingleCell(X, Y);
            gameOver();
        } else {
            if (cell.value > 0 && remainingCells === 1) {
                uncoverSingleCell(X, Y);
                winGame();
            } else {
                startTimer();
                uncoverSingleCell(X, Y);
            }
        }
    }
}

function rightClick(event) {
    let X, Y;

    if (event.target.tagName === "TD") {
        let coordinates = event.toElement.id.split("-");
        X = coordinates[1];
        Y = coordinates[2];
        event.preventDefault();
    } else {
        return;
    }

    let cell = minefield[X][Y];
    if (!cell.isUncovered) {
        let element = document.getElementById(`cell-${X}-${Y}`);
        let flagCounter = document.getElementById("addedFlagsCounter");

        if (element.innerText === '🚩') {
            element.innerText = ' ';
            cell.isFlagged = false;
            flagCounter.innerText = String(Number(flagCounter.innerText) - 1);

        } else {
            element.innerText = '🚩';
            cell.isFlagged = true;
            flagCounter.innerText = String(Number(flagCounter.innerText) + 1);
        }
    }
}

function isWithinBounds(X, Y) {
    return (
        X < diff.rows &&
        Y < diff.columns &&
        X >= 0 && Y >= 0
    )
}

function getRandomValue(limit) {
    return Math.floor(Math.random() * limit);
}

function startTimer() {
    if (!isGameOn) {
        isGameOn = true;
        timerID = setInterval(() => {
            timer++;
            document.getElementById("timeCounter").innerText = String(timer);
        }, 1000);
    }
}

function gameOver() {
    clearInterval(timerID);
    preventClicking();
    console.log("GAME OVER!");
}

function winGame() {
    clearInterval(timerID);
    preventClicking();
    console.log("YOU WIN!");
}

function restartGame(event) {
    let target = event.target.outerHTML;

    if (target.includes("emoji")) {

    } else {
        
    }
}

function preventClicking() {
    document.querySelector("table").removeEventListener("click", leftClick);
    document.querySelector("table").removeEventListener("contextmenu", rightClick);
    //todo: remove hover
    //todo: change eventListener for rightClick
}
