/**
 *
 * Author: Filip Misiło
 *
*/

const difficulty = {
    BEGINNER: {mines: 10, rows: 9, columns: 9},
    INTERMEDIATE: {mines: 40, rows: 16, columns: 16},
    EXPERT: {mines: 99, rows: 16, columns: 30},
    CUSTOM: {mines: 0, rows: 0, columns: 0}
}

class Cell {
    isUncovered = false;
    isFlagged = false;
    isMine = false;
    value = 0;
    displayText = "";
}

const APP_BODY = document.querySelector("body");
const MINEFIELD_TABLE = document.querySelector(".minefield");
const DIFFICULTY_SELECTOR = document.querySelector("select");
const RESTART_BUTTON = document.querySelector(".restart");
const TIME_COUNTER = document.getElementById("time-counter");
const REMAINING_MINES_COUNTER = document.getElementById("remaining-mines-counter");

let selectedDifficulty = difficulty.BEGINNER;
let remainingMines = selectedDifficulty.mines;
let remainingCoveredCells = selectedDifficulty.columns * selectedDifficulty.rows - selectedDifficulty.mines;
let isGameOn = false;
let timer = 0;
let explodeIntervalID;
let timerIntervalID;
let mineLocation = [];
let minefield = [];

initializeGame();
allowHorizontalClickAndDrag();

function initializeGame() {
    switchEmojiToCool();
    createEventListeners();
    createNewMinefield();
    populateMinefield();
    updateCellDisplayText();
    renderMinefield();
}

function createEventListeners() {
    DIFFICULTY_SELECTOR.onchange = switchDifficulty;
    REMAINING_MINES_COUNTER.innerText = String(remainingMines);
    RESTART_BUTTON.addEventListener("click", restartGame);
    MINEFIELD_TABLE.addEventListener("click", leftClick);
    MINEFIELD_TABLE.addEventListener("contextmenu", rightClick);
    MINEFIELD_TABLE.addEventListener("mousedown", switchEmojiToScared);
    APP_BODY.addEventListener("mouseup", switchEmojiToCool);
    document.getElementById("custom-start").addEventListener("click", startCustomGame);
}

function createNewMinefield() {
    for (let i = 0; i < selectedDifficulty.rows; i++) {
        minefield.push([]);
        for (let j = 0; j < selectedDifficulty.columns; j++) {
            minefield[i][j] = new Cell();
        }
    }
}

function populateMinefield() {
    let minesLeftToDistribute = selectedDifficulty.mines;
    let iterationLimit = 5000;

    while (minesLeftToDistribute && iterationLimit) {
        const row = getRandomValue(selectedDifficulty.rows);
        const column = getRandomValue(selectedDifficulty.columns);
        const cell = minefield[row][column];

        if (!cell.isMine) {
            cell.value = '-1';
            cell.isMine = true;
            incrementAdjacentCells(row, column);
            minesLeftToDistribute--;
            mineLocation.push({
                row: row,
                column: column
            });
        }
        iterationLimit--;
    }
}

function incrementAdjacentCells(row, column) {
    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = column - 1; j <= column + 1 ; j++) {
            if (isWithinBounds(i, j) && !minefield[i][j].isMine) {
                minefield[i][j].value++;
            }
        }
    }
}

function renderMinefield() {
    for (let i = 0; i < selectedDifficulty.rows; i++) {
        let newElementTR = document.createElement("TR");

        newElementTR.classList.add(`row-${i}`, `refresh`);
        MINEFIELD_TABLE.appendChild(newElementTR);

        for (let j = 0; j < selectedDifficulty.columns; j++) {
            let newElementTD = document.createElement("TD");
            let newElementSPAN = document.createElement("SPAN");
            newElementTD.id = `cell-${i}-${j}`;
            newElementSPAN.id = `span-${i}-${j}`;
            newElementTD.appendChild(newElementSPAN);
            document.querySelector(`.row-${i}`).appendChild(newElementTD);
        }
    }
}

function resizeMinefield() {
    let card = document.querySelector(".card");

    /* Needs actual card dimensions (instead of auto) to enable smooth resize transition on difficulty change */
    /* After switching difficulty, inner elements dimensions are summed with extra paddings/margins/borders  */
    /* Height also takes card header into account */

    card.style["height"] = document.querySelector(".minefield").offsetHeight + 71.4 + "px";
    card.style["width"] = document.querySelector(".row-0").offsetWidth + 10 + "px";
}


function updateCellDisplayText() {
    for (let i = 0; i < selectedDifficulty.rows; i++) {
        for (let j = 0; j < selectedDifficulty.columns; j++) {
            let cell = minefield[i][j];

            if (cell.value === 0) {
                cell.displayText = ' ';
            } else if (cell.value > 0) {
                cell.displayText = cell.value;
            } else {
                cell.displayText = '💣';
            }
        }
    }
}

function resetMinefield() {
    minefield = [];
    mineLocation = [];
}

function switchDifficulty() {
    if (DIFFICULTY_SELECTOR.value === "custom") {
        $('#custom-settings-modal').modal('show');
    } else {
        selectedDifficulty = difficulty[DIFFICULTY_SELECTOR.value.toUpperCase()];
        restartGame();
        resizeMinefield();
    }
    DIFFICULTY_SELECTOR.selectedIndex = 0;
}

function startGame() {
    isGameOn = true;
    startTimer();
}

function startCustomGame(event) {
    let mines = document.getElementById("custom-input-mines").value;
    let rows = document.getElementById("custom-input-rows").value;
    let columns = document.getElementById("custom-input-columns").value;
    let mineLimit = rows * columns;

    if (mines < 1 || rows < 3 || columns < 8) {
        return;
    }

    if (mines > mineLimit) {
        document.querySelector(".max-mines-alert").classList.add("visible");
        document.querySelector(".max-mines").innerText = mineLimit;
    } else {
        document.querySelector(".max-mines-alert").classList.remove("visible");
        selectedDifficulty = difficulty.CUSTOM;
        selectedDifficulty.mines = mines;
        selectedDifficulty.rows = rows;
        selectedDifficulty.columns = columns;
        $('#custom-settings-modal').modal('hide');
        restartGame();
        resizeMinefield();
    }
    event.preventDefault();
}

function startTimer() {
    timerIntervalID = setInterval(() => {
        TIME_COUNTER.innerText = String(++timer);
    }, 1000);
}

function resetTimer() {
    TIME_COUNTER.innerText = '0';
    timer = 0;
}

function stopTimer() {
    clearInterval(timerIntervalID);
}

function isWithinBounds(row, column) {
    return (
        row >= 0
        && row < selectedDifficulty.rows
        && column >= 0
        && column < selectedDifficulty.columns
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

function leftClick(event) {
    if (!event.target.matches("TD")) {
        return;
    }

    const coordinates = event.target.id.split("-");
    const row = Number(coordinates[1]);
    const column = Number(coordinates[2]);
    const cell = minefield[row][column];

    if (!cell.isUncovered && !cell.isFlagged) {
        if (cell.isMine) {
            gameOver();
        } else {
            if (!isGameOn) {
                startGame();
            }
            uncoverSingleCell(row, column);
        }
    }
}

function rightClick(event) {
    const coordinates = event.target.id.split("-");
    const row = coordinates[1];
    const column = coordinates[2];

    event.preventDefault();
    toggleCellFlag(row, column);
}

function toggleCellFlag(row, column) {
    const cell = minefield[row][column];

    if (!cell.isUncovered) {
        const element = document.getElementById(`span-${row}-${column}`);

        if (cell.isFlagged) {
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

function uncoverSingleCell(row, column) {
    const uncoveredNode = document.createTextNode(minefield[row][column].displayText);
    const cell = document.getElementById(`cell-${row}-${column}`);
    const span = document.getElementById(`span-${row}-${column}`);

    span.appendChild(uncoveredNode);
    cell.classList.add(`uncovered`, `value-${minefield[row][column].value}`);
    minefield[row][column].isUncovered = true;
    --remainingCoveredCells;

    if (minefield[row][column].value === 0) {
        uncoverAdjacentCells(row, column);
    }

    if (isGameOn && remainingCoveredCells === 0) {
        winGame();
    }
}

function uncoverAdjacentCells(row, column) {
    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = column - 1; j <= column + 1; j++) {
            if (isWithinBounds(i, j) && !minefield[i][j].isUncovered && !minefield[i][j].isFlagged) {
                uncoverSingleCell(i, j);
            }
        }
    }
}

function gameOver() {
    isGameOn = false;
    RESTART_BUTTON.innerText = '☠️';
    stopTimer();
    preventClickingAfterGameEnds();
    uncoverAllNotFlaggedMineCells();
    explodeAllNotFlaggedMines();
}

function uncoverAllNotFlaggedMineCells() {
    mineLocation.forEach(function(location) {
        if (!minefield[location.row][location.column].isFlagged) {
            uncoverSingleCell(location.row, location.column);
        }
    });
}

function explodeAllNotFlaggedMines() {
    explodeIntervalID = setInterval(function() {
        if (mineLocation.length) {
            let location = mineLocation.pop();

            if (!minefield[location.row][location.column].isFlagged) {
                document.getElementById(`span-${location.row}-${location.column}`).innerText = '💥';
                const span = document.getElementById(`span-${location.row}-${location.column}`);
                span.classList.add("explode");
            }
        } else {
            clearInterval(explodeIntervalID);
        }
    }, 50);
}

function winGame() {
    stopTimer();
    preventClickingAfterGameEnds();
    RESTART_BUTTON.innerText = '🏆';
    document.querySelector(".win-container").classList.add("win-in");
}

function preventClickingAfterGameEnds() {
    MINEFIELD_TABLE.removeEventListener("click", leftClick);
    MINEFIELD_TABLE.removeEventListener("contextmenu", rightClick);
    MINEFIELD_TABLE.addEventListener("contextmenu", (event) => event.preventDefault());
    MINEFIELD_TABLE.removeEventListener("mousedown", switchEmojiToScared);
    APP_BODY.removeEventListener("mouseup", switchEmojiToCool);
}

function restartGame() {
    let winElement = document.querySelector(".win-container");

    stopTimer();
    resetTimer();
    clearInterval(explodeIntervalID);

    isGameOn = false;
    MINEFIELD_TABLE.innerHTML = "";
    remainingMines = selectedDifficulty.mines;
    REMAINING_MINES_COUNTER.innerText = String(remainingMines);
    remainingCoveredCells = selectedDifficulty.columns * selectedDifficulty.rows - selectedDifficulty.mines;

    if (winElement.classList.contains("win-in")) {
        winElement.classList.remove("win-in");
        winElement.classList.add("win-out");
        setTimeout(() => {
            winElement.classList.remove("win-out");
        }, 1000);
    }

    resetMinefield();
    preventClickingAfterGameEnds();
    createEventListeners();
    initializeGame();
}

/* For smaller desktop screens */
function allowHorizontalClickAndDrag() {
    let isDown = false;
    let startX;
    let scrollLeft;

    MINEFIELD_TABLE.addEventListener('mousedown', (event) => {
        isDown = true;
        startX = event.pageX - MINEFIELD_TABLE.offsetLeft;
        scrollLeft = MINEFIELD_TABLE.scrollLeft;
    });

    MINEFIELD_TABLE.addEventListener('mouseup', () => {
        isDown = false;
    });

    MINEFIELD_TABLE.addEventListener('mousemove', (event) => {
        if (isDown) {
            const x = event.pageX - MINEFIELD_TABLE.offsetLeft;
            const walk = (x - startX) * 2;
            MINEFIELD_TABLE.scrollLeft = scrollLeft - walk;
        }
    });
}
