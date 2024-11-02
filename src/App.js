import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import Home from "./components/Home/Home";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Transactions from "./components/Transaction/TransactionList";
import Stats from "./components/Stats/Stats";
import Navbar from "./components/Navbar/Navbar";
import "./App.css";

function App() {
  return (
    <Router>
      <Navbar />
      <TransitionGroup>
        <CSSTransition timeout={300} classNames="fade">
          <Routes>
            <Route path="/soldi-sotto" element={<Home />} />
            <Route path="/soldi-sotto/login" element={<Login />} />
            <Route path="/soldi-sotto/register" element={<Register />} />
            <Route path="/soldi-sotto/transactions" element={<Transactions />} />
            <Route path="/soldi-sotto/stats" element={<Stats />} />{" "}
          </Routes>
        </CSSTransition>
      </TransitionGroup>
    </Router>
  );
}

export default App;
