import { cn } from "../../lib/utils";
import PropTypes from "prop-types";

export function Badge({ className, children, variant = "secondary", ...props }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const styles = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border text-foreground",
    success: "bg-emerald-500/15 text-emerald-600",
    danger: "bg-rose-500/15 text-rose-600",
  };

  return (
    <span className={cn(base, styles[variant], className)} {...props}>
      {children}
    </span>
  );
}

Badge.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  variant: PropTypes.oneOf(["default", "secondary", "outline", "success", "danger"]),
};
