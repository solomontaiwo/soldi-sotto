// Questo file contiene le categorie per le spese e gli introiti in un'applicazione React.
// Importiamo il hook `useMemo` da React per ottimizzare il calcolo delle categorie.
import { useMemo } from "react";

// Creiamo un custom hook chiamato `useCategories` che restituisce le categorie di spesa e introito.
export const useCategories = () => {
  // Definiamo le categorie delle spese
  // Utilizziamo `useMemo` per memorizzare il valore in modo che non venga ricalcolato ad ogni render
  const expenseCategories = useMemo(
    () => [
      // Ogni categoria è rappresentata da un oggetto con due proprietà:
      // `value` - un identificativo univoco per la categoria (usato ad esempio nei form o database)
      // `label` - la rappresentazione visiva della categoria (usata nelle UI)
      { value: "alimentazione", label: "🍔 Alimentazione" },
      { value: "supermercato", label: "🛒 Supermercato" },
      { value: "trasporti", label: "🚗 Trasporti" },
      { value: "intrattenimento", label: "🎉 Intrattenimento" },
      { value: "abbonamenti", label: "📺 Abbonamenti" },
      { value: "casa", label: "🏡 Casa" },
      { value: "salute", label: "🏥 Salute" },
      { value: "educazione", label: "📚 Educazione" },
      { value: "viaggi", label: "✈️ Viaggi" },
      { value: "donazioni", label: "❤️ Donazioni" },
      { value: "investimenti", label: "📈 Investimenti" },
      { value: "altro", label: "🔍 Altro" },
    ],
    [] // La dipendenza è un array vuoto, quindi questo valore sarà calcolato una volta e mai più.
  );

  // Definiamo le categorie degli introiti
  const incomeCategories = useMemo(
    () => [
      // Stessa logica delle categorie di spesa, ma applicata agli introiti
      { value: "stipendio", label: "💼 Stipendio" },
      { value: "bonus", label: "💰 Bonus" },
      { value: "regalo", label: "🎁 Regalo" },
      { value: "vendite", label: "🛍️ Vendite" },
      { value: "interessi", label: "🏦 Interessi" },
      { value: "affitti", label: "🏠 Affitti" },
      { value: "dividendi", label: "💵 Dividendi" },
      { value: "rimborso", label: "💸 Rimborso" },
      { value: "altro", label: "🔍 Altro" },
    ],
    [] // Anche qui la dipendenza è vuota, quindi il calcolo è statico.
  );

  // Il custom hook restituisce un oggetto contenente le categorie di spesa e introito.
  // Questo permette ad altri componenti di accedere facilmente ai dati.
  return { expenseCategories, incomeCategories };
};