// Questo file contiene le categorie per le spese e gli introiti in un'applicazione React.
// Importiamo il hook `useMemo` da React per ottimizzare il calcolo delle categorie.
import { useMemo } from "react";
import { useTranslation } from 'react-i18next';

// Creiamo un custom hook chiamato `useCategories` che restituisce le categorie di spesa e introito.
export const useCategories = () => {
  const { t } = useTranslation();

  // Definiamo le categorie delle spese - ordinate per frequenza d'uso
  const expenseCategories = useMemo(
    () => [
      { value: "alimentazione", label: `🍕 ${t('categories.alimentazione')}` },
      { value: "supermercato", label: `🛒 ${t('categories.supermercato')}` },
      { value: "trasporti", label: `🚗 ${t('categories.trasporti')}` },
      { value: "casa", label: `🏠 ${t('categories.casa')}` },
      { value: "intrattenimento", label: `🎬 ${t('categories.intrattenimento')}` },
      { value: "abbonamenti", label: `📱 ${t('categories.abbonamenti')}` },
      { value: "salute", label: `⚕️ ${t('categories.salute')}` },
      { value: "viaggi", label: `✈️ ${t('categories.viaggi')}` },
      { value: "shopping", label: `🛍️ ${t('categories.shopping')}` },
      { value: "altro", label: `📋 ${t('categories.altro')}` },
    ],
    [t]
  );

  // Definiamo le categorie degli introiti - ordinate per frequenza d'uso
  const incomeCategories = useMemo(
    () => [
      { value: "stipendio", label: `💼 ${t('categories.stipendio')}` },
      { value: "bonus", label: `🎯 ${t('categories.bonus')}` },
      { value: "regalo", label: `🎁 ${t('categories.regalo')}` },
      { value: "vendite", label: `💰 ${t('categories.vendite')}` },
      { value: "rimborso", label: `↩️ ${t('categories.rimborso')}` },
      { value: "freelance", label: `💻 ${t('categories.freelance')}` },
      { value: "investimenti", label: `📈 ${t('categories.investimenti')}` },
      { value: "altro", label: `📋 ${t('categories.altro')}` },
    ],
    [t]
  );

  // Il custom hook restituisce un oggetto contenente le categorie di spesa e introito.
  // Questo permette ad altri componenti di accedere facilmente ai dati.
  return { expenseCategories, incomeCategories };
};