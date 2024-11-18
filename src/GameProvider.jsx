import React, { createContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { openDB } from "idb";

export const GameContext = createContext();

  // Extra Credit: Saved Data
  const dbPromise = openDB("MinesweeperDB", 1, {
    upgrade(db) {
      db.createObjectStore("gameState"); 
    },
  });

export const GameProvider = ({ children }) => {
  const {difficulty: routeDifficulty } = useParams();
  const [gameBoard, setGameBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");
  const [flagCount, setFlagCount] = useState(0);

  const difficulties = {
    easy: { rows: 8, cols: 8, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 30, cols: 16, mines: 99 },
  };

  const initializeBoard = (rows, cols, mines) => {
    const board = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    );


    // Place mines
    let mineCount = 0;
    while (mineCount < mines) {
      const randomRow = Math.floor(Math.random() * rows);
      const randomCol = Math.floor(Math.random() * cols);
      if (!board[randomRow][randomCol].isMine) {
        board[randomRow][randomCol].isMine = true;
        mineCount++;
      }
    }

    // Calculate neighbor mine counts
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!board[row][col].isMine) {
          const neighbors = [
            [row - 1, col - 1],
            [row - 1, col],
            [row - 1, col + 1],
            [row, col - 1],
            [row, col + 1],
            [row + 1, col - 1],
            [row + 1, col],
            [row + 1, col + 1],
          ];
          board[row][col].neighborMines = neighbors.reduce((count, [r, c]) => {
            if (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c].isMine) {
              count++;
            }
            return count;
          }, 0);
        }
      }
    }
    setGameBoard(board);
    setGameOver(false);
    setWin(false);
    setFlagCount(0);
  };

  // Save game state to IndexedDB
  const saveGameState = async () => {
    if (gameBoard.length === 0) return;
    const state = {
      gameBoard,
      gameOver,
      win,
      difficulty,
      flagCount,
    };
    const db = await dbPromise;
    await db.put("gameState", state, "currentGame");
  };

  const loadGameState = async () => {
    const db = await dbPromise;
    const savedState = await db.get("gameState", "currentGame");
    if (savedState) {
      const { gameBoard, gameOver, win, difficulty, flagCount } = savedState;
      setGameBoard(gameBoard);
      setGameOver(gameOver);
      setWin(win);
      setDifficulty(difficulty);
      setFlagCount(flagCount);
    } else {
      const { rows, cols, mines } = difficulties[difficulty];
      initializeBoard(rows, cols, mines);
    }
  };

  const resetGame = async () => {
    const { rows, cols, mines } = difficulties[difficulty];
    initializeBoard(rows, cols, mines);

    const db = await dbPromise;
    await db.delete("gameState", "currentGame"); 
  };

  const checkWinCondition = () => {
    const allSafeCellsRevealed = gameBoard.flat().every(
      (cell) => cell.isRevealed || cell.isMine
    );
    if (allSafeCellsRevealed) {
      setWin(true);
      setGameOver(true);
    }
  };

  const handleCellClick = (row, col) => {
    if (gameOver || gameBoard[row][col].isRevealed) return;

    const newBoard = gameBoard.map((r) =>
      r.map((cell) => ({ ...cell }))
    );

    if (newBoard[row][col].isMine) {
      newBoard[row][col].isRevealed = true;
      setGameOver(true);
    } else {
      newBoard[row][col].isRevealed = true;
      // Extra Credit: Auto Clear
      if (newBoard[row][col].neighborMines === 0) {
        revealEmptyCells(newBoard, row, col);
      }
    }

    setGameBoard(newBoard);
    checkWinCondition();
  };

  // Extra Credit: Auto Clear
  const revealEmptyCells = (board, row, col) => {
    const stack = [[row, col]];
    while (stack.length) {
      const [r, c] = stack.pop();
      const neighbors = [
        [r - 1, c - 1],
        [r - 1, c],
        [r - 1, c + 1],
        [r, c - 1],
        [r, c + 1],
        [r + 1, c - 1],
        [r + 1, c],
        [r + 1, c + 1],
      ];
      neighbors.forEach(([nr, nc]) => {
        if (
          nr >= 0 &&
          nr < board.length &&
          nc >= 0 &&
          nc < board[0].length &&
          !board[nr][nc].isRevealed &&
          !board[nr][nc].isMine
        ) {
          board[nr][nc].isRevealed = true;
          if (board[nr][nc].neighborMines === 0) {
            stack.push([nr, nc]);
          }
        }
      });
    }
  };

  useEffect(() => {
    const validDifficulties = ["easy", "medium", "hard"];
    const selectedDifficulty = validDifficulties.includes(routeDifficulty)
      ? routeDifficulty
      : "easy";
  
    const loadOrInitialize = async () => {
      // load saved state
      const savedState = await loadGameState(); 
      if (!savedState || savedState.difficulty !== selectedDifficulty) {
        const { rows, cols, mines } = difficulties[selectedDifficulty];
        // create new board if no saved state
        initializeBoard(rows, cols, mines); 
      }
      // update difficulty level
      setDifficulty(selectedDifficulty); 
    };
  
    loadOrInitialize();
  }, [routeDifficulty]);
  
  useEffect(() => {
    const saveState = async () => {
      await saveGameState();
    };
    saveState();
  }, [gameBoard, gameOver, win, flagCount]);



  return (
    <GameContext.Provider
      value={{
        gameBoard,
        gameOver,
        win,
        setGameBoard,
        setDifficulty,
        resetGame,
        difficulty,
        handleCellClick,
        flagCount, 
        setFlagCount,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
