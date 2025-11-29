// Questo file contiene le categorie per le spese e gli introiti in un'applicazione React.
// Importiamo il hook `useMemo` da React per ottimizzare il calcolo delle categorie.
import { useMemo } from "react";
import { useTranslation } from 'react-i18next';

// Creiamo un custom hook chiamato `useCategories` che restituisce le categorie di spesa e introito.
export const useCategories = () => {
  const { t } = useTranslation();

  // Categorie spese: priorità quotidiana
  const expenseCategories = useMemo(
    () => [
      { value: "supermercato", label: `🛒 ${t('categories.supermercato')}` },
      { value: "alimentazione", label: `🍕 ${t('categories.alimentazione')}` },
      { value: "trasporti", label: `🚗 ${t('categories.trasporti')}` },
      { value: "casa", label: `🏠 ${t('categories.casa')}` },
      { value: "abbonamenti", label: `📱 ${t('categories.abbonamenti')}` },
      { value: "shopping", label: `🛍️ ${t('categories.shopping')}` },
      { value: "salute", label: `⚕️ ${t('categories.salute')}` },
      { value: "intrattenimento", label: `🎬 ${t('categories.intrattenimento')}` },
      { value: "viaggi", label: `✈️ ${t('categories.viaggi')}` },
      { value: "altro", label: `📋 ${t('categories.altro')}` },
    ],
    [t]
  );

  // Categorie introiti: priorità stipendio/freelance
  const incomeCategories = useMemo(
    () => [
      { value: "stipendio", label: `💼 ${t('categories.stipendio')}` },
      { value: "freelance", label: `💻 ${t('categories.freelance')}` },
      { value: "bonus", label: `🎯 ${t('categories.bonus')}` },
      { value: "vendite", label: `💰 ${t('categories.vendite')}` },
      { value: "rimborso", label: `↩️ ${t('categories.rimborso')}` },
      { value: "investimenti", label: `📈 ${t('categories.investimenti')}` },
      { value: "regalo", label: `🎁 ${t('categories.regalo')}` },
      { value: "altro", label: `📋 ${t('categories.altro')}` },
    ],
    [t]
  );

  // Il custom hook restituisce un oggetto contenente le categorie di spesa e introito.
  // Questo permette ad altri componenti di accedere facilmente ai dati.
  return { expenseCategories, incomeCategories };
};
