import React, { useContext } from "react";
import { GameContext } from "./GameProvider";
import "./Cell.css";

const Cell = ({ row, col }) => {
  // use state management tool to pass data
  const { gameBoard, 
          setGameBoard, 
          handleCellClick, 
          gameOver, 
          setFlagCount, 
          flagCount 
        } = useContext(GameContext);
        
  const cell = gameBoard[row][col];

  const handleClick = () => {
    handleCellClick(row, col);
  };

  // Extra Credit: Flag Bomb Function
  const handleRightClick = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (cell.isRevealed || gameOver) return;

    const updatedBoard = gameBoard.map((row) =>
      row.map((c) => ({ ...c }))
    );

    // Toggle the flag state
    updatedBoard[row][col].isFlagged = !updatedBoard[row][col].isFlagged;

    // Update the flag count
    const newFlagCount = flagCount + (updatedBoard[row][col].isFlagged ? 1 : -1);
    setFlagCount(newFlagCount);

    setGameBoard(updatedBoard); 

  };

  return (
    <div
    className={`cell ${
      cell.isRevealed
        ? cell.isMine
          ? "mine"
          : "revealed"
        : cell.isFlagged
        ? "flagged"
        : "unselected"
      }`}
      onClick={handleClick}
      onContextMenu={handleRightClick}
    >
      {cell.isFlagged
        ? "🚩"
        : cell.isRevealed && !cell.isMine && cell.neighborMines > 0
        ? cell.neighborMines
        : cell.isRevealed && cell.isMine
        ? "💣"
        : ""}
    </div>
  );
};

export default Cell;