// Questo file contiene le categorie per le spese e gli introiti in un'applicazione React.
// Importiamo il hook `useMemo` da React per ottimizzare il calcolo delle categorie.
import { useMemo } from "react";

// Creiamo un custom hook chiamato `useCategories` che restituisce le categorie di spesa e introito.
export const useCategories = () => {
  // Definiamo le categorie delle spese - ordinate per frequenza d'uso
  const expenseCategories = useMemo(
    () => [
      { value: "alimentazione", label: "🍕 Alimentazione" },
      { value: "supermercato", label: "🛒 Spesa" },
      { value: "trasporti", label: "🚗 Trasporti" },
      { value: "casa", label: "🏠 Casa" },
      { value: "intrattenimento", label: "🎬 Svago" },
      { value: "abbonamenti", label: "📱 Abbonamenti" },
      { value: "salute", label: "⚕️ Salute" },
      { value: "viaggi", label: "✈️ Viaggi" },
      { value: "shopping", label: "🛍️ Shopping" },
      { value: "altro", label: "📋 Altro" },
    ],
    []
  );

  // Definiamo le categorie degli introiti - ordinate per frequenza d'uso
  const incomeCategories = useMemo(
    () => [
      { value: "stipendio", label: "💼 Stipendio" },
      { value: "bonus", label: "🎯 Bonus" },
      { value: "regalo", label: "🎁 Regalo" },
      { value: "vendite", label: "💰 Vendite" },
      { value: "rimborso", label: "↩️ Rimborso" },
      { value: "freelance", label: "💻 Freelance" },
      { value: "investimenti", label: "📈 Investimenti" },
      { value: "altro", label: "📋 Altro" },
    ],
    []
  );

  // Il custom hook restituisce un oggetto contenente le categorie di spesa e introito.
  // Questo permette ad altri componenti di accedere facilmente ai dati.
  return { expenseCategories, incomeCategories };
};