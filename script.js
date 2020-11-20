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
        this.displayText = "";
    }
}

let diff = difficulty.BEGINNER;
let remainingCells = diff.rows * diff.columns - diff.mines;
const minefield = [];
let timer = 0;
let isGameOn = false;
let timerID;

initGame();

function initGame() {
    initElements();
    initMinefield();
    initMines();
    createMinefieldHTML();
}

function wipeMines() {
    for (let row = 0; row < diff.columns; row++) {
        for (let column = 0; column < diff.rows; column++) {
            minefield[row][column] = new Cell();
        }
    }
}

function initElements() {
    document.querySelector("select").onchange = restartGame;
    document.querySelector("table").addEventListener("click", leftClick);
    document.querySelector("table").addEventListener("contextmenu", rightClick);
    document.getElementById("emojiRestart").addEventListener("click", restartGame);
    document.getElementById("remainingCellsCounter").innerText = String(remainingCells);
}

function initMinefield() {
    for (let row = 0; row < diff.rows; row++) {
        minefield.push([]);
        for (let column = 0; column < diff.columns; column++) {
            minefield[row][column] = new Cell();
        }
    }
}

function initMines() {
    let remainingMines = diff.mines;
    let row, column;

    while (remainingMines) {
        row = getRandomValue(diff.rows);
        column = getRandomValue(diff.columns);
        if (!minefield[row][column].isMine) {
            minefield[row][column].value = '-1';
            minefield[row][column].isMine = true;
            minefield[row][column].displayText = '💣';
            incrementAdjacentCells(row, column);
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
    let cell = document.getElementById(`cell-${X}-${Y}`);

    console.log("Uncovering cell " + X + Y);

    cell.appendChild(uncoveredNode);
    cell.classList.add("uncovered");
    cell.classList.add(`cell-${minefield[X][Y].value}`);
    minefield[X][Y].isUncovered = true;
    updateRemainingCellsCounter();

    if (minefield[X][Y].value === 0) {
        uncoverAdjacentCells(X, Y);
    }
}

function uncoverAdjacentCells(X, Y) {
    let minX = Number(X) - 1;
    let maxX = Number(X) + 1;
    let minY = Number(Y) - 1;
    let maxY = Number(Y) + 1;

    for (let i = minX; i <= maxX; i++) {
        for (let j = minY; j <= maxY; j++) {
            if (isWithinBounds(i, j) && !minefield[i][j].isUncovered) {
                uncoverSingleCell(i, j);
            }
        }
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
        console.log("Resetting via button");
    } else {
        console.log("Resetting via select");
        let selectValue  = document.querySelector('select').value.toUpperCase();
        diff = difficulty[selectValue];
    }
    document.querySelector(".mineTable").innerHTML = "";

    clearInterval(timerID);

    timer = 0;
    isGameOn = false;
    document.getElementById("timeCounter").innerText = '0';
    remainingCells = diff.rows * diff.columns - diff.mines;
    document.getElementById("remainingCellsCounter").innerText = String(remainingCells);
    document.getElementById("addedFlagsCounter").innerText = '0';
    wipeMines();
    initElements();
    initGame();
}

function preventClicking() {
    document.querySelector("table").removeEventListener("click", leftClick);
    document.querySelector("table").removeEventListener("contextmenu", rightClick);
    //todo: remove hover
    //todo: change eventListener for rightClick
    //todo: fail w konsoli po zmianie na custom po f5
    //todo: gray background with results after win
    //todo: boom emojis
    //todo: emoji change face on click
    //todo: fix firefox toElement (target)
    //todo: rewrite scss
    //todo: rewrite with jQuery
    //todo: rewrite with angular(js)
    //todo: debug mode
}
