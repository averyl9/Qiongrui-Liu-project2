import React from "react";
import { NavLink } from "react-router-dom";
import "./HomePage.css";

const Home = () => (
  <div className="HomeContainer">
    <header className="HomeHeader">
      <h1>Minesweeper Game</h1>
    </header>
    <nav className="HomeNav">
      <NavLink to="/rules" className="HomeLink">
        View Rules
      </NavLink>
      <NavLink to="/game/easy" className="HomeLink">
        Play Game
      </NavLink>
    </nav>
  </div>
);

export default Home;