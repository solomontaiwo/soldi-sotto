import { differenceInDays, endOfDay, startOfDay } from "date-fns";
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
      return { start: startOfYear(today), end: endOfYear(today) };
    case "all":
      return { start: new Date(0), end: new Date() };
    case "custom":
      if (customRange?.from && customRange?.to) {
        return { start: new Date(customRange.from), end: new Date(customRange.to) };
      }
      return { start: startOfMonth(today), end: endOfMonth(today) };
    case "monthly":
    case "month":
    default:
      return { start: startOfMonth(today), end: endOfMonth(today) };
  }
};

const getSafeDate = (dateInput) => {
  if (!dateInput) return null;
  if (dateInput.toDate) return dateInput.toDate();
  if (dateInput.seconds) return new Date(dateInput.seconds * 1000);
  const parsed = new Date(dateInput);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export const calculateStats = (transactions = [], startDate, endDate) => {
  const safeStart = startDate ? startOfDay(startDate) : null;
  const safeEnd = endDate ? endOfDay(endDate) : null;

  if (!safeStart || !safeEnd) {
    return {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      dailyAverageExpense: 0,
      transactionCount: 0,
      categoryBreakdown: {},
      topCategories: [],
      incomeTrend: [],
      expenseTrend: [],
    };
  }

  let totalIncome = 0;
  let totalExpense = 0;
  const categories = {};
  const incomeTrend = [];
  const expenseTrend = [];

  const normalizedTransactions = transactions
    .map((tx) => ({
      ...tx,
      date: getSafeDate(tx.date),
    }))
    .filter((tx) => tx.date);

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
