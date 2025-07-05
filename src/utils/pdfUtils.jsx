import jsPDF from "jspdf";
import "jspdf-autotable";
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
import { it } from "date-fns/locale";

import formatCurrency from "./formatCurrency";

// Funzione helper per determinare le opzioni del periodo
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
    startY: 80,
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
    "Distribuzione delle spese e importo medio per categoria",
    14,
    doc.lastAutoTable.finalY + 10
  );
  const totalExpense = stats.totalExpense;
  const categoryDistribution = stats.topCategories.map((c) => [
    `${c.category.charAt(0).toUpperCase() + c.category.slice(1)}`,
    `${((c.amount / totalExpense) * 100).toFixed(2)}%`,
    formatCurrency(
      c.amount / transactions.filter((tx) => tx.category === c.category).length
    ),
  ]);
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 15,
    head: [["Categoria", "Distribuzione Percentuale", "Importo Medio"]],
    body: categoryDistribution,
    margin: { bottom: 20 },
  });

  // Filtra le spese nel periodo di riferimento e seleziona le top 3 maggiori
  const topExpenses = transactions
    .filter(
      (tx) =>
        tx.type === "expense" &&
        (isAfter(tx.date.toDate(), startDate) ||
          isEqual(tx.date.toDate(), startDate)) &&
        (isBefore(tx.date.toDate(), endDate) ||
          isEqual(tx.date.toDate(), endDate))
    )
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  // Filtra le entrate nel periodo di riferimento e seleziona le top 3 maggiori
  const topIncomes = transactions
    .filter(
      (tx) =>
        tx.type === "income" &&
        (isAfter(tx.date.toDate(), startDate) ||
          isEqual(tx.date.toDate(), startDate)) &&
        (isBefore(tx.date.toDate(), endDate) ||
          isEqual(tx.date.toDate(), endDate))
    )
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  // Filtra tutte le transazioni per l'elenco completo
  const allTransactions = transactions
    .filter(
      (tx) =>
        (isAfter(tx.date.toDate(), startDate) ||
          isEqual(tx.date.toDate(), startDate)) &&
        (isBefore(tx.date.toDate(), endDate) ||
          isEqual(tx.date.toDate(), endDate))
    )
    .sort((a, b) => a.date.seconds - b.date.seconds); // Ordina dalla meno recente alla più recente

  // Generazione della tabella per le top 3 spese maggiori
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

  // Generazione della tabella per le top 3 entrate maggiori
  doc.text("Top 3 Entrate Maggiori", 14, doc.lastAutoTable.finalY + 10);
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 15,
    head: [["Data", "Descrizione", "Importo", "Categoria"]],
    body: topIncomes.map((tx) => [
      format(new Date(tx.date.seconds * 1000), "dd/MM/yyyy"),
      tx.description,
      formatCurrency(tx.amount),
      tx.category.charAt(0).toUpperCase() + tx.category.slice(1),
    ]),
    margin: { bottom: 20 },
  });

  doc.addPage(); // Aggiungi una nuova pagina

  doc.text("Elenco Completo delle Transazioni", 14, 20);
  doc.autoTable({
    startY: 25,
    head: [["Data", "Descrizione", "Importo", "Categoria", "Tipo"]],
    body: allTransactions.map((tx) => [
      format(new Date(tx.date.seconds * 1000), "dd/MM/yyyy"),
      tx.description,
      formatCurrency(tx.amount),
      tx.category.charAt(0).toUpperCase() + tx.category.slice(1),
      tx.type === "income" ? "Entrata" : "Uscita",
    ]),
    margin: { bottom: 20 },
  });

  // Aggiungi il piè di pagina solo all'ultima pagina
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

  // Salva il file PDF
  const filename = generateFileName(periodText, startDate, endDate);
  doc.save(filename);
};

export const generatePDFReport = async (transactions = []) => {
  try {
    const doc = new jsPDF();
    const currentDate = new Date();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(51, 65, 85); // Dark slate blue
    doc.text("Soldi Sotto - Report Transazioni", 20, 20);
    
    // Date
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139); // Slate gray
    doc.text(`Generato il: ${format(currentDate, "dd MMMM yyyy 'alle' HH:mm", { locale: it })}`, 20, 30);
    
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
    doc.text("Riepilogo Finanziario", 25, 50);
    
    doc.setFontSize(11);
    doc.setTextColor(34, 197, 94); // Green for income
    doc.text(`Entrate Totali: ${formatCurrency(totalIncome)}`, 25, 57);
    
    doc.setTextColor(239, 68, 68); // Red for expenses
    doc.text(`Uscite Totali: ${formatCurrency(totalExpense)}`, doc.internal.pageSize.width - 100, 57);
    
    doc.setTextColor(balance >= 0 ? 34 : 239, balance >= 0 ? 197 : 68, balance >= 0 ? 94 : 68);
    doc.text(`Bilancio: ${formatCurrency(balance)}`, doc.internal.pageSize.width - 100, 57);
    
    doc.setTextColor(100, 116, 139);
    doc.text(`Totale Transazioni: ${transactions.length}`, 25, 62);
    
    // Table headers
    const headers = [
      "Data",
      "Tipo", 
      "Descrizione",
      "Categoria",
      "Importo (€)"
    ];
    
    // Prepare table data
    const tableData = transactions
      .sort((a, b) => {
        const dateA = a.date.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA; // Most recent first
      })
      .map(transaction => {
        const transactionDate = transaction.date.toDate 
          ? transaction.date.toDate() 
          : new Date(transaction.date);
        
        return [
          format(transactionDate, "dd/MM/yyyy", { locale: it }),
          transaction.type === "income" ? "Entrata" : "Spesa",
          transaction.description || "N/A",
          transaction.category || "N/A",
          (transaction.type === "income" ? "+" : "-") + formatCurrency(transaction.amount).replace('€', '').trim()
        ];
      });
    
    // Generate table
    doc.autoTable({
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
        0: { halign: 'center', cellWidth: 25 }, // Data
        1: { halign: 'center', cellWidth: 20 }, // Tipo
        2: { halign: 'left', cellWidth: 60 },   // Descrizione
        3: { halign: 'left', cellWidth: 35 },   // Categoria
        4: { halign: 'right', cellWidth: 30 },  // Importo
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
          if (cellText === 'Entrata') {
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
        `Pagina ${i} di ${pageCount} - Generato da Soldi Sotto`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Generate filename with current date
    const filename = `soldi-sotto-report-${format(currentDate, "yyyy-MM-dd-HHmm")}.pdf`;
    
    // Save the PDF
    doc.save(filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error("Errore nella generazione del PDF:", error);
    throw new Error("Impossibile generare il PDF");
  }
};

// Funzione per generare un report per periodo specifico
export const generatePeriodPDFReport = async (transactions = [], startDate, endDate, periodLabel = "Periodo Personalizzato") => {
  try {
    // Filter transactions by period
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = transaction.date.toDate 
        ? transaction.date.toDate() 
        : new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
    
    const doc = new jsPDF();
    const currentDate = new Date();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(51, 65, 85);
    doc.text("Soldi Sotto - Report per Periodo", 20, 20);
    
    // Period info
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Periodo: ${periodLabel}`, 20, 30);
    doc.text(`Dal ${format(startDate, "dd/MM/yyyy", { locale: it })} al ${format(endDate, "dd/MM/yyyy", { locale: it })}`, 20, 37);
    doc.text(`Generato il: ${format(currentDate, "dd MMMM yyyy 'alle' HH:mm", { locale: it })}`, 20, 44);
    
    if (filteredTransactions.length === 0) {
      doc.setFontSize(14);
      doc.setTextColor(107, 114, 128);
      doc.text("Nessuna transazione trovata per il periodo selezionato.", 20, 60);
      doc.save(`soldi-sotto-periodo-${format(currentDate, "yyyy-MM-dd-HHmm")}.pdf`);
      return { success: true, transactionCount: 0 };
    }
    
    // Use the main function logic for the filtered transactions
    return await generatePDFReport(filteredTransactions);
  } catch (error) {
    console.error("Errore nella generazione del PDF per periodo:", error);
    throw new Error("Impossibile generare il PDF per il periodo");
  }
};
