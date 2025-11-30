import { useMemo, useState } from 'react';
import { isWithinInterval } from 'date-fns';

export const useTransactionFilter = (transactions, dateRange) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const { startDate, endDate } = dateRange;

    // Pre-sort by date descending
    const sorted = [...transactions].sort((a, b) => b.date - a.date);

    return sorted.filter((transaction) => {
      // 1. Date Filter
      if (startDate && endDate) {
        if (!transaction.date || !isWithinInterval(transaction.date, { start: startDate, end: endDate })) {
          return false;
        }
      }

      // 2. Search Filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesDescription = transaction.description.toLowerCase().includes(term);
        const matchesCategory = transaction.category.toLowerCase().includes(term);
        if (!matchesDescription && !matchesCategory) return false;
      }

      // 3. Category Filter
      if (selectedCategory !== "all" && transaction.category !== selectedCategory) {
        return false;
      }

      // 4. Type Filter
      if (selectedType !== "all" && transaction.type !== selectedType) {
        return false;
      }

      return true;
    });
  }, [transactions, dateRange, searchTerm, selectedCategory, selectedType]);

  return {
    filteredTransactions,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedType,
    setSelectedType,
  };
};
