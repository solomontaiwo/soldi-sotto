import { differenceInDays, endOfDay, startOfDay, subMonths, isWithinInterval } from "date-fns";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
} from "date-fns";

export const getPeriodRange = (period, customRange) => {
  const today = new Date();
  switch (period) {
    case "weekly":
      return { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) };
    case "daily":
      return { start: startOfDay(today), end: endOfDay(today) };
    case "annually":
    case "year":
    case "thisYear":
      return { start: startOfYear(today), end: endOfYear(today) };
    case "lastMonth": {
      const lastMonth = subMonths(today, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }
    case "last3Months":
      return { start: startOfMonth(subMonths(today, 2)), end: endOfMonth(today) };
    case "all":
      return { start: new Date(0), end: new Date() };
    case "custom":
      if (customRange?.from && customRange?.to) {
        return { start: new Date(customRange.from), end: new Date(customRange.to) };
      }
      return { start: startOfMonth(today), end: endOfMonth(today) };
    case "monthly":
    case "month":
    case "thisMonth":
    default:
      return { start: startOfMonth(today), end: endOfMonth(today) };
  }
};

export const calculateStats = (transactions = [], startDate, endDate) => {
  // Safe fallbacks if ranges are missing
  const safeStart = startDate ? startOfDay(startDate) : new Date(0);
  const safeEnd = endDate ? endOfDay(endDate) : new Date();

  let totalIncome = 0;
  let totalExpense = 0;
  const categories = {};
  const incomeTrend = [];
  const expenseTrend = [];

  // Filter transactions within range (assuming dates are normalized)
  const normalizedTransactions = transactions.filter((tx) => 
    tx.date && isWithinInterval(tx.date, { start: safeStart, end: safeEnd })
  );

  normalizedTransactions.forEach((tx) => {
    if (tx.type === "income") {
      totalIncome += tx.amount;
      incomeTrend.push({ x: tx.date, y: tx.amount });
    } else if (tx.type === "expense") {
      totalExpense += tx.amount;
      expenseTrend.push({ x: tx.date, y: tx.amount });
      if (tx.category) {
        categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
      }
    }
  });

  const daysCount = differenceInDays(safeEnd, safeStart) + 1;
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
    transactionCount: normalizedTransactions.length,
    categoryBreakdown: categories,
    topCategories: sortedCategories,
    incomeTrend,
    expenseTrend,
  };
};
