import React from "react";
import TransactionList from "./TransactionList";
import { useAuth } from "./AuthProvider";
import "./Home.css";

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Benvenuto in SoldiSotto!</h1>
        <p>Gestisci le tue finanze in modo semplice e veloce.</p>
      </header>
      {currentUser && (
        <div className="transaction-section">
          <TransactionList />
        </div>
      )}
    </div>
  );
};

export default Home;
