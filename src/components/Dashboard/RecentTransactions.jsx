import { FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import formatCurrency from "../../utils/formatCurrency";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Button } from "../ui/button";

const RecentTransactions = ({ transactions = [], loading = false }) => {
  RecentTransactions.propTypes = {
    transactions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        amount: PropTypes.number.isRequired,
        type: PropTypes.oneOf(["income", "expense"]).isRequired,
        date: PropTypes.object.isRequired,
        category: PropTypes.string,
      })
    ),
    loading: PropTypes.bool,
  };

  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { t } = useTranslation();

  const recentTransactions = [...transactions]
    .sort((a, b) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  const formatDate = (date) => {
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getCategoryLabel = (category) => {
    if (!category) return "";
    return t("categories." + category) || category;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton circle width={40} height={40} />
            <div className="flex-1">
              <Skeleton height={16} width={120} />
              <Skeleton height={12} width={80} />
            </div>
            <Skeleton height={18} width={60} />
          </div>
        ))}
      </div>
    );
  }

  if (recentTransactions.length === 0) {
    return (
      <div className="text-center space-y-3">
        <p className="text-muted-foreground">{t("recentTransactions.emptyDescription")}</p>
        <Button onClick={() => navigate("/transactions")} size={isMobile ? "sm" : "default"}>
          {t("recentTransactions.addFirst")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentTransactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between rounded-xl border border-border bg-card/70 p-3 shadow-sm"
          onClick={() => navigate("/transactions")}
        >
          <div className="flex items-center gap-3">
            <div className="space-y-1">
              <div className="font-semibold text-sm">{transaction.description}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <span>{formatDate(transaction.date)}</span>
                {transaction.category && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{getCategoryLabel(transaction.category)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className={`text-sm font-semibold ${transaction.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
            {transaction.type === "income" ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </div>
        </div>
      ))}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => navigate("/transactions")} className="gap-1 text-primary">
          {t("recentTransactions.viewAll")}
          <FiArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default RecentTransactions;
