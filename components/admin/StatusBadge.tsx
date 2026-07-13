const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "În așteptare",
  CONFIRMED: "Confirmată",
  SHIPPED: "Expediată",
  DELIVERED: "Livrată",
  CANCELLED: "Anulată",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  UNPAID: "bg-slate-100 text-slate-600",
  PAID: "bg-green-50 text-green-700",
  FAILED: "bg-red-50 text-red-700",
  REFUNDED: "bg-purple-50 text-purple-700",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: "Neplătită",
  PAID: "Plătită",
  FAILED: "Eșuată",
  REFUNDED: "Rambursată",
};

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge className={ORDER_STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <Badge className={PAYMENT_STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"}>
      {PAYMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS };
