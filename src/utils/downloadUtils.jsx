import { format, startOfWeek, endOfWeek } from "date-fns";

export const sanitizeFilename = (str) => {
  if (!str) return "user";
  return str.replace(/[^a-z0-9_.-]/gi, "_").toLowerCase();
};

export const getUserName = (user) => {
  if (typeof user === "string") return user;
  return user?.displayName || user?.username || user?.email?.split("@")[0] || "user";
};

// Single source of truth for filename generation
export const generateExportFileName = (periodText, startDate, endDate, user, extension) => {
  const now = new Date();
  const userName = sanitizeFilename(getUserName(user));
  
  const timestamp = format(now, "yyyyMMdd-HHmm");
  const prefix = "report-soldisotto";
  
  // Format: report-soldisotto-[username]-[timestamp].[ext]
  
  return `${prefix}-${userName}-${timestamp}.${extension}`;
};
// Deprecated: generateExportFileName is used
export const generateCsvFileName = (periodText, startDate, endDate, user) => {
  return generateExportFileName(periodText, startDate, endDate, user, "csv");
};
