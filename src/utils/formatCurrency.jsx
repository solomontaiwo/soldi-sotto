const formatCurrency = (value, locale = "it-IT", currency = "EUR") =>
  value.toLocaleString(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default formatCurrency;
