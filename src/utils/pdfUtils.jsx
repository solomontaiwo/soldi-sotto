import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  format,
  differenceInDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import formatCurrency from "./formatCurrency";

// Funzione per determinare il nome del periodo di riferimento
const periodOptions = (periodText, startDate, endDate) => {
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
      return "Periodo personalizzato";
    default:
      return "Periodo non specificato";
  }
};

const generateFileName = (periodText, startDate, endDate) => {
  const today = new Date();
  switch (periodText) {
    case "daily":
      return `report-soldisotto-${format(today, "yyyy-MM-dd")}.pdf`;
    case "weekly":
      return `report-soldisotto-${format(
        startOfWeek(today),
        "yyyy-MM-dd"
      )}-${format(endOfWeek(today), "yyyy-MM-dd")}.pdf`;
    case "monthly":
      return `report-soldisotto-${format(today, "yyyy-MM")}.pdf`;
    case "annually":
      return `report-soldisotto-${format(today, "yyyy")}.pdf`;
    case "custom":
      if (startDate && endDate) {
        return `report-soldisotto-${format(startDate, "yyyy-MM-dd")}-${format(
          endDate,
          "yyyy-MM-dd"
        )}.pdf`;
      }
      return `report-soldisotto-custom.pdf`;
    default:
      return `report-soldisotto.pdf`;
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
  endDate
) => {
  const doc = new jsPDF();
  const now = new Date();
  const centerX = 105;

  // Header e dettagli
  doc.addImage(logoUrl, "PNG", centerX - 15, 10, 30, 30);
  doc.link(centerX - 15, 10, 30, 30, { url: appUrl });
  doc.setFontSize(18);
  doc.text("Report Statistiche Finanziarie", centerX, 50, { align: "center" });
  doc.setFontSize(12);
  doc.text(
    `Data di generazione: ${format(now, "dd/MM/yyyy HH:mm")}`,
    centerX,
    58,
    { align: "center" }
  );
  doc.text(`Utente: ${currentUser.email}`, centerX, 64, { align: "center" });

  // Usa la funzione periodOptions per ottenere il testo del periodo
  const periodName = periodOptions(periodText, startDate, endDate);
  doc.text(`Periodo di riferimento: ${periodName}`, centerX, 70, {
    align: "center",
  });

  // Calcola il numero di giorni tra startDate ed endDate
  const daysCount =
    differenceInDays(endOfDay(endDate), startOfDay(startDate)) + 1;

  // Calcola la media giornaliera delle entrate e delle uscite
  const avgDailyIncome = daysCount > 0 ? stats.totalIncome / daysCount : 0;
  const avgDailyExpense = daysCount > 0 ? stats.totalExpense / daysCount : 0;

  // Tabella delle spese totali, entrate totali, saldo e media giornaliera
  doc.autoTable({
    startY: 85,
    head: [
      [
        "Entrate Totali",
        "Spese Totali",
        "Saldo",
        "Media Giornaliera Entrate",
        "Media Giornaliera Uscite",
      ],
    ],
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

  // Distribuzione delle spese per categoria
  doc.text(
    "Distribuzione delle Spese per Categoria (%)",
    14,
    doc.lastAutoTable.finalY + 10
  );
  const totalExpense = stats.totalExpense;
  const categoryDistribution = stats.topCategories.map((c) => [
    `${c.category.charAt(0).toUpperCase() + c.category.slice(1)}`,
    `${((c.amount / totalExpense) * 100).toFixed(2)}%`,
  ]);
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 15,
    head: [["Categoria", "Percentuale"]],
    body: categoryDistribution,
    margin: { bottom: 20 },
  });

  // Transazione media per categoria
  doc.text(
    "Transazione Media per Categoria",
    14,
    doc.lastAutoTable.finalY + 10
  );
  const averageTransactionPerCategory = stats.topCategories.map((c) => [
    `${c.category.charAt(0).toUpperCase() + c.category.slice(1)}`,
    formatCurrency(
      c.amount / transactions.filter((tx) => tx.category === c.category).length
    ),
  ]);
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 15,
    head: [["Categoria", "Importo Medio"]],
    body: averageTransactionPerCategory,
    margin: { bottom: 20 },
  });

  // Top 3 spese maggiori e minori
  const sortedExpenses = transactions
    .filter((tx) => tx.type === "expense")
    .sort((a, b) => b.amount - a.amount);
  const topExpenses = sortedExpenses.slice(0, 3);
  const lowestExpenses = sortedExpenses.slice(-3);

  doc.text("Top 3 Spese Maggiori", 14, doc.lastAutoTable.finalY + 10);
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 15,
    head: [["Data", "Descrizione", "Importo", "Categoria"]],
    body: topExpenses.map((tx) => [
      format(new Date(tx.date.seconds * 1000), "dd/MM/yyyy"),
      tx.description,
      formatCurrency(tx.amount),
      tx.category.charAt(0).toUpperCase() + tx.category.slice(1),
    ]),
    margin: { bottom: 20 },
  });

  doc.text("Top 3 Spese Minori", 14, doc.lastAutoTable.finalY + 10);
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 15,
    head: [["Data", "Descrizione", "Importo", "Categoria"]],
    body: lowestExpenses.map((tx) => [
      format(new Date(tx.date.seconds * 1000), "dd/MM/yyyy"),
      tx.description,
      formatCurrency(tx.amount),
      tx.category.charAt(0).toUpperCase() + tx.category.slice(1),
    ]),
    margin: { bottom: 20 },
  });

  // Aggiungi il piè di pagina solo all'ultima pagina
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(10);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    if (i === pageCount) {
      // Solo ultima pagina
      const pageHeight = doc.internal.pageSize.height;

      // Linea separatrice
      doc.setDrawColor(150); // Grigio per la linea
      doc.line(10, pageHeight - 30, 200, pageHeight - 30); // Linea orizzontale

      // Piè di pagina
      doc.setTextColor(100); // Colore del testo (grigio scuro)
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

  // Salva il file PDF
  const filename = generateFileName(periodText, startDate, endDate);
  doc.save(filename);
};
