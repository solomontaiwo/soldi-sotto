import { differenceInDays } from "date-fns";

export const calculateStats = (transactions, startDate, endDate) => {
  let totalIncome = 0;
  let totalExpense = 0;
  let categories = {};
  let incomeTrend = [];
  let expenseTrend = [];

  transactions.forEach((tx) => {
    const date = new Date(tx.date.seconds * 1000);
    if (tx.type === "income") {
      totalIncome += tx.amount;
      incomeTrend.push({ x: date, y: tx.amount });
    }
    if (tx.type === "expense") {
      totalExpense += tx.amount;
      expenseTrend.push({ x: date, y: tx.amount });
      if (tx.category) {
        categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
      }
    }
  });

  const daysCount = differenceInDays(endDate, startDate) + 1;
  const dailyAverageExpense = daysCount ? totalExpense / daysCount : 0;

  const sortedCategories = Object.entries(categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount }));

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    dailyAverageExpense,
    topCategories: sortedCategories,
    incomeTrend,
    expenseTrend,
  };
};
