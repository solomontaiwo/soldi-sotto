import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider";
import { useUnifiedTransactions } from "../Transaction/UnifiedTransactionProvider";
import LandingPage from "./LandingPage";
import LoadingWrapper from "../../utils/loadingWrapper";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const { isDemo, loading: transactionsLoading } = useUnifiedTransactions();

  // Se autenticato o demo, reindirizza
  useEffect(() => {
    if (currentUser || isDemo) {
      navigate("/dashboard", { replace: true });
    }
  }, [currentUser, isDemo, navigate]);

  // Mostra solo il loader finché uno dei due loading è true OPPURE non è ancora chiaro se c'è utente o demo
  if (authLoading || transactionsLoading || typeof currentUser === "undefined" || typeof isDemo === "undefined") {
    return <LoadingWrapper loading={true}>{null}</LoadingWrapper>;
  }

  // Mostra la landing solo se non c'è utente né demo
  if (!currentUser && !isDemo) {
    return <LandingPage />;
  }

  return null;
};

export default Home;
