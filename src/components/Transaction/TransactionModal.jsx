import { useState, useEffect, useCallback } from "react";
import { useUnifiedTransactions } from "./UnifiedTransactionProvider";
import { useCategories } from "../../utils/categories";
import { useNotification } from "../../utils/notificationUtils";
import { useMediaQuery } from "react-responsive";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { FiTrendingUp, FiTrendingDown, FiSave, FiPlus } from "react-icons/fi";

const TransactionModal = ({ show, onClose, onSubmit, transaction }) => {
  TransactionModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
    transaction: PropTypes.object,
  };

  const isEdit = !!transaction;
  const { addTransaction, updateTransaction } = useUnifiedTransactions();
  const { expenseCategories, incomeCategories } = useCategories();
  const notification = useNotification();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { t } = useTranslation();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    type: transaction?.type || "expense",
    amount: transaction?.amount?.toString() || "",
    description: transaction?.description || "",
    date: transaction?.date
      ? (transaction.date instanceof Date
          ? transaction.date
          : transaction.date?.toDate?.() || new Date(transaction.date)
        ).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    category: transaction?.category || "",
  });

  const updateCategories = useCallback(
    (type) => {
      const list = type === "expense" ? expenseCategories : incomeCategories;
      setCategories(list);
      if (!formData.category || !list.find((c) => c.value === formData.category)) {
        setFormData((prev) => ({ ...prev, category: list[0]?.value || "" }));
      }
    },
    [expenseCategories, incomeCategories, formData.category]
  );

  useEffect(() => {
    updateCategories(formData.type);
  }, [formData.type, updateCategories]);

  useEffect(() => {
    if (show && !isEdit) {
      setFormData({
        type: "expense",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        category: expenseCategories[0]?.value || "",
      });
    }
    if (show && isEdit && transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        description: transaction.description,
        date: (transaction.date instanceof Date
          ? transaction.date
          : transaction.date?.toDate?.() || new Date(transaction.date)
        ).toISOString().split("T")[0],
        category: transaction.category,
      });
    }
  }, [show, isEdit, transaction, expenseCategories]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const normalizedAmount = formData.amount.replace(",", ".");
    const amountValue = parseFloat(normalizedAmount);
    if (isNaN(amountValue) || amountValue <= 0) {
      notification.error("Inserisci un importo valido");
      return;
    }

    let success = false;
    if (isEdit) {
      success = await (onSubmit
        ? onSubmit(formData)
        : updateTransaction(transaction.id, {
            type: formData.type,
            amount: amountValue,
            description: formData.description,
            date: new Date(formData.date),
            category: formData.category,
          }));
    } else {
      success = await (onSubmit
        ? onSubmit(formData)
        : addTransaction({
            type: formData.type,
            amount: amountValue,
            description: formData.description,
            date: new Date(formData.date),
            category: formData.category,
          }));
    }
    if (success) onClose();
  };

  return (
    <Dialog open={show} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-card/95 text-foreground border border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {isEdit ? "✏️" : "⚡"}
            </span>
            {isEdit ? t("transactionModal.editTitle") : t("transactionModal.newTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t("transactionModal.editSubtitle") : t("transactionModal.newSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={formData.type === "expense" ? "destructive" : "outline"}
              className="w-full justify-center"
              onClick={() => setFormData((prev) => ({ ...prev, type: "expense" }))}
            >
              <FiTrendingDown className="mr-2 h-4 w-4" />
              {t("transactionModal.expense")}
            </Button>
            <Button
              type="button"
              variant={formData.type === "income" ? "default" : "outline"}
              className="w-full justify-center"
              onClick={() => setFormData((prev) => ({ ...prev, type: "income" }))}
            >
              <FiTrendingUp className="mr-2 h-4 w-4" />
              {t("transactionModal.income")}
            </Button>
          </div>

          <div className={`grid gap-4 ${isMobile ? "" : "grid-cols-2"}`}>
            <div className="space-y-2">
              <Label>{t("transactionModal.amount")}</Label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder={t("transactionModal.amountPlaceholder")}
                value={formData.amount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.,]/g, "");
                  const parts = value.split(/[,.]/);
                  if (parts.length <= 2) setFormData((prev) => ({ ...prev, amount: value }));
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value && value.includes(",")) {
                    const normalizedValue = value.replace(",", ".");
                    setFormData((prev) => ({ ...prev, amount: normalizedValue }));
                  }
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t("transactionModal.date")}</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("transactionModal.description")}</Label>
            <Input
              type="text"
              placeholder={t("transactionModal.descriptionPlaceholder")}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{t("transactionModal.category")}</Label>
            <Select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              required
            >
              <option value="">{t("transactionModal.selectCategory")}</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("transactionModal.cancel")}
            </Button>
            <Button
              type="submit"
              className="gap-2"
              disabled={!formData.amount || !formData.description || !formData.category}
            >
              {isEdit ? <FiSave className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
              {isEdit ? t("transactionModal.saveChanges") : t("transactionModal.addButton", { type: formData.type === "expense" ? t("transactionModal.expense") : t("transactionModal.income") })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;
