import React from 'react';
import "./Rules.css";

const Rules = () => (
    <div className="RuleContainer">
        <div className="RulesContent">
            <div>
                <h2>Game Rules</h2>
                <p>To win, you need to find all of the safe spaces on the board that DO NOT have mines. 
                You can does this by using your mouse to click on the grid squares. </p>
                <ul>
                    <li>Number: a number of cells around (vertically, horizontally, or orthogonally) 
                        the selectedhas the indicated number of mines.</li>
                    <li>Bomb: Clicking a mine ends the game.</li>
                    <li>Flag a bomb: put a flag on a board to indicate that they think a mine is at that spot.</li>
                </ul>
            </div>
        </div>
    </div>
)

export default Rules;