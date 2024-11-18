import React, { useContext } from "react";
import { GameContext } from "./GameProvider";
import Cell from './Cell';
import "./Game.css";

const Game = () => {
  const {
    gameBoard,
    resetGame,
    difficulty,
    gameOver,
    win,
    flagCount,
  } = useContext(GameContext);

  const rows = gameBoard.length;
  const cols = gameBoard[0]?.length || 0;

  return (
    <div className="GameContainer">
      <div className="GameHeader">
        <h1>Minesweeper</h1>
        <p>Current Difficulty Mode: {difficulty}</p>
        <p>Flag Bomb Count: {flagCount}</p>
        <button onClick={resetGame}>Reset</button>
      </div>
      {gameOver && <h2>{
                          gameOver && 
                          <h2>{
                            win ? "Game over! You Won!" : "Game over! You lost!"
                            }
                          </h2>
                        }
                    </h2>
        }
      <div
        className="GameBoard"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {gameBoard.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell key={`${rowIndex}-${colIndex}`} row={rowIndex} col={colIndex} />
          ))
        )}
      </div>
    </div>
  );
};

export default Game;