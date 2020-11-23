//TODO:
//remove hover
//change eventListener for rightClick
//gray background with results after win
//boom emojis
//fix firefox toElement (target)
//rewrite scss
//rewrite with jQuery
//rewrite with angular(js)
//debug mode
//refactor elements to variables
//update html
//custom mode
//add button styling to emoji
//update remainingCells to remainingMines and decrement it via flags
//WINGAME zle sie liczy i nie wygrywa przy minach === 0

const DIFFICULTY = {
    beginner: {mines: 10, rows: 10, columns: 10},
    intermediate: {mines: 40, rows: 15, columns: 15},
    expert: {mines: 99, rows: 30, columns: 16},
    custom: {}
}

class Cell {
    isUncovered = false;
    isFlagged = false;
    isMine = false;
    value = 0;
    displayText = "";
}


const MINEFIELD = [];
let selectedDifficulty = DIFFICULTY.beginner;
let remainingMines = selectedDifficulty.mines;
let remainingUncoveredCells = selectedDifficulty.columns * selectedDifficulty.rows - selectedDifficulty.mines;
let isGameOn = false;
let timer = 0;
let timerIntervalID;

const MINEFIELD_TABLE = document.querySelector(".mineTable");
const DIFFICULTY_SELECTOR = document.querySelector("select");
const RESTART_BUTTON = document.getElementById("emojiRestart");
const TIME_COUNTER = document.getElementById("timeCounter");
const REMAINING_MINES_COUNTER = document.getElementById("remainingMinesCounter");

initGame();

function initGame() {
    switchEmojiToCool();
    initElements();
    initMinefield();
    initMines();
    createMinefieldHTML();
}

function initElements() {
    RESTART_BUTTON.addEventListener("click", restartGame);
    MINEFIELD_TABLE.addEventListener("click", leftClick);
    MINEFIELD_TABLE.addEventListener("contextmenu", rightClick);
    MINEFIELD_TABLE.addEventListener("mousedown", switchEmojiToScared);
    DIFFICULTY_SELECTOR.onchange = restartGame;
    document.querySelector("body").addEventListener("mouseup", switchEmojiToCool);
    REMAINING_MINES_COUNTER.innerText = String(remainingMines);
}

function initMinefield() {
    for (let i = 0; i < selectedDifficulty.rows; i++) {
        MINEFIELD.push([]);
        for (let j = 0; j < selectedDifficulty.columns; j++) {
            MINEFIELD[i][j] = new Cell();
        }
    }
}

function wipeMines() {
    for (let i = 0; i < selectedDifficulty.columns; i++) {
        for (let j = 0; j < selectedDifficulty.rows; j++) {
            MINEFIELD[i][j] = new Cell();
        }
    }
}

function initMines() {
    let minesToDistribute = selectedDifficulty.mines;
    let row, column;

    while (minesToDistribute) {
        row = getRandomValue(selectedDifficulty.rows);
        column = getRandomValue(selectedDifficulty.columns);
        if (!MINEFIELD[row][column].isMine) {
            MINEFIELD[row][column].value = '-1';
            MINEFIELD[row][column].isMine = true;
            MINEFIELD[row][column].displayText = '💣';
            incrementAdjacentCells(row, column);
            minesToDistribute--;
        }
    }
}

function incrementAdjacentCells(row, column) {
    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = column - 1; j <= column + 1 ; j++) {
            if (isWithinBounds(i, j) && !MINEFIELD[i][j].isMine) {
                MINEFIELD[i][j].value++;
            }
        }
    }
}

function createMinefieldHTML() {
    let newElement;

    for (let i = 0; i < selectedDifficulty.rows; i++) {
        newElement = document.createElement("tr");
        newElement.classList.add(`row-${i}`);
        MINEFIELD_TABLE.appendChild(newElement);
        for (let j = 0; j < selectedDifficulty.columns; j++) {
            let cell = MINEFIELD[i][j];

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

function uncoverSingleCell(row, column) {
    let uncoveredNode = document.createTextNode(MINEFIELD[row][column].displayText);
    let cell = document.getElementById(`cell-${row}-${column}`);

    cell.appendChild(uncoveredNode);
    cell.classList.add("uncovered");
    cell.classList.add(`cell-${MINEFIELD[row][column].value}`);
    MINEFIELD[row][column].isUncovered = true;
    remainingUncoveredCells--;

    if (MINEFIELD[row][column].value === 0) {
        uncoverAdjacentCells(row, column);
    }
}

function uncoverAdjacentCells(row, column) {
    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = column - 1; j <= column + 1; j++) {
            if (isWithinBounds(i, j) && !MINEFIELD[i][j].isUncovered) {
                uncoverSingleCell(i, j);
            }
        }
    }
}

function leftClick(event) {
    let row, column;

    if (event.target.tagName === "TD") {
        let coordinates = event.toElement.id.split("-");
        row = Number(coordinates[1]);
        column = Number(coordinates[2]);
    } else {
        return;
    }

    let cell = MINEFIELD[row][column];

    if (!cell.isUncovered && !cell.isFlagged) {
        if (cell.isMine) {
            gameOver();
        } else {
            if (cell.value > 0 && remainingUncoveredCells === 1) {
                winGame();
            } else {
                startTimer();
            }
        }
        uncoverSingleCell(row, column);
    }
}

function rightClick(event) {
    let row, column;

    if (event.target.tagName === "TD") {
        let coordinates = event.toElement.id.split("-");
        row = coordinates[1];
        column = coordinates[2];
        event.preventDefault();
    } else {
        return;
    }

    let cell = MINEFIELD[row][column];
    if (!cell.isUncovered) {
        let element = document.getElementById(`cell-${row}-${column}`);

        if (element.innerText === '🚩') {
            element.innerText = ' ';
            cell.isFlagged = false;
            REMAINING_MINES_COUNTER.innerText = String(Number(REMAINING_MINES_COUNTER.innerText) + 1);
        } else {
            element.innerText = '🚩';
            cell.isFlagged = true;
            REMAINING_MINES_COUNTER.innerText = String(REMAINING_MINES_COUNTER.innerText - 1);
        }
    }
}

function startTimer() {
    if (!isGameOn) {
        isGameOn = true;
        timerIntervalID = setInterval(() => {
            timer++;
            TIME_COUNTER.innerText = String(timer);
        }, 1000);
    }
}

function gameOver() {
    clearInterval(timerIntervalID);
    preventClicking();
    console.log("GAME OVER!");
    RESTART_BUTTON.innerText = '☠️';
}

function winGame() {
    clearInterval(timerIntervalID);
    preventClicking();
    console.log("YOU WIN!");
}

function restartGame(event) {
    let target = event.target.outerHTML;

    if (target.includes("emoji")) {
        console.log("Resetting via button");
    } else {
        console.log("Resetting via select");
        let selectValue  = DIFFICULTY_SELECTOR.value.toUpperCase();
        selectedDifficulty = DIFFICULTY[selectValue];
    }
    MINEFIELD_TABLE.innerHTML = "";

    clearInterval(timerIntervalID);

    timer = 0;
    isGameOn = false;
    TIME_COUNTER.innerText = '0';
    remainingMines = selectedDifficulty.mines;
    REMAINING_MINES_COUNTER.innerText = String(remainingMines);
    wipeMines();
    initElements();
    initGame();
}

function preventClicking() {
    MINEFIELD_TABLE.removeEventListener("click", leftClick);
    MINEFIELD_TABLE.removeEventListener("contextmenu", rightClick);
    MINEFIELD_TABLE.removeEventListener("mousedown", switchEmojiToScared);
    document.querySelector("body").removeEventListener("mouseup", switchEmojiToCool);
}

// ########################################################################################################


function isWithinBounds(row, column) {
    return (
        row >= 0 &&
        row < selectedDifficulty.rows &&
        column >= 0 &&
        column < selectedDifficulty.columns
    )
}

function getRandomValue(upperLimit) {
    return Math.floor(Math.random() * upperLimit);
}

function switchEmojiToCool() {
    RESTART_BUTTON.innerText = '😎';
}

function switchEmojiToScared(event) {
    if (event.button === 0) {
        RESTART_BUTTON.innerText = '😮';
        event.preventDefault();
    }
}