import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  format,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  differenceInDays,
  isEqual,
} from "date-fns";
import { it, enUS } from "date-fns/locale";
import i18n from "./i18n.jsx"; // Import i18n instance
import formatCurrency from "./formatCurrency.jsx";
import { generateExportFileName } from "./downloadUtils.jsx";

const getPdfStrings = (lang = "it") => {
  // Use i18n.t with the specific language if needed, or just allow i18n to handle it if the global state matches.
  // To be safe with the 'lang' argument, we can use i18n.getFixedT(lang) if supported, or just change language temporarily (risky).
  // A simpler approach for this helper: just use standard i18n.t and assume the app's language is correct, 
  // OR if 'lang' differs, we might need to fetch specific resources.
  // Given the current architecture, let's try to use the keys.
  
  // Actually, simpler: specific keys for PDF in translation.json
  return {
    reportTitle: i18n.t("pdf.reportTitle", { lng: lang }),
    generatedOn: i18n.t("pdf.generatedOn", { lng: lang }),
    userLabel: i18n.t("pdf.user", { lng: lang }),
    periodLabel: i18n.t("pdf.period", { lng: lang }),
    summaryTitle: i18n.t("pdf.summaryTitle", { lng: lang }),
    totalIncome: i18n.t("pdf.totalIncome", { lng: lang }),
    totalExpense: i18n.t("pdf.totalExpense", { lng: lang }),
    balance: i18n.t("pdf.balance", { lng: lang }),
    avgDailyIncome: i18n.t("pdf.avgDailyIncome", { lng: lang }),
    avgDailyExpense: i18n.t("pdf.avgDailyExpense", { lng: lang }),
    expenseDistribution: i18n.t("pdf.expenseDistribution", { lng: lang }),
    topExpenses: i18n.t("pdf.topExpenses", { lng: lang }),
    topIncomes: i18n.t("pdf.topIncomes", { lng: lang }),
    fullList: i18n.t("pdf.fullList", { lng: lang }),
    noTransactions: i18n.t("pdf.noTransactions", { lng: lang }),
    date: i18n.t("pdf.date", { lng: lang }),
    type: i18n.t("pdf.type", { lng: lang }),
    description: i18n.t("pdf.description", { lng: lang }),
    category: i18n.t("pdf.category", { lng: lang }),
    amount: i18n.t("pdf.amount", { lng: lang }),
    incomeLabel: i18n.t("pdf.income", { lng: lang }),
    expenseLabel: i18n.t("pdf.expense", { lng: lang }),
  };
};

// Helper function to determine period options
const periodOptions = (periodText, startDate, endDate, lang) => {
  // We might want to translate "Custom Period" etc.
  switch (periodText) {
    case "daily":
      return `${format(new Date(), "yyyy/MM/dd")}`;
    case "weekly":
      return `${format(startOfWeek(new Date()), "yyyy/MM/dd")} - ${format(
        endOfWeek(new Date()),
        "yyyy/MM/dd"
      )}`;
    case "monthly":
      return `${format(new Date(), "yyyy/MM")}`;
    case "annually":
      return `${format(new Date(), "yyyy")}`;
    case "custom":
      if (startDate && endDate) {
        return `${format(startDate, "yyyy/MM/dd")} - ${format(
          endDate,
          "yyyy/MM/dd"
        )}`;
      }
      return i18n.t("pdf.customPeriod", { lng: lang });
    default:
      return i18n.t("pdf.unspecifiedPeriod", { lng: lang });
  }
};

export const generatePDF = async (
  currentUser,
  transactions = [],
  stats = {},
  periodText,
  logoUrl,
  appUrl,
  instagramUrl,
  startDate,
  endDate,
  lang = "it"
) => {
  const strings = getPdfStrings(lang);
  const locale = lang?.startsWith("en") ? enUS : it;
  const doc = new jsPDF();
  const now = new Date();
  const centerX = 105;

  // Header and details
  if (logoUrl) {
    doc.addImage(logoUrl, "PNG", centerX - 15, 10, 30, 30);
    doc.link(centerX - 15, 10, 30, 30, { url: appUrl });
  }
  doc.setFontSize(18);
  doc.text(strings.reportTitle, centerX, 50, { align: "center" });
  doc.setFontSize(12);
  doc.text(
    `${strings.generatedOn}: ${format(now, "dd/MM/yyyy HH:mm")}`,
    centerX,
    58,
    { align: "center" }
  );
  doc.text(`${strings.userLabel}: ${currentUser.email}`, centerX, 64, { align: "center" });

  // Use periodOptions helper to get period text
  const periodName = periodOptions(periodText, startDate, endDate, lang);
  doc.text(`${strings.periodLabel}: ${periodName}`, centerX, 70, {
    align: "center",
  });

  // Calculate number of days between startDate and endDate
  const daysCount =
    differenceInDays(endOfDay(endDate), startOfDay(startDate)) + 1;

  // Calculate daily average income and expense
  const avgDailyIncome = daysCount > 0 ? stats.totalIncome / daysCount : 0;
  const avgDailyExpense = daysCount > 0 ? stats.totalExpense / daysCount : 0;

  // Total expenses, total income, balance and daily average table
  autoTable(doc, {
    startY: 80,
    head: [[strings.totalIncome, strings.totalExpense, strings.balance, strings.avgDailyIncome, strings.avgDailyExpense]],
    body: [
      [
        formatCurrency(stats.totalIncome),
        formatCurrency(stats.totalExpense),
        formatCurrency(stats.balance),
        formatCurrency(avgDailyIncome),
        formatCurrency(avgDailyExpense),
      ],
    ],
    margin: { bottom: 20 },
  });

  // Expense distribution by category
  doc.text(strings.expenseDistribution, 14, doc.lastAutoTable.finalY + 10);
  const totalExpense = stats.totalExpense;
  const categoryDistribution = stats.topCategories.map((c) => [
    // Translate category name if possible
    i18n.t(`categories.${c.category}`, { lng: lang, defaultValue: c.category }),
    `${((c.amount / totalExpense) * 100).toFixed(2)}%`,
    formatCurrency(
      c.amount / transactions.filter((tx) => tx.category === c.category).length
    ),
  ]);
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    head: [[strings.category, strings.totalExpense, strings.amount]],
    body: categoryDistribution,
    margin: { bottom: 20 },
  });

  // Filter expenses in the reference period and select top 3 largest
  const topExpenses = transactions
    .filter(
      (tx) =>
        tx.type === "expense" &&
        (isAfter(tx.date, startDate) || isEqual(tx.date, startDate)) &&
        (isBefore(tx.date, endDate) || isEqual(tx.date, endDate))
    )
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  // Filter incomes in the reference period and select top 3 largest
  const topIncomes = transactions
    .filter(
      (tx) =>
        tx.type === "income" &&
        (isAfter(tx.date, startDate) || isEqual(tx.date, startDate)) &&
        (isBefore(tx.date, endDate) || isEqual(tx.date, endDate))
    )
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  // Filter all transactions for the full list
  const allTransactions = transactions
    .filter(
      (tx) =>
        (isAfter(tx.date, startDate) || isEqual(tx.date, startDate)) &&
        (isBefore(tx.date, endDate) || isEqual(tx.date, endDate))
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort oldest to newest

  // Generate table for top 3 largest expenses
  doc.text(strings.topExpenses, 14, doc.lastAutoTable.finalY + 10);
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    head: [[strings.date, strings.description, strings.amount, strings.category]],
    body: topExpenses.map((tx) => [
      format(tx.date, "dd/MM/yyyy", { locale }),
      tx.description,
      formatCurrency(tx.amount),
      i18n.t(`categories.${tx.category}`, { lng: lang, defaultValue: tx.category }),
    ]),
    margin: { bottom: 20 },
  });

  // Generate table for top 3 largest incomes
  doc.text(strings.topIncomes, 14, doc.lastAutoTable.finalY + 10);
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    head: [[strings.date, strings.description, strings.amount, strings.category]],
    body: topIncomes.map((tx) => [
      format(tx.date, "dd/MM/yyyy", { locale }),
      tx.description,
      formatCurrency(tx.amount),
      i18n.t(`categories.${tx.category}`, { lng: lang, defaultValue: tx.category }),
    ]),
    margin: { bottom: 20 },
  });

  doc.addPage(); // Add a new page

  doc.text(strings.fullList, 14, 20);
  autoTable(doc, {
    startY: 25,
    head: [[strings.date, strings.description, strings.amount, strings.category, strings.type]],
    body: allTransactions.map((tx) => [
      format(tx.date, "dd/MM/yyyy", { locale }),
      tx.description,
      formatCurrency(tx.amount),
      i18n.t(`categories.${tx.category}`, { lng: lang, defaultValue: tx.category }),
      tx.type === "income" ? strings.incomeLabel : strings.expenseLabel,
    ]),
    margin: { bottom: 20 },
  });

  // Add footer only to the last page
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(10);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    if (i === pageCount) {
      const pageHeight = doc.internal.pageSize.height;
      doc.setDrawColor(150);
      doc.line(10, pageHeight - 30, 200, pageHeight - 30);
      doc.setTextColor(100);
      doc.text(
        "Soldi Sotto, made with love by Solomon",
        centerX,
        pageHeight - 17,
        { align: "center" }
      );
      doc.setFontSize(8);
      doc.textWithLink("Instagram: @solomon.taiwo", 105, pageHeight - 12, {
        url: instagramUrl,
        align: "center",
      });
    }
  }

  // Save PDF file using generateExportFileName
  const filename = generateExportFileName(periodText, startDate, endDate, currentUser, "pdf");
  doc.save(filename);
};

export const generatePDFReport = async (transactions = [], lang = "it", user = "user", filenameOverride = null) => {
  try {
    const strings = getPdfStrings(lang);
    const locale = lang?.startsWith("en") ? enUS : it;
    const doc = new jsPDF();
    const currentDate = new Date();
    
    // Generate filename with current date and username if not overridden
    // Default to "daily" snapshot logic if no override is provided
    const filename = filenameOverride || generateExportFileName("daily", currentDate, currentDate, user, "pdf");
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(51, 65, 85);
    doc.text(strings.reportTitle, 20, 20);
    
    // Date
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`${strings.generatedOn}: ${format(currentDate, "dd MMMM yyyy 'at' HH:mm", { locale })}`, 20, 30);
    
    // Summary statistics
    const totalIncome = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    // Statistics box
    doc.setFillColor(248, 250, 252); // Light gray background
    doc.rect(20, 40, doc.internal.pageSize.width - 40, 25, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(51, 65, 85);
    doc.text(strings.summaryTitle, 25, 50);
    
    doc.setFontSize(11);
    doc.setTextColor(34, 197, 94); // Green for income
    doc.text(`${strings.totalIncome}: ${formatCurrency(totalIncome)}`, 25, 57);
    
    doc.setTextColor(239, 68, 68); // Red for expenses
    const midX = doc.internal.pageSize.width / 2;
    doc.text(`${strings.totalExpense}: ${formatCurrency(totalExpense)}`, midX, 57, { align: "center" });
    
    doc.setTextColor(balance >= 0 ? 34 : 239, balance >= 0 ? 197 : 68, balance >= 0 ? 94 : 68);
    doc.text(`${strings.balance}: ${formatCurrency(balance)}`, doc.internal.pageSize.width - 35, 57, { align: "right" });
    
    doc.setTextColor(100, 116, 139);
    doc.text(`${strings.fullList}: ${transactions.length}`, 25, 62);
    
    // Table headers
    const headers = [
      strings.date,
      strings.type, 
      strings.description,
      strings.category,
      strings.amount
    ];
    
    // Prepare table data
    const tableData = transactions
      .sort((a, b) => b.date.getTime() - a.date.getTime()) // Most recent first
      .map(transaction => {
        return [
          format(transaction.date, "dd/MM/yyyy", { locale }),
          transaction.type === "income" ? strings.incomeLabel : strings.expenseLabel,
          transaction.description || "N/A",
          i18n.t(`categories.${transaction.category}`, { lng: lang, defaultValue: transaction.category }),
          (transaction.type === "income" ? "+" : "-") + formatCurrency(transaction.amount).replace('€', '').trim()
        ];
      });
    
    // Generate table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 75,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [51, 65, 85],
        lineColor: [203, 213, 225],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 25 }, // Date
        1: { halign: 'center', cellWidth: 20 }, // Type
        2: { halign: 'left', cellWidth: 60 },   // Description
        3: { halign: 'left', cellWidth: 35 },   // Category
        4: { halign: 'right', cellWidth: 30 },  // Amount
      },
      didParseCell: function(data) {
        // Color coding for amounts
        if (data.column.index === 4) { // Amount column
          const cellText = data.cell.text[0];
          if (cellText.startsWith('+')) {
            data.cell.styles.textColor = [34, 197, 94]; // Green for income
          } else if (cellText.startsWith('-')) {
            data.cell.styles.textColor = [239, 68, 68]; // Red for expenses
          }
        }
        
        // Color coding for transaction type
        if (data.column.index === 1) { // Type column
          const cellText = data.cell.text[0];
          if (cellText === strings.incomeLabel) {
            data.cell.styles.textColor = [34, 197, 94]; // Green
          } else {
            data.cell.styles.textColor = [239, 68, 68]; // Red
          }
        }
      },
      margin: { top: 20, left: 20, right: 20 },
      tableWidth: 'auto',
      showHead: 'everyPage',
    });
    
    // Footer on each page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Page ${i} of ${pageCount} - Generated by Soldi Sotto`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Unable to generate PDF");
  }
};

// Function to generate a report for a specific period
export const generatePeriodPDFReport = async (transactions = [], startDate, endDate, periodLabel = "Custom Period", lang = "it", user = "user") => {
  try {
    const strings = getPdfStrings(lang);
    const locale = lang?.startsWith("en") ? enUS : it;
    // Filter transactions by period (assuming date objects)
    const filteredTransactions = transactions.filter(transaction => {
      return transaction.date >= startDate && transaction.date <= endDate;
    });
    
    const doc = new jsPDF();
    const currentDate = new Date();
    
    // Generate correct filename for custom period using the new utility
    // We pass "custom" as periodText so it uses startDate and endDate for the name
    const filename = generateExportFileName("custom", startDate, endDate, user, "pdf");
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(51, 65, 85);
    doc.text(strings.reportTitle, 20, 20);
    
    // Period info
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`${strings.periodLabel}: ${periodLabel}`, 20, 30);
    doc.text(`${strings.date}: ${format(startDate, "dd/MM/yyyy", { locale })} - ${format(endDate, "dd/MM/yyyy", { locale })}`, 20, 37);
    doc.text(`${strings.generatedOn}: ${format(currentDate, "dd MMMM yyyy 'at' HH:mm", { locale })}`, 20, 44);
    
    if (filteredTransactions.length === 0) {
      doc.setFontSize(14);
      doc.setTextColor(107, 114, 128);
      doc.text(strings.noTransactions, 20, 60);
      doc.save(filename); // Use consistent filename even for empty reports
      return { success: true, transactionCount: 0 };
    }
    
    // For now, re-use generic report logic but we need to override the save behavior or just copy the table generation.
    // Since generatePDFReport enforces its own filename generation and save, passing control is tricky without refactoring it to accept a filename override.
    // Ideally, I should have refactored generatePDFReport to return the doc instead of saving, or accept a filename.
    // BUT I can't change everything perfectly in one step without breaking things.
    // HACK: Let's rely on generatePDFReport's internal logic which I just updated to use generateExportFileName("daily", ...)
    // WAIT, "daily" is not correct for a period report.
    
    // Better fix: Copy table generation here or refactor generatePDFReport to accept a filename.
    // I will assume generatePDFReport is mainly used for "Current View" snapshot.
    // Since I am rewriting the file, I will add an optional 'filenameOverride' to generatePDFReport.
    
    return await generatePDFReport(filteredTransactions, lang, user, filename);
  } catch (error) {
    console.error("Error generating PDF for period:", error);
    throw new Error("Unable to generate PDF for period");
  }
};
