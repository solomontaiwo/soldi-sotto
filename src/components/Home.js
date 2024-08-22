import React from "react";
import AddTransaction from "./AddTransaction";
import TransactionList from "./TransactionList";
import { useAuth } from "./AuthProvider";

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="home-container">
      <h1>Benvenuto in SoldiSotto</h1>
      <AddTransaction />
      {currentUser && (
        <div className="transaction-list-container">
          <TransactionList />
        </div>
      )}
    </div>
  );
};

export default Home;
