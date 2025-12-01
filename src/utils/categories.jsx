// This file contains categories for expenses and incomes in a React application.
// We import the `useMemo` hook from React to optimize category calculation.
import { useMemo } from "react";
import { useTranslation } from 'react-i18next';

// Create a custom hook called `useCategories` that returns expense and income categories.
export const useCategories = () => {
  const { t } = useTranslation();

  // Expense categories: daily priority
  const expenseCategories = useMemo(
    () => [
      { value: "supermercato", label: t('categories.supermercato') },
      { value: "alimentazione", label: t('categories.alimentazione') },
      { value: "trasporti", label: t('categories.trasporti') },
      { value: "casa", label: t('categories.casa') },
      { value: "abbonamenti", label: t('categories.abbonamenti') },
      { value: "shopping", label: t('categories.shopping') },
      { value: "salute", label: t('categories.salute') },
      { value: "intrattenimento", label: t('categories.intrattenimento') },
      { value: "viaggi", label: t('categories.viaggi') },
      { value: "altro", label: t('categories.altro') },
    ],
    [t]
  );

  // Income categories: salary/freelance priority
  const incomeCategories = useMemo(
    () => [
      { value: "stipendio", label: t('categories.stipendio') },
      { value: "freelance", label: t('categories.freelance') },
      { value: "bonus", label: t('categories.bonus') },
      { value: "vendite", label: t('categories.vendite') },
      { value: "rimborso", label: t('categories.rimborso') },
      { value: "investimenti", label: t('categories.investimenti') },
      { value: "regalo", label: t('categories.regalo') },
      { value: "altro", label: t('categories.altro') },
    ],
    [t]
  );

  // The custom hook returns an object containing expense and income categories.
  // This allows other components to easily access the data.
  return { expenseCategories, incomeCategories };
};
