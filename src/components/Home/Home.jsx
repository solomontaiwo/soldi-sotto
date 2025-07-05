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
  const fullLoading = authLoading || transactionsLoading;

  useEffect(() => {
    // Se l'utente è autenticato o in modalità demo, reindirizza alla dashboard
    if (!authLoading && (currentUser || isDemo)) {
      navigate("/dashboard", { replace: true });
    }
  }, [currentUser, isDemo, authLoading, navigate]);

  // Mostra la landing page per utenti non autenticati e non in demo
  if (!authLoading && !currentUser && !isDemo) {
    return <LandingPage />;
  }

  // Loading state
  return <LoadingWrapper loading={fullLoading} />;
};

export default Home;
