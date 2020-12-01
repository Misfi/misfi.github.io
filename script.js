//_ADD:
// Debug mode
// Tests
// Explosion animation
// -- smooth transform
// -- shaking


//_FIXES:
// Firefox - events not working


//_REFACTORING:
// scss
// Query
// fix html
// minefield prep
// loops


const DIFFICULTY = {
    beginner: {mines: 10, rows: 8, columns: 8},
    intermediate: {mines: 40, rows: 16, columns: 16},
    expert: {mines: 99, rows: 16, columns: 30},
    custom: {minimumMines: 1, minimumRows: 3, minimumColumns: 8}
}

class Cell {
    isUncovered = false;
    isFlagged = false;
    isMine = false;
    value = 0;
    displayText = "";
}

const MINEFIELD_TABLE = document.querySelector(".mineTable");
const DIFFICULTY_SELECTOR = document.querySelector("select");
const RESTART_BUTTON = document.getElementById("emojiRestart");
const TIME_COUNTER = document.getElementById("timeCounter");
const REMAINING_MINES_COUNTER = document.getElementById("remainingMinesCounter");
const APP_BODY = document.querySelector("body");
const MINEFIELD = [];

let selectedDifficulty = DIFFICULTY.beginner;
let remainingMines = selectedDifficulty.mines;
let remainingCoveredCells = selectedDifficulty.columns * selectedDifficulty.rows - selectedDifficulty.mines;
let isGameOn = false;
let timer = 0;
let explodeIntervalID;
let timerIntervalID;
let mineLocation = [];

initializeGame();

function initializeGame() {
    switchEmojiToCool();
    createEventListeners();
    createMinefield();
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
    document.getElementById("customGameStartButton").addEventListener("click", startCustomGame);
}

function createMinefield() {
    for (let i = 0; i < selectedDifficulty.rows; i++) {
        MINEFIELD.push([]);
        for (let j = 0; j < selectedDifficulty.columns; j++) {
            MINEFIELD[i][j] = new Cell();
        }
    }
}

function populateMinefield() {
    let minesLeftToDistribute = selectedDifficulty.mines;

    while (minesLeftToDistribute) {
        const row = getRandomValue(selectedDifficulty.rows);
        const column = getRandomValue(selectedDifficulty.columns);
        const cell = MINEFIELD[row][column];

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

function renderMinefield() {
    for (let i = 0; i < selectedDifficulty.rows; i++) {
        let newElement = document.createElement("TR");

        newElement.classList.add(`row-${i}`);
        MINEFIELD_TABLE.appendChild(newElement);

        for (let j = 0; j < selectedDifficulty.columns; j++) {
            newElement = document.createElement("TD");
            newElement.id = `cell-${i}-${j}`;
            document.querySelector(`.row-${i}`).appendChild(newElement);
        }
    }
}

function updateCellDisplayText() {
    for (let i = 0; i < selectedDifficulty.rows; i++) {
        for (let j = 0; j < selectedDifficulty.columns; j++) {
            let cell = MINEFIELD[i][j];

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

function wipeMines() {
    for (let i = 0; i < selectedDifficulty.rows; i++) {
        MINEFIELD.pop();
    }
    mineLocation = [];
}

function switchDifficulty() {

    if (DIFFICULTY_SELECTOR.value === "custom") {
        $('#customDifficultyModal').modal('show');
        DIFFICULTY_SELECTOR.selectedIndex = 0;
    } else {
        selectedDifficulty = DIFFICULTY[DIFFICULTY_SELECTOR.value];
        restartGame();
        DIFFICULTY_SELECTOR.selectedIndex = 0;
    }

}

function startGame() {
    isGameOn = true;
    startTimer();
}

function startCustomGame(event) {
    selectedDifficulty.mines = document.getElementById("customGameInputMines").value;
    selectedDifficulty.rows = document.getElementById("customGameInputRows").value;
    selectedDifficulty.columns = document.getElementById("customGameInputColumns").value;

    if (
        selectedDifficulty.mines < DIFFICULTY.custom.minimumMines
        || selectedDifficulty.rows < DIFFICULTY.custom.minimumRows
        || selectedDifficulty.columns < DIFFICULTY.custom.minimumColumns
    ) {
        return;
    }

    $('#customDifficultyModal').modal('hide');
    event.preventDefault();
    restartGame();
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
    if (event.target.tagName !== "TD") {
        return;
    }

    const coordinates = event.toElement.id.split("-");
    const row = Number(coordinates[1]);
    const column = Number(coordinates[2]);
    const cell = MINEFIELD[row][column];

    if (!cell.isUncovered && !cell.isFlagged) {
        if (cell.isMine) {
            gameOver();
            return;
        } else {
            if (cell.value > 0 && remainingCoveredCells === 1) {
                winGame();
            } else if (!isGameOn) {
                startGame();
            }
        }
        uncoverSingleCell(row, column);
    }
}

function rightClick(event) {
    const coordinates = event.toElement.id.split("-");
    const row = coordinates[1];
    const column = coordinates[2];
    const cell = MINEFIELD[row][column];

    if (!cell.isUncovered) {
        const element = document.getElementById(`cell-${row}-${column}`);

        event.preventDefault();

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

function uncoverSingleCell(row, column) {
    const uncoveredNode = document.createTextNode(MINEFIELD[row][column].displayText);
    const cell = document.getElementById(`cell-${row}-${column}`);

    cell.appendChild(uncoveredNode);
    cell.classList.add("uncovered");
    cell.classList.add(`cell-${MINEFIELD[row][column].value}`);

    MINEFIELD[row][column].isUncovered = true;
    --remainingCoveredCells;

    if (MINEFIELD[row][column].value === 0) {
        uncoverAdjacentCells(row, column);
    }
}

function uncoverAdjacentCells(row, column) {
    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = column - 1; j <= column + 1; j++) {
            if (isWithinBounds(i, j) && !MINEFIELD[i][j].isUncovered && !MINEFIELD[i][j].isFlagged) {
                uncoverSingleCell(i, j);
            }
        }
    }
}

function gameOver() {
    RESTART_BUTTON.innerText = '☠️';
    stopTimer();
    preventClickingAfterGameEnds();
    uncoverAllMineCells();
    explodeAllMines();
}

function uncoverAllMineCells() {
    mineLocation.forEach(function(location) {
        if (!MINEFIELD[location.row][location.column].isFlagged) {
            uncoverSingleCell(location.row, location.column);
        }
    });
}

function explodeAllMines() {
    explodeIntervalID = setInterval(function() {
        if (mineLocation.length) {
            let location = mineLocation.pop();
            document.getElementById(`cell-${location.row}-${location.column}`).innerText = '💥';
        } else {
            clearInterval(explodeIntervalID);
        }
    }, 30);
}

function winGame() {
    stopTimer();
    preventClickingAfterGameEnds();
    RESTART_BUTTON.innerText = '🏆';
}

function preventClickingAfterGameEnds() {
    MINEFIELD_TABLE.removeEventListener("click", leftClick);
    MINEFIELD_TABLE.removeEventListener("contextmenu", rightClick);
    MINEFIELD_TABLE.addEventListener("contextmenu", (event) => event.preventDefault());
    MINEFIELD_TABLE.removeEventListener("mousedown", switchEmojiToScared);
    APP_BODY.removeEventListener("mouseup", switchEmojiToCool);
}

function restartGame() {
    stopTimer();
    resetTimer();
    clearInterval(explodeIntervalID);

    isGameOn = false;
    MINEFIELD_TABLE.innerHTML = "";
    remainingMines = selectedDifficulty.mines;
    REMAINING_MINES_COUNTER.innerText = String(remainingMines);
    remainingCoveredCells = selectedDifficulty.columns * selectedDifficulty.rows - selectedDifficulty.mines;

    wipeMines();
    preventClickingAfterGameEnds();
    createEventListeners();
    initializeGame();
}
