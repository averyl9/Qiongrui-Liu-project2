import React, { createContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export const GameContext = createContext();

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

  
  const resetGame = () => {
    const { rows, cols, mines } = difficulties[difficulty];
    initializeBoard(rows, cols, mines);

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
  
    const { rows, cols, mines } = difficulties[selectedDifficulty];
    initializeBoard(rows, cols, mines);
    setDifficulty(selectedDifficulty);
  }, [routeDifficulty]);
  
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