// Desc: This file contains the categories for the expenses and incomes
import { useMemo } from "react";

export const useCategories = () => {
  const expenseCategories = useMemo(
    () => [
      { value: "alimentazione", label: "🍔 Alimentazione" },
      { value: "casa", label: "🏠 Casa" },
      { value: "trasporti", label: "🚗 Trasporti" },
      { value: "intrattenimento", label: "🎉 Intrattenimento" },
      { value: "abbonamenti", label: "📺 Abbonamenti" },
      { value: "altro", label: "🔍 Altro" },
    ],
    []
  );

  const incomeCategories = useMemo(
    () => [
      { value: "stipendio", label: "💼 Stipendio" },
      { value: "bonus", label: "💰 Bonus" },
      { value: "regalo", label: "🎁 Regalo" },
      { value: "investimenti", label: "📈 Investimenti" },
      { value: "rimborso", label: "💸 Rimborso" },
      { value: "altro", label: "🔍 Altro" },
    ],
    []
  );

  return { expenseCategories, incomeCategories };
};
